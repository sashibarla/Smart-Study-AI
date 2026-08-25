import json
import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, StudySchedule, Exam, StudyProgress
from app.schemas.schemas import StudyPlanGenerateRequest, StudyScheduleOut
from app.api.auth import get_current_user
from app.services.scheduler import scheduler

router = APIRouter(prefix="/study-plan", tags=["Study Planner"])

class TaskToggleReq(BaseModel):
    task_id: str
    is_completed: bool

@router.get("/current")
def get_current_study_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(StudySchedule).filter(StudySchedule.user_id == current_user.id).order_by(StudySchedule.created_at.desc()).first()
    if not plan:
        # Return default schedule structure
        today = datetime.date.today()
        subjects = [
            {"subject_name": "Database Management Systems", "exam_date": (today + datetime.timedelta(days=8)).strftime("%Y-%m-%d"), "difficulty": "Hard"},
            {"subject_name": "Operating Systems", "exam_date": (today + datetime.timedelta(days=12)).strftime("%Y-%m-%d"), "difficulty": "Medium"},
            {"subject_name": "Computer Networks", "exam_date": (today + datetime.timedelta(days=15)).strftime("%Y-%m-%d"), "difficulty": "Medium"}
        ]
        plan_data = scheduler.generate_plan(subjects, daily_hours=current_user.daily_study_hours, preferred_time=current_user.preferred_study_time)
        plan = StudySchedule(
            user_id=current_user.id,
            title="Semester Examination Prep Plan",
            start_date=plan_data["start_date"],
            end_date=plan_data["end_date"],
            total_days=plan_data["total_days"],
            daily_hours=plan_data["daily_hours"],
            schedule_json=json.dumps(plan_data["schedule"])
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

    return {
        "id": plan.id,
        "title": plan.title,
        "start_date": plan.start_date,
        "end_date": plan.end_date,
        "total_days": plan.total_days,
        "daily_hours": plan.daily_hours,
        "schedule": json.loads(plan.schedule_json),
        "created_at": plan.created_at
    }

@router.post("/generate")
def generate_new_plan(
    req: StudyPlanGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subjects_data = [s.model_dump() for s in req.subjects]
    plan_data = scheduler.generate_plan(
        subjects_data=subjects_data,
        daily_hours=req.daily_available_hours or current_user.daily_study_hours,
        preferred_time=req.preferred_study_time or current_user.preferred_study_time
    )

    new_schedule = StudySchedule(
        user_id=current_user.id,
        title=req.title or "Semester Examination Strategy",
        start_date=plan_data["start_date"],
        end_date=plan_data["end_date"],
        total_days=plan_data["total_days"],
        daily_hours=plan_data["daily_hours"],
        schedule_json=json.dumps(plan_data["schedule"])
    )
    db.add(new_schedule)

    # Also update or insert exam target entries
    for s in req.subjects:
        existing_exam = db.query(Exam).filter(Exam.user_id == current_user.id, Exam.subject_name == s.subject_name).first()
        if existing_exam:
            existing_exam.exam_date = s.exam_date
            existing_exam.priority = s.difficulty
        else:
            db.add(Exam(
                user_id=current_user.id,
                subject_name=s.subject_name,
                exam_date=s.exam_date,
                priority=s.difficulty,
                progress_percentage=30
            ))

    db.commit()
    db.refresh(new_schedule)

    return {
        "id": new_schedule.id,
        "title": new_schedule.title,
        "start_date": new_schedule.start_date,
        "end_date": new_schedule.end_date,
        "total_days": new_schedule.total_days,
        "daily_hours": new_schedule.daily_hours,
        "schedule": plan_data["schedule"],
        "created_at": new_schedule.created_at
    }

@router.post("/task/toggle")
def toggle_task(
    req: TaskToggleReq,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(StudySchedule).filter(StudySchedule.user_id == current_user.id).order_by(StudySchedule.created_at.desc()).first()
    if not plan:
        raise HTTPException(status_code=404, detail="No active study plan")

    schedule_days: List[Dict[str, Any]] = json.loads(plan.schedule_json)
    found = False

    for day in schedule_days:
        for slot in day.get("slots", []):
            if slot.get("id") == req.task_id:
                slot["is_completed"] = req.is_completed
                found = True
                break
        if found:
            break

    if not found:
        raise HTTPException(status_code=404, detail="Task slot not found")

    plan.schedule_json = json.dumps(schedule_days)
    
    # Update user progress
    if req.is_completed:
        progress = db.query(StudyProgress).filter(StudyProgress.user_id == current_user.id).first()
        if progress:
            progress.topics_completed_count += 1
            progress.total_study_minutes += 45

    db.commit()
    return {"message": "Task status updated", "task_id": req.task_id, "is_completed": req.is_completed}
