from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.database.seed_data import seed_database

# Import routers
from app.api import auth, upload, summary, points, quiz, pdf_qa, study_plan, chat, dashboard, progress, materials

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables & seed data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend API for Smart Study AI Assistant - An intelligent educational companion for students",
    lifespan=lifespan
)

# CORS configuration for React frontend
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(auth.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(summary.router, prefix="/api")
app.include_router(points.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")
app.include_router(pdf_qa.router, prefix="/api")
app.include_router(study_plan.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(materials.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Welcome to Smart Study AI Assistant API",
        "tagline": "Study Smarter. Revise Faster. Score Better.",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
