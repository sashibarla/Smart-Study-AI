import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, UploadedFile, Quiz, QuizResult, StudyProgress
from app.schemas.schemas import QuizGenerateRequest, QuizOut, QuizSubmitRequest, QuizResultOut
from app.api.auth import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/quiz", tags=["AI Quiz System"])

@router.post("/generate")
async def generate_quiz_endpoint(
    req: QuizGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = req.custom_content or ""
    subject = req.subject or "Computer Science"

    if req.file_id:
        db_file = db.query(UploadedFile).filter(UploadedFile.id == req.file_id, UploadedFile.user_id == current_user.id).first()
        if db_file:
            content = db_file.extracted_text
            subject = db_file.subject

    # Generate questions using AI
    questions = await ai_service.generate_quiz(
        text=content,
        subject=subject,
        topic=req.topic or "Core Concepts",
        difficulty=req.difficulty or "Medium",
        quiz_type=req.quiz_type or "Mixed",
        num_questions=req.num_questions or 5
    )

    quiz = Quiz(
        user_id=current_user.id,
        file_id=req.file_id,
        title=f"{subject} - {req.topic or 'Mastery'} Quiz ({req.difficulty})",
        subject=subject,
        topic=req.topic or "Core Concepts",
        difficulty=req.difficulty or "Medium",
        quiz_type=req.quiz_type or "Mixed",
        num_questions=len(questions),
        questions_json=json.dumps(questions)
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return {
        "id": quiz.id,
        "title": quiz.title,
        "subject": quiz.subject,
        "topic": quiz.topic,
        "difficulty": quiz.difficulty,
        "quiz_type": quiz.quiz_type,
        "num_questions": quiz.num_questions,
        "questions": questions,
        "created_at": quiz.created_at
    }

@router.get("/list")
def get_user_quizzes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quizzes = db.query(Quiz).filter(Quiz.user_id == current_user.id).order_by(Quiz.created_at.desc()).all()
    results = []
    for q in quizzes:
        results.append({
            "id": q.id,
            "title": q.title,
            "subject": q.subject,
            "topic": q.topic,
            "difficulty": q.difficulty,
            "quiz_type": q.quiz_type,
            "num_questions": q.num_questions,
            "questions": json.loads(q.questions_json),
            "created_at": q.created_at
        })
    return results

@router.get("/{quiz_id}")
def get_single_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    
    return {
        "id": quiz.id,
        "title": quiz.title,
        "subject": quiz.subject,
        "topic": quiz.topic,
        "difficulty": quiz.difficulty,
        "quiz_type": quiz.quiz_type,
        "num_questions": quiz.num_questions,
        "questions": json.loads(quiz.questions_json),
        "created_at": quiz.created_at
    }

@router.post("/submit", response_model=QuizResultOut)
def submit_quiz_endpoint(
    req: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).filter(Quiz.id == req.quiz_id, Quiz.user_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    questions: List[Dict[str, Any]] = json.loads(quiz.questions_json)
    user_answers = req.answers
    
    score = 0
    total = len(questions)
    breakdown = []
    topic_scores = {}

    for q in questions:
        q_id_str = str(q["id"])
        selected_answer = user_answers.get(q_id_str, "")
        correct_answer = q.get("correct_answer", "")
        
        # Check correctness (case insensitive trim or direct match)
        is_correct = selected_answer.strip().lower() == correct_answer.strip().lower()
        if is_correct:
            score += 1

        topic = q.get("topic", "General")
        if topic not in topic_scores:
            topic_scores[topic] = {"correct": 0, "total": 0}
        topic_scores[topic]["total"] += 1
        if is_correct:
            topic_scores[topic]["correct"] += 1

        breakdown.append({
            "question_id": q["id"],
            "question": q["question"],
            "selected_answer": selected_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
            "topic": topic
        })

    percentage = round((score / total * 100) if total > 0 else 0, 1)

    # Compute topic performance percentage
    topic_perf = {}
    for t, data in topic_scores.items():
        topic_perf[t] = round((data["correct"] / data["total"]) * 100, 1)

    # Generate AI Feedback
    if percentage >= 80:
        feedback = f"Outstanding work! You scored {score}/{total} ({percentage}%). You demonstrated strong conceptual clarity on {quiz.subject}."
    elif percentage >= 60:
        feedback = f"Good effort! You scored {score}/{total} ({percentage}%). Review the flagged incorrect topics below and attempt revision sessions."
    else:
        feedback = f"You scored {score}/{total} ({percentage}%). We recommend re-reading the summarized notes for {quiz.subject} before retrying."

    # Save result
    quiz_result = QuizResult(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=score,
        total_questions=total,
        percentage=percentage,
        answers_json=json.dumps(user_answers),
        time_spent_seconds=req.time_spent_seconds or 120,
        ai_feedback=feedback,
        topic_performance_json=json.dumps(topic_perf)
    )
    db.add(quiz_result)

    # Update progress
    progress = db.query(StudyProgress).filter(StudyProgress.user_id == current_user.id).first()
    if progress:
        progress.topics_completed_count += 1
        progress.total_study_minutes += max(5, int((req.time_spent_seconds or 120) / 60))

    db.commit()
    db.refresh(quiz_result)

    return {
        "id": quiz_result.id,
        "quiz_id": quiz.id,
        "score": score,
        "total_questions": total,
        "percentage": percentage,
        "time_spent_seconds": quiz_result.time_spent_seconds,
        "ai_feedback": feedback,
        "topic_performance": topic_perf,
        "answers_breakdown": breakdown,
        "created_at": quiz_result.created_at
    }
