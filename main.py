from fastapi import FastAPI, HTTPException, Depends, status, WebSocket, WebSocketDisconnect, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, or_, and_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
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
# Using argon2 for password hashing (better compatibility with Python 3.13+)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# This key should be stored securely, e.g., in an environment variable.
# It's used to sign the JWTs.
SECRET_KEY = "a_very_secret_key_that_should_be_in_an_env_file" # IMPORTANT: Change this and keep it secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="users/login", auto_error=False)

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

# Association table for User-Event (Many-to-Many)
class UserEvent(Base):
    __tablename__ = "user_events"
    user_id = Column(Integer, primary_key=True)
    event_id = Column(Integer, primary_key=True)

# Table to store user interest scores
class UserInterest(Base):
    __tablename__ = "user_interests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    interest = Column(String, index=True)
    score = Column(Float, default=1.0) # Default weight

# Represents the 'users' table in the database.
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    # interests column is kept for backward compatibility/initial selection, 
    # but UserInterest table is the source of truth for weights.
    interests = Column(String, default="") 

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

# Carpool Group Model
class CarpoolGroup(Base):
    __tablename__ = "carpool_groups"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, index=True)
    owner_id = Column(Integer, index=True)
    location = Column(String)
    time = Column(String)
    capacity = Column(Integer)
    
# Carpool Request Model
class CarpoolRequest(Base):
    __tablename__ = "carpool_requests"
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, index=True)
    requester_id = Column(Integer, index=True)
    status = Column(String, default="pending") # pending, accepted, rejected

# Friend Request Model
class FriendRequest(Base):
    __tablename__ = "friend_requests"
    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), index=True)
    receiver_id = Column(Integer, ForeignKey("users.id"), index=True)
    status = Column(String, default="pending") # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

# Chat Message Model
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), index=True)
    receiver_id = Column(Integer, ForeignKey("users.id"), index=True)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

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
    match_score: Optional[float] = 0.0 # Added match_score
    match_percentage: Optional[int] = 0 # Added match_percentage
    is_joined: Optional[bool] = False # Added is_joined status
    class Config:
        orm_mode = True

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

# Carpool Schemas
class CarpoolGroupCreate(BaseModel):
    location: str
    time: str
    capacity: int

class CarpoolGroupResponse(BaseModel):
    id: int
    event_id: int
    owner_id: int
    location: str
    time: str
    capacity: int
    owner_username: Optional[str] = None
    members: Optional[List[dict]] = None # List of {username, email} for owner
    class Config:
        orm_mode = True

class CarpoolRequestResponse(BaseModel):
    id: int
    group_id: int
    requester_id: int
    status: str
    requester_username: Optional[str] = None
    group_location: Optional[str] = None
    event_title: Optional[str] = None
    class Config:
        orm_mode = True

class FriendRequestResponse(BaseModel):
    id: int
    requester_id: int
    receiver_id: int
    status: str
    created_at: datetime
    requester_username: Optional[str] = None
    receiver_username: Optional[str] = None
    class Config:
        orm_mode = True

class FriendResponse(BaseModel):
    id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    class Config:
        orm_mode = True

class ChatMessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime
    class Config:
        orm_mode = True

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

