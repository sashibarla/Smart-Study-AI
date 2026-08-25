import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), default="")
    daily_study_hours = Column(Float, default=4.0)
    preferred_study_time = Column(String(50), default="Evening (4 PM - 8 PM)")
    difficulty_preference = Column(String(50), default="Medium")
    theme_preference = Column(String(50), default="light")
    notifications_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    files = relationship("UploadedFile", back_populates="user", cascade="all, delete-orphan")
    summaries = relationship("Summary", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="user", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")
    schedules = relationship("StudySchedule", back_populates="user", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="user", cascade="all, delete-orphan")
    chats = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("StudyProgress", back_populates="user", uselist=False, cascade="all, delete-orphan")

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_name = Column(String(255), nullable=False)
    stored_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, video, audio, docx, txt
    file_size = Column(Integer, default=0) # bytes
    extracted_text = Column(Text, default="")
    num_pages = Column(Integer, default=0)
    duration_seconds = Column(Float, default=0.0)
    subject = Column(String(100), default="General Studies")
    status = Column(String(50), default="completed") # uploading, processing, completed, failed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="files")
    summaries = relationship("Summary", back_populates="file", cascade="all, delete-orphan")
    points = relationship("ImportantPoint", back_populates="file", cascade="all, delete-orphan")

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("uploaded_files.id"), nullable=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), default="General Studies")
    overview = Column(Text, default="")
    main_concepts = Column(Text, default="") # JSON list or markdown
    definitions = Column(Text, default="")   # JSON list or markdown
    explanations = Column(Text, default="")  # JSON list or markdown
    formulas = Column(Text, default="")      # JSON list or markdown
    key_takeaways = Column(Text, default="") # JSON list or markdown
    raw_markdown = Column(Text, default="")
    estimated_reading_time_mins = Column(Integer, default=5)
    source_type = Column(String(50), default="pdf") # pdf, video, audio, text
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="summaries")
    file = relationship("UploadedFile", back_populates="summaries")

class ImportantPoint(Base):
    __tablename__ = "important_points"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("uploaded_files.id"), nullable=True)
    subject = Column(String(100), default="General Studies")
    category = Column(String(50), default="concept") # priority_topic, definition, concept, formula, expected_question
    priority = Column(String(20), default="High") # High, Medium, Low
    topic = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    formula_or_syntax = Column(Text, default="")
    is_completed = Column(Boolean, default=False)
    in_revision_queue = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    file = relationship("UploadedFile", back_populates="points")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("uploaded_files.id"), nullable=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), default="General")
    topic = Column(String(255), default="All Topics")
    difficulty = Column(String(50), default="Medium") # Easy, Medium, Hard
    quiz_type = Column(String(50), default="Mixed") # MCQ, TrueFalse, FillBlank, ShortAnswer, Mixed
    num_questions = Column(Integer, default=5)
    questions_json = Column(Text, nullable=False) # Serialized JSON array of questions
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="quizzes")
    results = relationship("QuizResult", back_populates="quiz", cascade="all, delete-orphan")

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    answers_json = Column(Text, nullable=False) # User chosen answers and question status
    time_spent_seconds = Column(Integer, default=120)
    ai_feedback = Column(Text, default="")
    topic_performance_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="quiz_results")
    quiz = relationship("Quiz", back_populates="results")

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_name = Column(String(150), nullable=False)
    exam_date = Column(String(50), nullable=False) # ISO or YYYY-MM-DD
    target_score = Column(Integer, default=90)
    priority = Column(String(20), default="High")
    progress_percentage = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="exams")

class StudySchedule(Base):
    __tablename__ = "study_schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), default="Semester Exam Prep Schedule")
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    total_days = Column(Integer, default=14)
    daily_hours = Column(Float, default=4.0)
    schedule_json = Column(Text, nullable=False) # Structured array of day schedules & slots
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="schedules")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String(100), default="default")
    role = Column(String(20), nullable=False) # user or assistant
    content = Column(Text, nullable=False)
    context_file_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chats")

class StudyProgress(Base):
    __tablename__ = "study_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_study_minutes = Column(Integer, default=1710) # 28.5 hrs default
    study_streak_days = Column(Integer, default=7)
    last_study_date = Column(String(50), default="")
    topics_completed_count = Column(Integer, default=42)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="progress")
