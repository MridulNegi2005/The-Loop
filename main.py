# main.py
# --- Imports ---
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
# NEW: Import for CORS Middleware
from fastapi.middleware.cors import CORSMiddleware

# --- Pydantic Models (Data Shapes) ---
class Event(BaseModel):
    id: str
    title: str
    description: str
    start_at: str
    end_at: str
    venue: str
    tags: List[str]
    lat: float
    lng: float

# --- FastAPI App Initialization ---
app = FastAPI()

# --- CORS (Cross-Origin Resource Sharing) Middleware (NEW) ---
# This is the "bouncer" for our API. It tells the browser that it's safe
# for our React app (running on a different port) to request data.
origins = [
    "http://localhost:3000", # The default port for React dev servers
    "http://localhost:5173", # The default port for Vite dev servers
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)


# --- Mock Database ---
db_events = [
  { "id": "evt_123", "title": "Annual Tech Fest Kick-off", "description": "Join us for the opening ceremony of the biggest tech fest on campus. Keynotes, food, and fun!", "start_at": "2025-09-01T18:00:00Z", "end_at": "2025-09-01T20:00:00Z", "venue": "Main Auditorium", "tags": ["productive", "tech", "fest"], "lat": 30.3558, "lng": 76.3625 },
  { "id": "evt_124", "title": "Acoustic Night at the Cafe", "description": "Unwind with some live music from talented student artists. Grab a coffee and enjoy the vibes.", "start_at": "2025-09-03T19:30:00Z", "end_at": "2025-09-03T21:00:00Z", "venue": "The Student Cafe", "tags": ["chill", "music", "art"], "lat": 30.3532, "lng": 76.3651 },
  { "id": "evt_125", "title": "Late Night Dance Party", "description": "DJ Ron is back with the hottest tracks. Get ready to dance the night away!", "start_at": "2025-09-05T22:00:00Z", "end_at": "2025-09-06T02:00:00Z", "venue": "Gymnasium Hall", "tags": ["wild", "dance", "late-night"], "lat": 30.3571, "lng": 76.3689 },
]


# --- API Endpoints ---
@app.get("/events", response_model=List[Event])
async def get_all_events():
    return db_events

@app.get("/")
async def root():
    return {"message": "Event Aggregator API is running!"}

# To run this server:
# 1. Make sure you have fastapi and uvicorn installed:
#    pip install fastapi "uvicorn[standard]"
# 2. Save this file as main.py
# 3. In your terminal, run:
#    uvicorn main:app --reload