async def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    """Returns the current user if authenticated, else None."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    user = db.query(User).filter(User.email == email).first()
    return user

# --- Database Seeding Function ---
def seed_database():
    """Populates the database with initial data if it's empty."""
    db = SessionLocal()
    if db.query(Event).count() == 0:
        print("Database is empty. Seeding with initial events...")
        initial_events = [
            # ...existing events...
            Event(title="Annual Tech Fest Kick-off", description="Join us for the opening ceremony of the biggest tech fest on campus. Keynotes, food, and fun!", start_at="2025-12-01T18:00:00Z", end_at="2025-12-01T20:00:00Z", venue="Main Auditorium", tags="productive,tech,fest", lat=30.3558, lng=76.3625),
            Event(title="Acoustic Night at the Cafe", description="Unwind with some live music from talented student artists. Grab a coffee and enjoy the vibes.", start_at="2025-12-03T19:30:00Z", end_at="2025-12-03T21:00:00Z", venue="The Student Cafe", tags="chill,music,art", lat=30.3532, lng=76.3651),
            Event(title="Late Night Dance Party", description="DJ Ron is back with the hottest tracks. Get ready to dance the night away!", start_at="2025-12-05T22:00:00Z", end_at="2025-12-06T02:00:00Z", venue="Gymnasium Hall", tags="wild,dance,late-night", lat=30.3571, lng=76.3689),
            Event(title="Python Workshop", description="Learn the basics of Pandas and Matplotlib in this hands-on workshop by the Coding Club.", start_at="2025-12-06T14:00:00Z", end_at="2025-12-06T16:00:00Z", venue="Computer Lab 3", tags="productive,workshop,tech", lat=30.3545, lng=76.3660),
            Event(title="Freshers' Welcome Bash", description="The official welcome party for all first-year students. Music, dance, and a night to remember!", start_at="2025-12-08T21:00:00Z", end_at="2025-12-09T01:00:00Z", venue="Main Auditorium", tags="wild,dance,late-night", lat=30.3558, lng=76.3625),
            Event(title="Guest Lecture: The Future of AI", description="A talk by a leading researcher on the future of artificial intelligence and machine learning.", start_at="2025-12-15T15:00:00Z", end_at="2025-12-15T16:30:00Z", venue="Main Auditorium", tags="productive,tech", lat=30.3558, lng=76.3625),
            Event(title="Movie Marathon: Christopher Nolan", description="Join the film club for a back-to-back screening of Nolan's classics.", start_at="2025-12-20T18:00:00Z", end_at="2025-12-20T23:00:00Z", venue="Main Auditorium", tags="chill,movie", lat=30.3558, lng=76.3625),
            Event(title="Open Mic Night", description="Showcase your talent or just enjoy the performances. Poetry, comedy, music, and more!", start_at="2025-12-12T19:00:00Z", end_at="2025-12-12T21:00:00Z", venue="Tan Auditorium", tags="chill,art,music", lat=30.3565, lng=76.3645),
            Event(title="Debate Championship Finals", description="Watch the best debaters on campus battle it out for the annual trophy.", start_at="2025-12-19T16:00:00Z", end_at="2025-12-19T18:00:00Z", venue="Tan Auditorium", tags="productive", lat=30.3565, lng=76.3645),
            Event(title="Robotics Workshop", description="A hands-on workshop on building and programming autonomous robots.", start_at="2025-12-13T10:00:00Z", end_at="2025-12-13T13:00:00Z", venue="COS", tags="productive,tech,workshop", lat=30.3540, lng=76.3655),
            Event(title="Science Exhibition", description="Explore innovative projects and experiments by students from various departments.", start_at="2025-12-22T11:00:00Z", end_at="2025-12-22T17:00:00Z", venue="COS", tags="productive,tech,art", lat=30.3540, lng=76.3655),
            Event(title="Food Carnival", description="A paradise for foodies! Stalls from all over the city offering delicious treats.", start_at="2025-12-14T12:00:00Z", end_at="2025-12-14T22:00:00Z", venue="Fete Area", tags="chill,wild", lat=30.3580, lng=76.3695),
            Event(title="Street Play Festival", description="Experience powerful performances on social themes by the dramatics society.", start_at="2025-12-21T17:00:00Z", end_at="2025-12-21T20:00:00Z", venue="Fete Area", tags="art,chill", lat=30.3580, lng=76.3695),
            Event(title="Kite Flying Competition", description="Let your kites soar high in this fun-filled competition. Prizes for the best kite!", start_at="2025-12-28T14:00:00Z", end_at="2025-12-28T17:00:00Z", venue="Fete Area", tags="chill,wild", lat=30.3580, lng=76.3695),

            # --- Added for timeline demo: more events, more variety ---
            # 2025-12-06: 4 events (to create a large gap)
            Event(title="Morning Yoga", description="Start your day with a relaxing yoga session.", start_at="2025-12-06T06:00:00Z", end_at="2025-12-06T07:00:00Z", venue="Lawn", tags="chill,productive", lat=30.3550, lng=76.3620),
            Event(title="Brunch Social", description="Meet and greet with brunch.", start_at="2025-12-06T10:00:00Z", end_at="2025-12-06T12:00:00Z", venue="Cafeteria", tags="chill,food", lat=30.3530, lng=76.3660),
            Event(title="Afternoon Coding Jam", description="Collaborative coding session.", start_at="2025-12-06T16:30:00Z", end_at="2025-12-06T18:00:00Z", venue="Computer Lab 3", tags="tech,productive", lat=30.3545, lng=76.3660),

            # 2025-12-07: 1 event (small gap)
            Event(title="Photography Walk", description="Explore campus and capture moments.", start_at="2025-12-07T09:00:00Z", end_at="2025-12-07T11:00:00Z", venue="Campus Grounds", tags="art,chill", lat=30.3560, lng=76.3630),

            # 2025-12-10: 2 events
            Event(title="Chess Tournament", description="Compete for the chess champion title.", start_at="2025-12-10T14:00:00Z", end_at="2025-12-10T18:00:00Z", venue="Games Room", tags="chill,productive", lat=30.3570, lng=76.3670),
            Event(title="Evening Meditation", description="Guided meditation for all.", start_at="2025-12-10T19:00:00Z", end_at="2025-12-10T20:00:00Z", venue="Lawn", tags="chill,productive", lat=30.3550, lng=76.3620),

            # 2025-12-12: 3 events
            Event(title="Poetry Slam", description="Share your poetry or listen in.", start_at="2025-12-12T16:00:00Z", end_at="2025-12-12T18:00:00Z", venue="Tan Auditorium", tags="art,chill", lat=30.3565, lng=76.3645),
            Event(title="Board Games Night", description="Play classic and new board games.", start_at="2025-12-12T21:00:00Z", end_at="2025-12-12T23:00:00Z", venue="Games Room", tags="chill", lat=30.3570, lng=76.3670),

            # 2025-12-15: 2 events
            Event(title="AI Panel Discussion", description="Panel of experts discuss AI trends.", start_at="2025-12-15T17:00:00Z", end_at="2025-12-15T18:30:00Z", venue="Main Auditorium", tags="tech,productive", lat=30.3558, lng=76.3625),

            # 2025-12-20: 1 event
            Event(title="Late Night Movie", description="Special late night movie screening.", start_at="2025-12-20T23:30:00Z", end_at="2025-12-21T02:00:00Z", venue="Main Auditorium", tags="chill,movie,late-night", lat=30.3558, lng=76.3625),

            # 2025-12-22: 2 events
            Event(title="Science Quiz", description="Test your science knowledge.", start_at="2025-12-22T18:00:00Z", end_at="2025-12-22T19:00:00Z", venue="COS", tags="productive,tech", lat=30.3540, lng=76.3655),

            # 2025-12-28: 1 event
            Event(title="Sunset Music Jam", description="Live music as the sun sets.", start_at="2025-12-28T18:00:00Z", end_at="2025-12-28T20:00:00Z", venue="Fete Area", tags="music,chill", lat=30.3580, lng=76.3695),
        ]
        db.add_all(initial_events)
        db.commit()
        print("Seeding complete with 14 events.")
    else:
        print("Database already contains data. Skipping seed.")
    db.close()

