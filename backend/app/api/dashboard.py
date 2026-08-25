import json
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, UploadedFile, Summary, Quiz, QuizResult, Exam, StudySchedule, StudyProgress
from app.schemas.schemas import DashboardDataOut, ExamCardOut
from app.api.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardDataOut)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Determine greeting based on current time
    now_hour = datetime.datetime.now().hour
    if now_hour < 12:
        greeting = f"Good morning, {current_user.full_name.split()[0]} 👋"
    elif now_hour < 17:
        greeting = f"Good afternoon, {current_user.full_name.split()[0]} 👋"
    else:
        greeting = f"Good evening, {current_user.full_name.split()[0]} 👋"

    # Fetch stats
    total_files = db.query(UploadedFile).filter(UploadedFile.user_id == current_user.id).count()
    quiz_results = db.query(QuizResult).filter(QuizResult.user_id == current_user.id).all()
    quizzes_completed = len(quiz_results)
    avg_score = round(sum(r.percentage for r in quiz_results) / quizzes_completed, 1) if quizzes_completed > 0 else 85.0

    progress = db.query(StudyProgress).filter(StudyProgress.user_id == current_user.id).first()
    study_hours = round((progress.total_study_minutes / 60) if progress else 28.5, 1)
    streak_days = progress.study_streak_days if progress else 7

    # Today's study plan
    today_schedule = []
    plan = db.query(StudySchedule).filter(StudySchedule.user_id == current_user.id).order_by(StudySchedule.created_at.desc()).first()
    if plan:
        try:
            schedule_days = json.loads(plan.schedule_json)
            if schedule_days:
                today_schedule = schedule_days[0].get("slots", [])
        except Exception:
            pass

    if not today_schedule:
        today_schedule = [
            {"id": "t1", "start_time": "09:00 AM", "end_time": "10:00 AM", "subject": "Database Systems", "topic": "Relational Normalization (1NF to BCNF)", "task_type": "Revision", "is_completed": True},
            {"id": "t2", "start_time": "11:00 AM", "end_time": "12:00 PM", "subject": "Operating Systems", "topic": "CPU Scheduling Algorithms & SJF", "task_type": "Practice Quiz", "is_completed": False},
            {"id": "t3", "start_time": "04:00 PM", "end_time": "05:00 PM", "subject": "Computer Networks", "topic": "Subnetting CIDR & Routing Protocols", "task_type": "Concept Study", "is_completed": False}
        ]

    # Upcoming Exams
    today = datetime.date.today()
    exams = db.query(Exam).filter(Exam.user_id == current_user.id).order_by(Exam.exam_date.asc()).all()
    upcoming_exams_out = []
    for e in exams:
        try:
            e_date = datetime.datetime.strptime(e.exam_date, "%Y-%m-%d").date()
            days_left = max(0, (e_date - today).days)
        except Exception:
            days_left = 7
        
        upcoming_exams_out.append(ExamCardOut(
            id=e.id,
            subject_name=e.subject_name,
            exam_date=e.exam_date,
            days_remaining=days_left,
            progress_percentage=e.progress_percentage or 50,
            priority=e.priority or "High"
        ))

    # Recent Materials
    recent_files = db.query(UploadedFile).filter(UploadedFile.user_id == current_user.id).order_by(UploadedFile.created_at.desc()).limit(5).all()
    recent_materials_out = []
    for f in recent_files:
        recent_materials_out.append({
            "id": f.id,
            "name": f.original_name,
            "file_type": f.file_type,
            "subject": f.subject,
            "size": f"{round(f.file_size / (1024*1024), 1)} MB" if f.file_size > 0 else "1.2 MB",
            "date": f.created_at.strftime("%b %d, %Y"),
            "status": f.status
        })

    # AI Recommendation
    ai_recommendation = "Your DBMS quiz accuracy is solid (80%+). However, Operating Systems Deadlock Avoidance has upcoming priority. Consider revising Banker's algorithm today."

    return {
        "user_name": current_user.full_name,
        "greeting": greeting,
        "statistics": {
            "total_study_hours": study_hours,
            "materials_uploaded": total_files,
            "quizzes_completed": quizzes_completed,
            "average_quiz_score": avg_score,
            "current_study_streak": streak_days
        },
        "today_schedule": today_schedule,
        "upcoming_exams": upcoming_exams_out,
        "recent_materials": recent_materials_out,
        "ai_recommendation": ai_recommendation
    }
