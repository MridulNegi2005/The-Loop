from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS Configuration
# This allows the React frontend (running on a different port) to communicate with the API.
origins = [
    "http://localhost:3000", # Common port for create-react-app
    "http://localhost:5173", # Common port for Vite
    "https://the-loop-5m7u.onrender.com", # Deployed frontend URL
    "https://the-loop-5snj.onrender.com", # Deployed backend URL (self)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World", "DB_URL": SQLALCHEMY_DATABASE_URL.split("@")[1] if "@" in SQLALCHEMY_DATABASE_URL else "SQLite"}

# Database Setup
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
# Fallback or error handling could go here, but assuming env is set for now or using default
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./event_aggregator.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Security & JWT Setup ---
# Using bcrypt for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# This key should be stored securely, e.g., in an environment variable.
# It's used to sign the JWTs.
SECRET_KEY = "a_very_secret_key_that_should_be_in_an_env_file" # IMPORTANT: Change this and keep it secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

# --- Security Helper Functions ---
def verify_password(plain_password, hashed_password):
    """Compares a plain password with a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Generates a hash for a plain password."""
    return pwd_context.hash(password)

def create_access_token(data: dict):
    """Creates a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- SQLAlchemy Models (Database Tables) ---
# Represents the 'users' table in the database.
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    interests = Column(String, default="") # Comma-separated string of interests

# Represents the 'events' table in the database.
class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    start_at = Column(String) # Storing as string for simplicity, can be DateTime
    end_at = Column(String)
    venue = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    tags = Column(String) # Storing as a comma-separated string

# Create the database tables if they don't exist
Base.metadata.create_all(bind=engine)

# --- Pydantic Schemas (API Data Shapes) ---
# Defines the shape of event data returned by the API.
class EventSchema(BaseModel):
    id: int
    title: str
    description: str
    start_at: str
    end_at: str
    venue: str
    tags: List[str] # The API will return tags as a list of strings
    lat: float
    lng: float
    class Config:
        orm_mode = True # Allows Pydantic to read data from ORM models

# Defines the shape for creating a new user.
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

# Defines the shape of user data returned by the API.
class UserSchema(BaseModel):
    id: int
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    interests: Optional[str] = None
    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    interests: Optional[List[str]] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

# Defines the shape of the token response on successful login.
class Token(BaseModel):
    access_token: str
    token_type: str

# --- Dependency for Database Session ---
def get_db():
    """Dependency to get a DB session for each request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- Database Seeding Function ---
def seed_database():
    """Populates the database with initial data if it's empty."""
    db = SessionLocal()
    if db.query(Event).count() == 0:
        print("Database is empty. Seeding with initial events...")
        initial_events = [
            # ...existing events...
            Event(title="Annual Tech Fest Kick-off", description="Join us for the opening ceremony of the biggest tech fest on campus. Keynotes, food, and fun!", start_at="2025-09-01T18:00:00Z", end_at="2025-09-01T20:00:00Z", venue="Main Auditorium", tags="productive,tech,fest", lat=30.3558, lng=76.3625),
            Event(title="Acoustic Night at the Cafe", description="Unwind with some live music from talented student artists. Grab a coffee and enjoy the vibes.", start_at="2025-09-03T19:30:00Z", end_at="2025-09-03T21:00:00Z", venue="The Student Cafe", tags="chill,music,art", lat=30.3532, lng=76.3651),
            Event(title="Late Night Dance Party", description="DJ Ron is back with the hottest tracks. Get ready to dance the night away!", start_at="2025-09-05T22:00:00Z", end_at="2025-09-06T02:00:00Z", venue="Gymnasium Hall", tags="wild,dance,late-night", lat=30.3571, lng=76.3689),
            Event(title="Python Workshop", description="Learn the basics of Pandas and Matplotlib in this hands-on workshop by the Coding Club.", start_at="2025-09-06T14:00:00Z", end_at="2025-09-06T16:00:00Z", venue="Computer Lab 3", tags="productive,workshop,tech", lat=30.3545, lng=76.3660),
            Event(title="Freshers' Welcome Bash", description="The official welcome party for all first-year students. Music, dance, and a night to remember!", start_at="2025-09-08T21:00:00Z", end_at="2025-09-09T01:00:00Z", venue="Main Auditorium", tags="wild,dance,late-night", lat=30.3558, lng=76.3625),
            Event(title="Guest Lecture: The Future of AI", description="A talk by a leading researcher on the future of artificial intelligence and machine learning.", start_at="2025-09-15T15:00:00Z", end_at="2025-09-15T16:30:00Z", venue="Main Auditorium", tags="productive,tech", lat=30.3558, lng=76.3625),
            Event(title="Movie Marathon: Christopher Nolan", description="Join the film club for a back-to-back screening of Nolan's classics.", start_at="2025-09-20T18:00:00Z", end_at="2025-09-20T23:00:00Z", venue="Main Auditorium", tags="chill,movie", lat=30.3558, lng=76.3625),
            Event(title="Open Mic Night", description="Showcase your talent or just enjoy the performances. Poetry, comedy, music, and more!", start_at="2025-09-12T19:00:00Z", end_at="2025-09-12T21:00:00Z", venue="Tan Auditorium", tags="chill,art,music", lat=30.3565, lng=76.3645),
            Event(title="Debate Championship Finals", description="Watch the best debaters on campus battle it out for the annual trophy.", start_at="2025-09-19T16:00:00Z", end_at="2025-09-19T18:00:00Z", venue="Tan Auditorium", tags="productive", lat=30.3565, lng=76.3645),
            Event(title="Robotics Workshop", description="A hands-on workshop on building and programming autonomous robots.", start_at="2025-09-13T10:00:00Z", end_at="2025-09-13T13:00:00Z", venue="COS", tags="productive,tech,workshop", lat=30.3540, lng=76.3655),
            Event(title="Science Exhibition", description="Explore innovative projects and experiments by students from various departments.", start_at="2025-09-22T11:00:00Z", end_at="2025-09-22T17:00:00Z", venue="COS", tags="productive,tech,art", lat=30.3540, lng=76.3655),
            Event(title="Food Carnival", description="A paradise for foodies! Stalls from all over the city offering delicious treats.", start_at="2025-09-14T12:00:00Z", end_at="2025-09-14T22:00:00Z", venue="Fete Area", tags="chill,wild", lat=30.3580, lng=76.3695),
            Event(title="Street Play Festival", description="Experience powerful performances on social themes by the dramatics society.", start_at="2025-09-21T17:00:00Z", end_at="2025-09-21T20:00:00Z", venue="Fete Area", tags="art,chill", lat=30.3580, lng=76.3695),
            Event(title="Kite Flying Competition", description="Let your kites soar high in this fun-filled competition. Prizes for the best kite!", start_at="2025-09-28T14:00:00Z", end_at="2025-09-28T17:00:00Z", venue="Fete Area", tags="chill,wild", lat=30.3580, lng=76.3695),

            # --- Added for timeline demo: more events, more variety ---
            # 2025-09-06: 4 events (to create a large gap)
            Event(title="Morning Yoga", description="Start your day with a relaxing yoga session.", start_at="2025-09-06T06:00:00Z", end_at="2025-09-06T07:00:00Z", venue="Lawn", tags="chill,productive", lat=30.3550, lng=76.3620),
            Event(title="Brunch Social", description="Meet and greet with brunch.", start_at="2025-09-06T10:00:00Z", end_at="2025-09-06T12:00:00Z", venue="Cafeteria", tags="chill,food", lat=30.3530, lng=76.3660),
            Event(title="Afternoon Coding Jam", description="Collaborative coding session.", start_at="2025-09-06T16:30:00Z", end_at="2025-09-06T18:00:00Z", venue="Computer Lab 3", tags="tech,productive", lat=30.3545, lng=76.3660),

            # 2025-09-07: 1 event (small gap)
            Event(title="Photography Walk", description="Explore campus and capture moments.", start_at="2025-09-07T09:00:00Z", end_at="2025-09-07T11:00:00Z", venue="Campus Grounds", tags="art,chill", lat=30.3560, lng=76.3630),

            # 2025-09-10: 2 events
            Event(title="Chess Tournament", description="Compete for the chess champion title.", start_at="2025-09-10T14:00:00Z", end_at="2025-09-10T18:00:00Z", venue="Games Room", tags="chill,productive", lat=30.3570, lng=76.3670),
            Event(title="Evening Meditation", description="Guided meditation for all.", start_at="2025-09-10T19:00:00Z", end_at="2025-09-10T20:00:00Z", venue="Lawn", tags="chill,productive", lat=30.3550, lng=76.3620),

            # 2025-09-12: 3 events
            Event(title="Poetry Slam", description="Share your poetry or listen in.", start_at="2025-09-12T16:00:00Z", end_at="2025-09-12T18:00:00Z", venue="Tan Auditorium", tags="art,chill", lat=30.3565, lng=76.3645),
            Event(title="Board Games Night", description="Play classic and new board games.", start_at="2025-09-12T21:00:00Z", end_at="2025-09-12T23:00:00Z", venue="Games Room", tags="chill", lat=30.3570, lng=76.3670),

            # 2025-09-15: 2 events
            Event(title="AI Panel Discussion", description="Panel of experts discuss AI trends.", start_at="2025-09-15T17:00:00Z", end_at="2025-09-15T18:30:00Z", venue="Main Auditorium", tags="tech,productive", lat=30.3558, lng=76.3625),

            # 2025-09-20: 1 event
            Event(title="Late Night Movie", description="Special late night movie screening.", start_at="2025-09-20T23:30:00Z", end_at="2025-09-21T02:00:00Z", venue="Main Auditorium", tags="chill,movie,late-night", lat=30.3558, lng=76.3625),

            # 2025-09-22: 2 events
            Event(title="Science Quiz", description="Test your science knowledge.", start_at="2025-09-22T18:00:00Z", end_at="2025-09-22T19:00:00Z", venue="COS", tags="productive,tech", lat=30.3540, lng=76.3655),

            # 2025-09-28: 1 event
            Event(title="Sunset Music Jam", description="Live music as the sun sets.", start_at="2025-09-28T18:00:00Z", end_at="2025-09-28T20:00:00Z", venue="Fete Area", tags="music,chill", lat=30.3580, lng=76.3695),
        ]
        db.add_all(initial_events)
        db.commit()
        print("Seeding complete with 14 events.")
    else:
        print("Database already contains data. Skipping seed.")
    db.close()

# Run the seeding function on startup
seed_database()

# --- FastAPI App Initialization ---


# --- API Endpoints ---
@app.get("/")
async def root():
    """A simple root endpoint to check if the API is running."""
    return {"message": "Event Aggregator API is running!"}

@app.head("/")
async def root_head():
    return

@app.get("/events", response_model=List[EventSchema])
async def get_all_events(db: Session = Depends(get_db)):
    """Fetches all events from the database."""
    db_events = db.query(Event).all()
    # Convert the comma-separated tags string into a list for the response
    for event in db_events:
        event.tags = event.tags.split(',') if event.tags else []
    return db_events

@app.post("/users/signup", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Handles new user registration."""
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    db_username = db.query(User).filter(User.username == user.username).first()
    if db_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/users/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Handles user login and returns a JWT access token.
    FastAPI's OAuth2PasswordRequestForm expects 'username' and 'password' fields.
    We'll map our 'email' to 'username' on the frontend.
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

@app.get("/users/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=UserSchema)
async def update_user_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_update.interests is not None:
        current_user.interests = ",".join(user_update.interests)
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    db.commit()
    db.refresh(current_user)
    return current_user

# --- How to Run ---
# 1. Make sure you have the required libraries:
#    pip install fastapi uvicorn sqlalchemy pydantic passlib[bcrypt] python-jose[cryptography] python-multipart psycopg2-binary python-dotenv
# 2. Save this file as main.py
# 3. Run the server from your terminal:
#    uvicorn main:app --reload