# Run the seeding function on startup
seed_database()

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"Hello": "World", "DB_URL": SQLALCHEMY_DATABASE_URL.split("@")[1] if "@" in SQLALCHEMY_DATABASE_URL else "SQLite"}

@app.head("/")
async def root_head():
    return

@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    return {"status": "active"}

import math # Ensure math is imported

@app.get("/events", response_model=List[EventSchema])
async def get_all_events(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional) # Use optional auth
):
    """Fetches all events from the database with recommendation scores (Cosine Similarity)."""
    db_events = db.query(Event).all()
    
    # Get user interests and joined events if logged in
    user_interests = {}
    joined_event_ids = set()
    user_magnitude = 0.0
    
    if current_user:
        # Fetch weighted interests
        db_interests = db.query(UserInterest).filter(UserInterest.user_id == current_user.id).all()
        sum_sq = 0.0
        for ui in db_interests:
            user_interests[ui.interest] = ui.score
            sum_sq += ui.score * ui.score
        user_magnitude = math.sqrt(sum_sq)
            
        # Fetch joined events
        joined = db.query(UserEvent).filter(UserEvent.user_id == current_user.id).all()
        joined_event_ids = {je.event_id for je in joined}

    results = []
    for event in db_events:
        tags = event.tags.split(',') if event.tags else []
        
        # Calculate Cosine Similarity
        match_percentage = 0
        score = 0.0 # Keep raw score for sorting backup or debugging
        
        if current_user and user_magnitude > 0 and tags:
            dot_product = 0.0
            # Event vector magnitude (assuming binary weight 1.0 for each tag present)
            # Magnitude = sqrt(1^2 + 1^2 + ... + 1^2) = sqrt(count(tags))
            event_magnitude = math.sqrt(len(tags))
            
            for tag in tags:
                # User score for this tag * Event weight (1.0)
                dot_product += user_interests.get(tag, 0.0) * 1.0
            
            if event_magnitude > 0:
                similarity = dot_product / (user_magnitude * event_magnitude)
                match_percentage = int(similarity * 100)
                score = similarity # Use similarity as the primary sort score
        
        # Create response object
        event_resp = EventSchema(
            id=event.id,
            title=event.title,
            description=event.description,
            start_at=event.start_at,
            end_at=event.end_at,
            venue=event.venue,
            tags=tags,
            lat=event.lat,
            lng=event.lng,
            match_score=score, # This is now the similarity score (0.0 to 1.0)
            match_percentage=match_percentage, # New field (0 to 100)
            is_joined=(event.id in joined_event_ids)
        )
        results.append(event_resp)
        
    # Sort by match_percentage descending
    results.sort(key=lambda x: x.match_percentage, reverse=True)
    
    return results

