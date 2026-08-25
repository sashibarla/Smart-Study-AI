from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.seed_data import seed_database
from app.models.models import User, StudyProgress
from app.schemas.schemas import UserCreate, UserLogin, UserUpdate, UserOut, Token
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    # Check if user already exists
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )
    
    hashed_password = get_password_hash(user_in.password.strip())
    user = User(
        email=clean_email,
        full_name=user_in.full_name.strip(),
        hashed_password=hashed_password,
        avatar_url="",
        daily_study_hours=4.0,
        preferred_study_time="Evening (4 PM - 8 PM)",
        difficulty_preference="Medium"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create initial progress record
    progress = StudyProgress(
        user_id=user.id,
        total_study_minutes=0,
        study_streak_days=1,
        last_study_date=datetime.date.today().strftime("%Y-%m-%d"),
        topics_completed_count=0
    )
    db.add(progress)
    db.commit()

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    clean_email = login_in.email.strip().lower()
    clean_pass = login_in.password.strip()

    # Ensure database is seeded if empty
    user_count = db.query(User).count()
    if user_count == 0:
        seed_database(db)

    user = db.query(User).filter(User.email == clean_email).first()
    
    # Try exact password or stripped password
    password_valid = False
    if user:
        password_valid = verify_password(login_in.password, user.hashed_password) or verify_password(clean_pass, user.hashed_password)

    if not user or not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/update", response_model=UserOut)
def update_profile(update_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if update_in.full_name is not None:
        current_user.full_name = update_in.full_name
    if update_in.daily_study_hours is not None:
        current_user.daily_study_hours = update_in.daily_study_hours
    if update_in.preferred_study_time is not None:
        current_user.preferred_study_time = update_in.preferred_study_time
    if update_in.difficulty_preference is not None:
        current_user.difficulty_preference = update_in.difficulty_preference
    if update_in.theme_preference is not None:
        current_user.theme_preference = update_in.theme_preference
    if update_in.notifications_enabled is not None:
        current_user.notifications_enabled = update_in.notifications_enabled
    if update_in.avatar_url is not None:
        current_user.avatar_url = update_in.avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user
