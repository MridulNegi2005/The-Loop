<div align="center">
  <img src="public/logo_transparent-512x512.PNG" alt="The Loop Logo" width="150" />
  <br />
  <h3>Find Your Vibe. Connect with Campus.</h3>
  <p>
    A comprehensive college event aggregator and social platform designed to ensure you never miss out on what's happening on campus.
  </p>
</div>

<br />

## About The Loop

**The Loop** is a centralized platform developed to solve the fragmentation of campus event information. It bridges the gap between student organizers and attendees by combining event discovery, social coordination, and logistics into a single unified interface.

This project was built as part of the **UCS503 - Software Engineering** course.

### Key Objectives
*   **Centralize Information:** A single source of truth for all workshops, fests, and club activities.
*   **Enhance Social Connectivity:** Enable students to see who is attending and coordinate plans.
*   **Simplify Logistics:** Integrated carpooling to facilitate travel to venues.

## Features

### Smart Event Discovery
*   **Personalized Feed:** AI-driven recommendation engine using **Cosine Similarity** matches events to your interest tags.
*   **Advanced Filtering:** Sort by category, date, or popularity.

### Social Integration
*   **Friends System:** Send requests, vie profiles, and build your campus network.
*   **Real-time Chat:** Instant messaging powered by **WebSockets** for seamless coordination.
*   **Live Status:** See when friends are online or attending specific events.

### Carpool Coordination
*   **Ride Sharing:** Create or join carpool groups for specific events.
*   **Capacity Management:** Real-time seat tracking and request approval workflow.

## Architecture

The application follows a modern **Three-Tier Architecture**:

1.  **Presentation Layer (Frontend):** Built with **React** and **Tailwind CSS**, optimized as a Progressive Web App (PWA) for mobile-native feel.
2.  **Logic Layer (Backend):** High-performance REST API built with **FastAPI** (Python), handling authentication, data processing, and recommendation logic.
3.  **Data Layer:** **PostgreSQL** (Production) / **SQLite** (Dev) with **SQLAlchemy ORM** for robust data management.


## Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion |
| **Backend** | FastAPI, Python |
| **Database** | PostgreSQL, SQLAlchemy |
| **Auth** | Google OAuth 2.0 (JWT) |
| **Real-time** | WebSockets |
| **Maps** | Google Maps JavaScript API |

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   Python (v3.10+)
*   PostgreSQL (optional, defaults to SQLite)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/the-loop.git
    cd the-loop
    ```

2.  **Frontend Setup**
    ```bash
    npm install
    npm run dev
    ```

3.  **Backend Setup**
    ```bash
    # Create virtual environment
    python -m venv venv
    
    # Activate script (Windows)
    venv\Scripts\activate
    
    # Install dependencies
    pip install -r requirements.txt
    ```

4.  **Configuration**
    Create a `.env` file in the root directory with the following keys:
    ```env
    # Database
    DATABASE_URL=sqlite:///./event_aggregator.db
    
    # API & Frontend URLs
    VITE_API_URL=http://localhost:8000
    VITE_WS_URL=ws://localhost:8000
    
    # Security
    SECRET_KEY=your_super_secret_key_here
    ALGORITHM=HS256
    
    # Google Services
    VITE_GOOGLE_CLIENT_ID=your_google_client_id
    VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
    
    # Admin
    ADMIN_EMAILS=admin@example.com
    ```

5.  **Run the Server**
    ```bash
    uvicorn main:app --reload
    ```

## Contributing

We welcome contributions! Please follow these steps:
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

---