@app.post("/events/{event_id}/join")
async def join_event(
    event_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Allows a user to join an event and updates their interest weights."""
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Check if already joined
    existing = db.query(UserEvent).filter(
        UserEvent.user_id == current_user.id, 
        UserEvent.event_id == event_id
    ).first()
    
    if existing:
        return {"message": "Already joined this event"}
        
    # Join event
    new_join = UserEvent(user_id=current_user.id, event_id=event_id)
    db.add(new_join)
    
    # Update interest weights
    # "Bump" the interests associated with this event
    tags = event.tags.split(',') if event.tags else []
    for tag in tags:
        user_interest = db.query(UserInterest).filter(
            UserInterest.user_id == current_user.id,
            UserInterest.interest == tag
        ).first()
        
        if user_interest:
            user_interest.score += 1.0 # Increase weight
        else:
            # New interest discovered via event
            new_interest = UserInterest(user_id=current_user.id, interest=tag, score=1.5) # Start with a bump
            db.add(new_interest)
            
    db.commit()
    return {"message": "Successfully joined event", "event_title": event.title}

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
    user = db.query(User).filter(or_(User.email == form_data.username, User.username == form_data.username)).first()
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
@app.put("/users/me", response_model=UserSchema)
async def update_user_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_update.interests is not None:
        # Update the legacy string column
        current_user.interests = ",".join(user_update.interests)
        
        # Update the weighted interests table
        # Ensure selected interests exist with at least base weight (5.0).
        # Do NOT reset existing higher scores.
        
        for interest in user_update.interests:
            ui = db.query(UserInterest).filter(
                UserInterest.user_id == current_user.id,
                UserInterest.interest == interest
            ).first()
            if not ui:
                # New manual interest
                new_ui = UserInterest(user_id=current_user.id, interest=interest, score=5.0)
                db.add(new_ui)
            else:
                # Existing, ensure it has at least base weight
                if ui.score < 5.0:
                    ui.score = 5.0
                    
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    db.commit()
    db.refresh(current_user)
    return current_user

@app.delete("/users/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    return None


@app.get("/events/{event_id}/carpool", response_model=List[CarpoolGroupResponse])
async def get_carpool_groups(
    event_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    groups = db.query(CarpoolGroup).filter(CarpoolGroup.event_id == event_id).all()
    for group in groups:
        owner = db.query(User).filter(User.id == group.owner_id).first()
        group.owner_username = owner.username if owner else "Unknown"
        
        # If current user is owner, populate members
        if current_user and current_user.id == group.owner_id:
            accepted_requests = db.query(CarpoolRequest).filter(
                CarpoolRequest.group_id == group.id,
                CarpoolRequest.status == "accepted"
            ).all()
            
            member_list = []
            for req in accepted_requests:
                member_user = db.query(User).filter(User.id == req.requester_id).first()
                if member_user:
                    member_list.append({
                        "username": member_user.username,
                        "email": member_user.email
                    })
            group.members = member_list
            
    return groups

@app.post("/carpool/{group_id}/join")
async def join_carpool_group(
    group_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    group = db.query(CarpoolGroup).filter(CarpoolGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    if group.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot join your own group")
        
    existing = db.query(CarpoolRequest).filter(
        CarpoolRequest.group_id == group_id,
        CarpoolRequest.requester_id == current_user.id
    ).first()
    
    if existing:
        return {"message": "Request already sent"}
        
    new_request = CarpoolRequest(
        group_id=group_id,
        requester_id=current_user.id
    )
    db.add(new_request)
    db.commit()
    return {"message": "Request sent"}

@app.get("/carpool/requests/received", response_model=List[CarpoolRequestResponse])
async def get_received_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get groups owned by user
    owned_groups = db.query(CarpoolGroup).filter(CarpoolGroup.owner_id == current_user.id).all()
    group_ids = [g.id for g in owned_groups]
    
    requests = db.query(CarpoolRequest).filter(CarpoolRequest.group_id.in_(group_ids)).all()
    
    results = []
    for req in requests:
        requester = db.query(User).filter(User.id == req.requester_id).first()
        group = db.query(CarpoolGroup).filter(CarpoolGroup.id == req.group_id).first()
        event = db.query(Event).filter(Event.id == group.event_id).first()
        
        req.requester_username = requester.username if requester else "Unknown"
        req.group_location = group.location
        req.event_title = event.title
        results.append(req)
        
    return results

@app.get("/carpool/requests/sent", response_model=List[CarpoolRequestResponse])
async def get_sent_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    requests = db.query(CarpoolRequest).filter(CarpoolRequest.requester_id == current_user.id).all()
    
    results = []
    for req in requests:
        group = db.query(CarpoolGroup).filter(CarpoolGroup.id == req.group_id).first()
        event = db.query(Event).filter(Event.id == group.event_id).first()
        
        req.group_location = group.location
        req.event_title = event.title
        results.append(req)
        
    return results

@app.post("/carpool/requests/{request_id}/{action}")
async def manage_request(
    request_id: int, 
    action: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    req = db.query(CarpoolRequest).filter(CarpoolRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    group = db.query(CarpoolGroup).filter(CarpoolGroup.id == req.group_id).first()
    if group.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if action == "accept":
        if req.status != "accepted":
            if group.capacity <= 0:
                raise HTTPException(status_code=400, detail="Group is full")
            req.status = "accepted"
            group.capacity -= 1
        # Optional: decrement capacity? For now just simple status.
    elif action == "reject":
        req.status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    db.commit()
    return {"message": f"Request {action}ed"}

# --- Friends System Endpoints ---

@app.post("/friends/request/{user_id}")
async def send_friend_request(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if request already exists (in either direction)
    existing = db.query(FriendRequest).filter(
        or_(
            and_(FriendRequest.requester_id == current_user.id, FriendRequest.receiver_id == user_id),
            and_(FriendRequest.requester_id == user_id, FriendRequest.receiver_id == current_user.id)
        )
    ).first()

    if existing:
        if existing.status == "accepted":
            return {"message": "You are already friends"}
        if existing.status == "pending":
            return {"message": "Friend request already pending"}
        # If rejected, we might allow re-sending, but for now let's say "Request already exists"
        return {"message": "Friend request already exists"}

    new_request = FriendRequest(requester_id=current_user.id, receiver_id=user_id)
    db.add(new_request)
    db.commit()
    return {"message": "Friend request sent"}

@app.post("/friends/respond/{request_id}/{action}")
async def respond_friend_request(
    request_id: int,
    action: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(FriendRequest).filter(FriendRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to respond to this request")

    if action == "accept":
        req.status = "accepted"
    elif action == "reject":
        req.status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    db.commit()
    return {"message": f"Friend request {action}ed"}

@app.get("/friends/requests/received", response_model=List[FriendRequestResponse])
async def get_friend_requests_received(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    requests = db.query(FriendRequest).filter(
        FriendRequest.receiver_id == current_user.id,
        FriendRequest.status == "pending"
    ).all()
    
    for req in requests:
        requester = db.query(User).filter(User.id == req.requester_id).first()
        req.requester_username = requester.username if requester else "Unknown"
        
    return requests

@app.get("/friends/requests/sent", response_model=List[FriendRequestResponse])
async def get_friend_requests_sent(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    requests = db.query(FriendRequest).filter(
        FriendRequest.requester_id == current_user.id,
        FriendRequest.status == "pending"
    ).all()
    
    for req in requests:
        receiver = db.query(User).filter(User.id == req.receiver_id).first()
        req.receiver_username = receiver.username if receiver else "Unknown"
        
    return requests

@app.get("/friends", response_model=List[FriendResponse])
async def get_friends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Find all accepted requests where user is either requester or receiver
    friendships = db.query(FriendRequest).filter(
        or_(
            FriendRequest.requester_id == current_user.id,
            FriendRequest.receiver_id == current_user.id
        ),
        FriendRequest.status == "accepted"
    ).all()

    friends = []
    for f in friendships:
        friend_id = f.receiver_id if f.requester_id == current_user.id else f.requester_id
        friend = db.query(User).filter(User.id == friend_id).first()
        if friend:
            friends.append(friend)
    
    return friends

@app.get("/users/search", response_model=List[FriendResponse])
async def search_users(query: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not query:
        return []
    users = db.query(User).filter(User.username.ilike(f"%{query}%"), User.id != current_user.id).limit(10).all()
    return users

# --- Chat System ---

@app.get("/chat/history/{friend_id}", response_model=List[ChatMessageResponse])
async def get_chat_history(
    friend_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(ChatMessage).filter(
        or_(
            and_(ChatMessage.sender_id == current_user.id, ChatMessage.receiver_id == friend_id),
            and_(ChatMessage.sender_id == friend_id, ChatMessage.receiver_id == current_user.id)
        )
    ).order_by(ChatMessage.timestamp.asc()).all()
    return messages

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        # Map user_id to list of active websocket connections (allowing multiple tabs)
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/chat/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int, token: str = Query(...), db: Session = Depends(get_db)):
    # Verify token
    # Note: In a real app, you'd want a more robust way to auth websockets, 
    # but passing token in query param is a common simple pattern.
    email = None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user = db.query(User).filter(User.email == email).first()
    if not user or user.id != client_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, user.id)
    try:
        while True:
            data = await websocket.receive_json()
            # data should contain { "receiver_id": int, "content": str }
            receiver_id = data.get("receiver_id")
            content = data.get("content")
            
            if receiver_id and content:
                # Save to DB
                # Note: creating a new session here because the dependency one might be closed or not thread-safe in the loop? 
                # Actually Depends(get_db) works for the initial setup, but for the loop we might need a fresh session or use the existing one carefully.
                # Ideally, we should use `async with SessionLocal() as session:` but our SessionLocal is sync.
                # For this simple implementation, we'll use the `db` session passed in, but we need to be careful about commits.
                
                new_msg = ChatMessage(sender_id=user.id, receiver_id=receiver_id, content=content)
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)
                
                response_data = {
                    "id": new_msg.id,
                    "sender_id": user.id,
                    "receiver_id": receiver_id,
                    "content": content,
                    "timestamp": new_msg.timestamp.isoformat()
                }
                
                # Send to receiver
                await manager.send_personal_message(response_data, receiver_id)
                # Send back to sender (so they see it confirmed/echoed)
                await manager.send_personal_message(response_data, user.id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id)


# --- How to Run ---
# 1. Make sure you have the required libraries:
#    pip install fastapi uvicorn sqlalchemy pydantic passlib[bcrypt] python-jose[cryptography] python-multipart psycopg2-binary python-dotenv
# 2. Save this file as main.py
# 3. Run the server from your terminal:
#    uvicorn main:app --reload
