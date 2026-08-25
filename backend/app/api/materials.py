import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, UploadedFile, Summary, ImportantPoint, Quiz
from app.api.auth import get_current_user

router = APIRouter(prefix="/materials", tags=["Materials Library"])

@router.get("")
def get_all_materials(
    file_type: Optional[str] = None,
    subject: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(UploadedFile).filter(UploadedFile.user_id == current_user.id)
    
    if file_type and file_type != "All":
        query = query.filter(UploadedFile.file_type == file_type.lower())
        
    if subject and subject != "All":
        query = query.filter(UploadedFile.subject == subject)

    files = query.order_by(UploadedFile.created_at.desc()).all()

    if search:
        search_lower = search.lower()
        files = [f for f in files if search_lower in f.original_name.lower() or search_lower in f.subject.lower()]

    results = []
    for f in files:
        # Check associated summary and quiz
        has_summary = db.query(Summary).filter(Summary.file_id == f.id).first() is not None
        has_quiz = db.query(Quiz).filter(Quiz.file_id == f.id).first() is not None

        results.append({
            "id": f.id,
            "name": f.original_name,
            "file_type": f.file_type,
            "file_size": f.file_size,
            "num_pages": f.num_pages,
            "duration_seconds": f.duration_seconds,
            "subject": f.subject,
            "status": f.status,
            "has_summary": has_summary,
            "has_quiz": has_quiz,
            "created_at": f.created_at
        })

    return results

@router.delete("/{file_id}")
def delete_material(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file = db.query(UploadedFile).filter(UploadedFile.id == file_id, UploadedFile.user_id == current_user.id).first()
    if not file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    # Delete physical file if exists
    try:
        if os.path.exists(file.file_path):
            os.remove(file.file_path)
    except Exception as e:
        print(f"[Delete] Warning deleting physical file: {e}")

    db.delete(file)
    db.commit()
    return {"message": f"'{file.original_name}' deleted successfully"}
