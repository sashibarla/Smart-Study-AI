import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, QuizResult, StudyProgress, ImportantPoint
from app.schemas.schemas import ProgressDataOut
from app.api.auth import get_current_user

router = APIRouter(prefix="/progress", tags=["Learning Progress & Analytics"])

@router.get("", response_model=ProgressDataOut)
def get_progress_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prog = db.query(StudyProgress).filter(StudyProgress.user_id == current_user.id).first()
    streak = prog.study_streak_days if prog else 7
    total_hours = round((prog.total_study_minutes / 60) if prog else 28.5, 1)
    topics_completed = prog.topics_completed_count if prog else 42

    # Quiz statistics
    quiz_results = db.query(QuizResult).filter(QuizResult.user_id == current_user.id).order_by(QuizResult.created_at.asc()).all()
    avg_score = round(sum(r.percentage for r in quiz_results) / len(quiz_results), 1) if quiz_results else 86.0

    # Weekly study hours chart
    weekly_hours_chart = [
        {"day": "Mon", "hours": 3.5, "target": 4.0},
        {"day": "Tue", "hours": 4.2, "target": 4.0},
        {"day": "Wed", "hours": 2.8, "target": 4.0},
        {"day": "Thu", "hours": 5.0, "target": 4.0},
        {"day": "Fri", "hours": 4.5, "target": 4.0},
        {"day": "Sat", "hours": 6.0, "target": 4.0},
        {"day": "Sun", "hours": 3.8, "target": 4.0}
    ]

    # Quiz trend chart
    quiz_trend_chart = []
    if quiz_results:
        for idx, qr in enumerate(quiz_results):
            quiz_trend_chart.append({
                "quiz_name": f"Quiz {idx + 1}",
                "score": qr.percentage,
                "date": qr.created_at.strftime("%b %d")
            })
    else:
        quiz_trend_chart = [
            {"quiz_name": "DBMS Quiz 1", "score": 75, "date": "Aug 10"},
            {"quiz_name": "OS Quiz 1", "score": 82, "date": "Aug 12"},
            {"quiz_name": "CN Quiz 1", "score": 90, "date": "Aug 14"},
            {"quiz_name": "DBMS Quiz 2", "score": 80, "date": "Aug 16"},
            {"quiz_name": "AI/ML Quiz 1", "score": 88, "date": "Aug 17"}
        ]

    # Subject mastery breakdown
    subject_mastery = [
        {"subject": "Database Systems", "mastery": 88, "quizzes_taken": 4, "status": "Strong"},
        {"subject": "Operating Systems", "mastery": 74, "quizzes_taken": 3, "status": "Needs Revision"},
        {"subject": "Computer Networks", "mastery": 82, "quizzes_taken": 3, "status": "Good"},
        {"subject": "AI & Machine Learning", "mastery": 91, "quizzes_taken": 5, "status": "Mastered"}
    ]

    ai_advice = "Your DBMS quiz accuracy is solid at 88%. However, your Operating Systems score is lower (74%) specifically on Process Synchronization & Semaphores. We recommend reviewing the high-yield formulas and attempting a 10-question practice test."

    return {
        "study_streak_days": streak,
        "total_study_hours": total_hours,
        "topics_completed": topics_completed,
        "average_quiz_score": avg_score,
        "weekly_hours_chart": weekly_hours_chart,
        "quiz_trend_chart": quiz_trend_chart,
        "subject_mastery": subject_mastery,
        "ai_advice": ai_advice
    }
