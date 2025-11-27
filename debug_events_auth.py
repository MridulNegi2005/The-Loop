import requests

API_URL = "http://localhost:8000"
INVALID_TOKEN = "invalid_token_string"

def test_events_auth():
    print(f"Testing {API_URL}/events with invalid token...")
    headers = {"Authorization": f"Bearer {INVALID_TOKEN}"}
    try:
        response = requests.get(f"{API_URL}/events", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("FAIL: Endpoint returned 401 for optional auth with invalid token.")
        elif response.status_code == 200:
            print("SUCCESS: Endpoint handled invalid token gracefully (treated as anonymous).")
        else:
            print(f"Unexpected status code: {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_events_auth()
