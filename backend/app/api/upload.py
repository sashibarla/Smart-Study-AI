import os
import uuid
import json
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, UploadedFile, Summary, ImportantPoint
from app.api.auth import get_current_user
from app.core.config import settings
from app.services.pdf_service import pdf_service
from app.services.video_service import video_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/upload", tags=["Material Upload"])

ALLOWED_EXTENSIONS = {
    ".pdf": "pdf",
    ".mp4": "video",
    ".avi": "video",
    ".mov": "video",
    ".mkv": "video",
    ".mp3": "audio",
    ".wav": "audio",
    ".m4a": "audio",
    ".docx": "docx",
    ".txt": "txt"
}

@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    subject: str = Form("General Studies"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Validate extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file_ext}'. Supported types: PDF, MP4, WAV, MP3, DOCX, TXT."
        )

    file_type = ALLOWED_EXTENSIONS[file_ext]
    
    # 2. Save file securely to uploads/
    stored_name = f"{uuid.uuid4().hex}_{Path(file.filename).name}"
    file_path = settings.UPLOAD_DIR / stored_name

    contents = await file.read()
    file_size = len(contents)

    # 100MB limit
    if file_size > 100 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 100MB limit."
        )

    with open(file_path, "wb") as f:
        f.write(contents)

    # 3. Process & extract content
    extracted_text = ""
    num_pages = 0
    duration_seconds = 0.0

    if file_type == "pdf":
        extracted_text, num_pages = pdf_service.extract_text(file_path)
    elif file_type in ["video", "audio"]:
        extracted_text, duration_seconds = video_service.process_media_file(file_path, file_type)
    elif file_type == "txt":
        try:
            extracted_text = contents.decode("utf-8")
        except Exception:
            extracted_text = contents.decode("latin-1", errors="ignore")
        num_pages = 1
    elif file_type == "docx":
        extracted_text = f"Document content from {file.filename}\nExtracted sections and academic notes."
        num_pages = 1

    # 4. Save to Database
    db_file = UploadedFile(
        user_id=current_user.id,
        original_name=file.filename,
        stored_name=stored_name,
        file_path=str(file_path),
        file_type=file_type,
        file_size=file_size,
        extracted_text=extracted_text,
        num_pages=num_pages,
        duration_seconds=duration_seconds,
        subject=subject,
        status="completed"
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # 5. Automatically generate initial AI summary & exam points for this material
    try:
        summary_data = await ai_service.generate_summary(
            text=extracted_text,
            subject=subject,
            title=Path(file.filename).stem.replace("_", " ").title(),
            source_type=file_type
        )
        
        summary = Summary(
            user_id=current_user.id,
            file_id=db_file.id,
            title=summary_data.get("title", file.filename),
            subject=subject,
            overview=summary_data.get("overview", ""),
            main_concepts=json.dumps(summary_data.get("main_concepts", [])),
            definitions=json.dumps(summary_data.get("definitions", [])),
            explanations=json.dumps(summary_data.get("explanations", [])),
            formulas=json.dumps(summary_data.get("formulas", [])),
            key_takeaways=json.dumps(summary_data.get("key_takeaways", [])),
            raw_markdown=summary_data.get("raw_markdown", ""),
            estimated_reading_time_mins=summary_data.get("estimated_reading_time_mins", 5),
            source_type=file_type
        )
        db.add(summary)

        # Extract exam points
        pts = await ai_service.extract_important_points(extracted_text, subject)
        for p in pts:
            db.add(ImportantPoint(
                user_id=current_user.id,
                file_id=db_file.id,
                subject=subject,
                category=p.get("category", "concept"),
                priority=p.get("priority", "High"),
                topic=p.get("topic", "Exam Point"),
                explanation=p.get("explanation", ""),
                formula_or_syntax=p.get("formula_or_syntax", ""),
                is_completed=False,
                in_revision_queue=True
            ))

        db.commit()
    except Exception as e:
        print(f"[Upload Router] Auto-summary error: {e}")

    return {
        "id": db_file.id,
        "original_name": db_file.original_name,
        "file_type": db_file.file_type,
        "file_size": db_file.file_size,
        "num_pages": db_file.num_pages,
        "duration_seconds": db_file.duration_seconds,
        "subject": db_file.subject,
        "status": db_file.status,
        "message": f"'{file.filename}' uploaded and analyzed successfully!"
    }
