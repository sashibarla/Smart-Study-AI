from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# --- Auth Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    daily_study_hours: Optional[float] = None
    preferred_study_time: Optional[str] = None
    difficulty_preference: Optional[str] = None
    theme_preference: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    avatar_url: Optional[str] = None

class UserOut(UserBase):
    id: int
    avatar_url: Optional[str] = ""
    daily_study_hours: float
    preferred_study_time: str
    difficulty_preference: str
    theme_preference: str
    notifications_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None

# --- File Upload Schemas ---
class UploadedFileOut(BaseModel):
    id: int
    original_name: str
    file_type: str
    file_size: int
    num_pages: int
    duration_seconds: float
    subject: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Summary Schemas ---
class SummaryGenerateRequest(BaseModel):
    file_id: Optional[int] = None
    raw_text: Optional[str] = None
    title: Optional[str] = None
    subject: Optional[str] = "General"
    video_url: Optional[str] = None

class SummaryOut(BaseModel):
    id: int
    title: str
    subject: str
    overview: str
    main_concepts: str
    definitions: str
    explanations: str
    formulas: str
    key_takeaways: str
    raw_markdown: str
    estimated_reading_time_mins: int
    source_type: str
    file_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Important Points Schemas ---
class ImportantPointOut(BaseModel):
    id: int
    file_id: Optional[int] = None
    subject: str
    category: str
    priority: str
    topic: str
    explanation: str
    formula_or_syntax: Optional[str] = ""
    is_completed: bool
    in_revision_queue: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PointToggleStatus(BaseModel):
    is_completed: Optional[bool] = None
    in_revision_queue: Optional[bool] = None

# --- Quiz Schemas ---
class QuizQuestion(BaseModel):
    id: int
    type: str # mcq, true_false, fill_blank, short_answer
    question: str
    options: Optional[List[str]] = []
    correct_answer: str
    explanation: str
    topic: Optional[str] = "Core Concept"
    difficulty: Optional[str] = "Medium"

class QuizGenerateRequest(BaseModel):
    file_id: Optional[int] = None
    subject: Optional[str] = "Computer Science"
    topic: Optional[str] = "All Topics"
    quiz_type: Optional[str] = "Mixed" # MCQ, TrueFalse, FillBlank, ShortAnswer, Mixed
    difficulty: Optional[str] = "Medium" # Easy, Medium, Hard
    num_questions: Optional[int] = 5
    custom_content: Optional[str] = None

class QuizOut(BaseModel):
    id: int
    title: str
    subject: str
    topic: str
    difficulty: str
    quiz_type: str
    num_questions: int
    questions: List[QuizQuestion]
    created_at: datetime

    class Config:
        from_attributes = True

class QuizSubmitRequest(BaseModel):
    quiz_id: int
    answers: Dict[str, str] # question_id -> user answer
    time_spent_seconds: Optional[int] = 60

class QuizResultOut(BaseModel):
    id: int
    quiz_id: int
    score: int
    total_questions: int
    percentage: float
    time_spent_seconds: int
    ai_feedback: str
    topic_performance: Dict[str, Any]
    answers_breakdown: List[Dict[str, Any]]
    created_at: datetime

# --- Study Planner Schemas ---
class SubjectExamInput(BaseModel):
    subject_name: str
    exam_date: str # YYYY-MM-DD
    difficulty: str # Easy, Medium, Hard
    current_confidence: Optional[int] = 50 # 0-100
    daily_target_hours: Optional[float] = 2.0

class StudyPlanGenerateRequest(BaseModel):
    title: Optional[str] = "Exam Preparation Strategy"
    daily_available_hours: Optional[float] = 4.0
    preferred_study_time: Optional[str] = "Evening"
    subjects: List[SubjectExamInput]

class ScheduleSlot(BaseModel):
    id: str
    day: str
    date: str
    start_time: str
    end_time: str
    subject: str
    topic: str
    task_type: str # Revision, Concept Study, Practice Quiz, Past Papers
    is_completed: bool = False

class StudyScheduleOut(BaseModel):
    id: int
    title: str
    start_date: str
    end_date: str
    total_days: int
    daily_hours: float
    schedule: List[Dict[str, Any]]
    created_at: datetime

# --- PDF Q&A Schemas ---
class PdfAskRequest(BaseModel):
    file_id: Optional[int] = None
    question: str

class PdfAnswerOut(BaseModel):
    question: str
    answer: str
    page_references: List[int] = []
    source_snippets: List[str] = []
    confidence: float = 0.95

# --- General Chat Schemas ---
class ChatMessage(BaseModel):
    role: str
    content: str
    created_at: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    file_id: Optional[int] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: str

# --- Dashboard & Progress Schemas ---
class ExamCardOut(BaseModel):
    id: int
    subject_name: str
    exam_date: str
    days_remaining: int
    progress_percentage: int
    priority: str

class DashboardDataOut(BaseModel):
    user_name: str
    greeting: str
    statistics: Dict[str, Any]
    today_schedule: List[Dict[str, Any]]
    upcoming_exams: List[ExamCardOut]
    recent_materials: List[Dict[str, Any]]
    ai_recommendation: str

class ProgressDataOut(BaseModel):
    study_streak_days: int
    total_study_hours: float
    topics_completed: int
    average_quiz_score: float
    weekly_hours_chart: List[Dict[str, Any]]
    quiz_trend_chart: List[Dict[str, Any]]
    subject_mastery: List[Dict[str, Any]]
    ai_advice: str
