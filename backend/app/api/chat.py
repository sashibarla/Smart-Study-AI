from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, ChatHistory, UploadedFile
from app.schemas.schemas import ChatRequest, ChatResponse
from app.api.auth import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/chat", tags=["AI Study Assistant"])

@router.get("/history")
def get_chat_history(
    session_id: Optional[str] = "default",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chats = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id,
        ChatHistory.session_id == session_id
    ).order_by(ChatHistory.created_at.asc()).all()

    return [
        {
            "id": c.id,
            "role": c.role,
            "content": c.content,
            "created_at": c.created_at
        }
        for c in chats
    ]

@router.post("/message", response_model=ChatResponse)
async def send_message(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Save user message
    user_msg = ChatHistory(
        user_id=current_user.id,
        session_id=req.session_id or "default",
        role="user",
        content=req.message,
        context_file_id=req.file_id
    )
    db.add(user_msg)

    # 2. Extract context if file_id provided
    context_text = ""
    if req.file_id:
        file = db.query(UploadedFile).filter(UploadedFile.id == req.file_id, UploadedFile.user_id == current_user.id).first()
        if file:
            context_text = file.extracted_text

    # 3. Call AI Service
    reply_text = await ai_service.chat_with_assistant(
        message=req.message,
        context_text=context_text
    )

    # 4. Save assistant reply
    ai_msg = ChatHistory(
        user_id=current_user.id,
        session_id=req.session_id or "default",
        role="assistant",
        content=reply_text,
        context_file_id=req.file_id
    )
    db.add(ai_msg)
    db.commit()

    return {
        "reply": reply_text,
        "session_id": req.session_id or "default"
    }

@router.delete("/clear")
def clear_chat_history(
    session_id: Optional[str] = "default",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id,
        ChatHistory.session_id == session_id
    ).delete()
    db.commit()
    return {"message": "Chat history cleared successfully"}
