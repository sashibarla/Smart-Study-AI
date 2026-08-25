from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, UploadedFile
from app.schemas.schemas import PdfAskRequest, PdfAnswerOut
from app.api.auth import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/pdf", tags=["Chat with PDF"])

@router.get("/files")
def get_pdf_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all uploaded PDF files for the user to chat with."""
    files = db.query(UploadedFile).filter(
        UploadedFile.user_id == current_user.id,
        UploadedFile.file_type == "pdf"
    ).order_by(UploadedFile.created_at.desc()).all()
    
    return [
        {
            "id": f.id,
            "original_name": f.original_name,
            "subject": f.subject,
            "num_pages": f.num_pages,
            "file_size": f.file_size,
            "created_at": f.created_at
        }
        for f in files
    ]

@router.post("/ask", response_model=PdfAnswerOut)
async def ask_pdf(
    req: PdfAskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pdf_text = ""
    file_name = "Study Document"

    if req.file_id:
        file = db.query(UploadedFile).filter(
            UploadedFile.id == req.file_id,
            UploadedFile.user_id == current_user.id
        ).first()
        if file:
            pdf_text = file.extracted_text
            file_name = file.original_name

    # If no file selected, find user's latest PDF
    if not pdf_text:
        latest = db.query(UploadedFile).filter(
            UploadedFile.user_id == current_user.id,
            UploadedFile.file_type == "pdf"
        ).order_by(UploadedFile.created_at.desc()).first()
        if latest:
            pdf_text = latest.extracted_text
            file_name = latest.original_name

    result = await ai_service.answer_pdf_question(req.question, pdf_text, file_name)
    return result
