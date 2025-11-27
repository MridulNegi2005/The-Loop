import requests
import json

BASE_URL = "http://localhost:8000"

def test_recommendation_flow():
    # 1. Create a user
    email = "test_rec_user@example.com"
    password = "password123"
    username = "test_rec_user"
    
    print(f"Creating user {email}...")
    try:
        requests.post(f"{BASE_URL}/users/signup", json={"email": email, "password": password, "username": username})
    except:
        pass # User might already exist

    # 2. Login
    print("Logging in...")
    resp = requests.post(f"{BASE_URL}/users/login", data={"username": email, "password": password})
    if resp.status_code != 200:
        print("Login failed:", resp.text)
        return
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Set interests
    print("Setting interests to ['tech']...")
    requests.put(f"{BASE_URL}/users/me", json={"interests": ["tech"]}, headers=headers)

    # 4. Fetch events and check scores
    print("Fetching events...")
    resp = requests.get(f"{BASE_URL}/events", headers=headers)
    events = resp.json()
    
    print("\nTop 3 recommended events:")
    for e in events[:3]:
        print(f"- {e['title']} (Match: {e.get('match_percentage')}%, Score: {e.get('match_score'):.2f}, Tags: {e['tags']})")

    # 5. Join an event (e.g., the first one)
    event_to_join = events[0]
    print(f"\nJoining event: {event_to_join['title']} (ID: {event_to_join['id']})...")
    resp = requests.post(f"{BASE_URL}/events/{event_to_join['id']}/join", headers=headers)
    print("Join response:", resp.json())

    # 6. Fetch events again and check if scores changed (or at least if joined status is true)
    print("\nFetching events again...")
    resp = requests.get(f"{BASE_URL}/events", headers=headers)
    events_after = resp.json()
    
    joined_event = next((e for e in events_after if e['id'] == event_to_join['id']), None)
    if joined_event:
        print(f"Joined event status: {joined_event.get('is_joined')}")
        print(f"Joined event match: {joined_event.get('match_percentage')}%")
    
    # Check if other events with similar tags got bumped
    print("\nTop 3 recommended events after joining:")
    for e in events_after[:3]:
        print(f"- {e['title']} (Match: {e.get('match_percentage')}%, Score: {e.get('match_score'):.2f}, Tags: {e['tags']})")

if __name__ == "__main__":
    test_recommendation_flow()
