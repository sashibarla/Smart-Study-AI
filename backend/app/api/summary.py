import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, UploadedFile, Summary
from app.schemas.schemas import SummaryGenerateRequest, SummaryOut
from app.api.auth import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/summaries", tags=["AI Summarization"])

@router.get("", response_model=List[SummaryOut])
def get_user_summaries(
    subject: Optional[str] = None,
    source_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Summary).filter(Summary.user_id == current_user.id)
    if subject and subject != "All":
        query = query.filter(Summary.subject == subject)
    if source_type and source_type != "All":
        query = query.filter(Summary.source_type == source_type)
    return query.order_by(Summary.created_at.desc()).all()

@router.get("/{summary_id}", response_model=SummaryOut)
def get_summary(
    summary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = db.query(Summary).filter(Summary.id == summary_id, Summary.user_id == current_user.id).first()
    if not summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found")
    return summary

@router.post("/generate", response_model=SummaryOut)
async def generate_summary_endpoint(
    req: SummaryGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    text_to_summarize = req.raw_text or ""
    source_type = "text"
    file_title = req.title or "Lecture Summary"
    subject = req.subject or "Computer Science"

    if req.file_id:
        db_file = db.query(UploadedFile).filter(UploadedFile.id == req.file_id, UploadedFile.user_id == current_user.id).first()
        if db_file:
            text_to_summarize = db_file.extracted_text
            source_type = db_file.file_type
            file_title = db_file.original_name.rsplit(".", 1)[0].replace("_", " ").title()
            subject = db_file.subject

    if not text_to_summarize and not req.video_url:
        text_to_summarize = f"Comprehensive review of {subject} covering key algorithms, definitions, and exam topics."

    if req.video_url:
        source_type = "video"
        file_title = f"Lecture Video: {req.video_url}"

    summary_data = await ai_service.generate_summary(
        text=text_to_summarize,
        subject=subject,
        title=file_title,
        source_type=source_type
    )

    new_summary = Summary(
        user_id=current_user.id,
        file_id=req.file_id,
        title=summary_data.get("title", file_title),
        subject=subject,
        overview=summary_data.get("overview", ""),
        main_concepts=json.dumps(summary_data.get("main_concepts", [])),
        definitions=json.dumps(summary_data.get("definitions", [])),
        explanations=json.dumps(summary_data.get("explanations", [])),
        formulas=json.dumps(summary_data.get("formulas", [])),
        key_takeaways=json.dumps(summary_data.get("key_takeaways", [])),
        raw_markdown=summary_data.get("raw_markdown", ""),
        estimated_reading_time_mins=summary_data.get("estimated_reading_time_mins", 5),
        source_type=source_type
    )
    db.add(new_summary)
    db.commit()
    db.refresh(new_summary)
    return new_summary
