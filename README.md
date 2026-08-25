# 🎓 SMART STUDY AI ASSISTANT
> **“Study Smarter. Revise Faster. Score Better.”**

An intelligent, full-stack educational web application designed as a personal AI study companion for college students, engineering undergraduates, and competitive exam aspirants.

---

## 🌟 Key Features

1. **AI Video Lecture Summarizer**
   - Upload lecture videos/audio recordings (`.mp4`, `.wav`, `.mp3`).
   - Automated speech-to-text transcription and structured synthesis into Overview, Concepts, Definitions, Explanations, Formulas, and Key Takeaways.
   - Calculates duration, concept density, and estimated reading time.
   - One-click Markdown export and instant "Generate Quiz from this Lecture".

2. **Grounded Document Q&A (Chat with PDF)**
   - Upload course textbooks, slide decks, or syllabus PDFs (`.pdf`, `.docx`, `.txt`).
   - Grounded RAG-based question answering strictly based on document text with page citations (`[Page 1]`, `[Page 2, 3]`).

3. **High-Yield Important Exam Points**
   - Extracts categorized exam material:
     - 🔥 **High Priority Topics** (Exam weightage)
     - ⭐ **Important Definitions**
     - 📌 **Key Concepts**
     - 🧮 **Formulas & Mathematical Syntax**
     - ❓ **Expected Semester Exam Questions**
   - Filter by subject, mark items completed, and maintain a last-minute revision queue.

4. **Interactive AI Quiz Generator & Test Runner**
   - Formats: Multiple Choice (MCQ), True/False, Fill in the Blanks, Short Answer, Mixed.
   - Customizable difficulty (Easy, Medium, Hard) and question counts (5, 10, 15).
   - Live interactive test runner with progress indicator, answer validation, detailed explanation per question, and confetti celebration for scores ≥ 80%.

5. **Personalized Spaced Repetition Study Planner**
   - Calculates remaining days until subject exams.
   - Generates day-by-day timetables balancing concept study, revision checkpoints, and practice quiz sessions.
   - Daily view, weekly grid, and calendar views with task completion checkboxes.

6. **Dedicated AI Study Assistant**
   - Conversational AI tutor supporting Markdown formatting, LaTeX formulas, code blocks, and prompt suggestion chips.
   - Ability to attach uploaded study materials directly into the conversation context.

7. **Progress Analytics & Learning Metrics**
   - Real-time tracking of study streak days, total hours logged, topics mastered, and average quiz scores.
   - Interactive weekly study hours bar charts and subject mastery meters.
   - AI-driven study recommendation diagnostics.

---

## 🏗️ Technology Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite, React Router, Canvas Confetti, Axios.
- **Backend**: Python 3.10+, FastAPI, SQLite, SQLAlchemy, Pydantic, Python-JOSE (JWT), PyPDF.
- **AI Engine**: Pluggable AI Service Abstraction supporting:
  - **Google Gemini API** (`GEMINI_API_KEY`)
  - **OpenAI API** (`OPENAI_API_KEY`)
  - **Smart Built-in Academic NLP Engine** with pre-compiled Computer Science & Engineering subject knowledge (DBMS, OS, Computer Networks, AI/ML, Data Structures). *Works out of the box with zero external API keys!*

---

## 🚀 Quickstart Guide

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend will be live at: `http://127.0.0.1:8000` (Swagger docs at `http://127.0.0.1:8000/docs`)

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend will be live at: `http://localhost:5173`

---

## 👤 Demo Student Account

For immediate testing, the database is pre-seeded with realistic CSE course data:

- **Email**: `student@smartstudy.ai`
- **Password**: `password123`
- *(Or click the "Quick Demo Access" auto-fill button on the Login page!)*

---

## 📡 Backend API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/auth/register` | `POST` | Register a new student account |
| `/api/auth/login` | `POST` | Login and retrieve JWT Bearer token |
| `/api/auth/me` | `GET` | Get current authenticated user profile |
| `/api/upload` | `POST` | Upload PDF/MP4/MP3/DOCX and run AI analysis |
| `/api/summaries` | `GET` | Fetch all user summaries with subject filter |
| `/api/summaries/generate` | `POST` | Generate new AI lecture or video summary |
| `/api/important-points` | `GET` | Fetch high-priority exam points & formulas |
| `/api/important-points/{id}/toggle` | `PATCH` | Toggle point completion or revision queue |
| `/api/quiz/generate` | `POST` | Generate custom 4-type AI test |
| `/api/quiz/submit` | `POST` | Submit answers, calculate score & feedback |
| `/api/pdf/ask` | `POST` | Chat with PDF grounded Q&A with citations |
| `/api/study-plan/current` | `GET` | Retrieve current active study timetable |
| `/api/study-plan/generate` | `POST` | Generate optimized spaced repetition schedule |
| `/api/study-plan/task/toggle` | `POST` | Toggle task completion in study timetable |
| `/api/dashboard` | `GET` | Aggregate stats, today's tasks, upcoming exams |
| `/api/progress` | `GET` | Retrieve analytics metrics and chart data |
| `/api/materials` | `GET` | Search and filter uploaded materials library |

---

## 🔒 Security & Best Practices

- Salted PBKDF2-SHA256 password hashing.
- JWT Bearer token authentication with protected routes.
- Strict file type and size validation (100MB max limit).
- Sensitive credentials isolated in environment variables.

---

## 📄 License
MIT License. Built for students and academic projects.
