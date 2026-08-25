from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, ImportantPoint
from app.schemas.schemas import ImportantPointOut, PointToggleStatus
from app.api.auth import get_current_user

router = APIRouter(prefix="/important-points", tags=["Important Exam Points"])

@router.get("", response_model=List[ImportantPointOut])
def get_important_points(
    subject: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    in_revision: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ImportantPoint).filter(ImportantPoint.user_id == current_user.id)
    if subject and subject != "All":
        query = query.filter(ImportantPoint.subject == subject)
    if category and category != "All":
        query = query.filter(ImportantPoint.category == category)
    if priority and priority != "All":
        query = query.filter(ImportantPoint.priority == priority)
    if in_revision is not None:
        query = query.filter(ImportantPoint.in_revision_queue == in_revision)
    return query.order_by(ImportantPoint.created_at.desc()).all()

@router.patch("/{point_id}/toggle", response_model=ImportantPointOut)
def toggle_point_status(
    point_id: int,
    status_in: PointToggleStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    point = db.query(ImportantPoint).filter(ImportantPoint.id == point_id, ImportantPoint.user_id == current_user.id).first()
    if not point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Point not found")
    
    if status_in.is_completed is not None:
        point.is_completed = status_in.is_completed
    if status_in.in_revision_queue is not None:
        point.in_revision_queue = status_in.in_revision_queue

    db.commit()
    db.refresh(point)
    return point
