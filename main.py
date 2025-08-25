# main.py
# --- Imports ---
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime, timedelta

# Database Imports
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# CORS Middleware
from fastapi.middleware.cors import CORSMiddleware

# Password Hashing & JWT
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# --- Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./event_aggregator.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Security & JWT Setup ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "a_very_secret_key_that_should_be_in_an_env_file" # IMPORTANT: Change this and keep it secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- SQLAlchemy Models (Database Tables) ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    start_at = Column(String)
    end_at = Column(String)
    venue = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    tags = Column(String)

Base.metadata.create_all(bind=engine)

# --- Pydantic Schemas (API Data Shapes) ---
class EventSchema(BaseModel):
    id: int
    title: str
    description: str
    start_at: str
    end_at: str
    venue: str
    tags: List[str]
    lat: float
    lng: float
    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserSchema(BaseModel):
    id: int
    email: EmailStr
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Dependency for Database Session ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Database Seeding Function ---
def seed_database():
    db = SessionLocal()
    if db.query(Event).count() == 0:
        print("Database is empty. Seeding with initial events...")
        initial_events = [
            Event(title="Annual Tech Fest Kick-off", description="Join us for the opening ceremony...", start_at="2025-09-01T18:00:00Z", end_at="2025-09-01T20:00:00Z", venue="Main Auditorium", tags="productive,tech,fest", lat=30.3558, lng=76.3625),
            Event(title="Acoustic Night at the Cafe", description="Unwind with some live music...", start_at="2025-09-03T19:30:00Z", end_at="2025-09-03T21:00:00Z", venue="The Student Cafe", tags="chill,music,art", lat=30.3532, lng=76.3651),
            Event(title="Late Night Dance Party", description="DJ Ron is back with the hottest tracks.", start_at="2025-09-05T22:00:00Z", end_at="2025-09-06T02:00:00Z", venue="Gymnasium Hall", tags="wild,dance,late-night", lat=30.3571, lng=76.3689),
        ]
        db.add_all(initial_events)
        db.commit()
        print("Seeding complete.")
    else:
        print("Database already contains data. Skipping seed.")
    db.close()

seed_database()

# --- FastAPI App Initialization ---
app = FastAPI()

# --- CORS Middleware ---
origins = ["http://localhost:3000", "http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---
@app.get("/")
async def root():
    return {"message": "Event Aggregator API is running!"}

@app.get("/events", response_model=List[EventSchema])
async def get_all_events(db: Session = Depends(get_db)):
    db_events = db.query(Event).all()
    for event in db_events:
        event.tags = event.tags.split(',') if event.tags else []
    return db_events

@app.post("/users/signup", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# NEW: User Login Endpoint
@app.post("/users/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Logs in a user and returns a JWT access token.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# To run this server:
# 1. Install new libraries:
#    pip install "python-jose[cryptography]" python-multipart
# 2. Save this file as main.py
# 3. Run the server:
#    uvicorn main:app --reload
