import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def make_request(method, endpoint, data=None, headers=None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method)
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    if data:
        json_data = json.dumps(data).encode("utf-8")
        req.add_header("Content-Type", "application/json")
        req.data = json_data
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())
    except Exception as e:
        return 0, str(e)

import time

def check_users():
    # 1. Create a temp user to get a token
    ts = int(time.time())
    username = f"debug_user_{ts}"
    password = "password123"
    email = f"debug_user_{ts}@test.com"
    
    print(f"Registering temp user {username}...")
    # Use /users/signup
    status, res = make_request("POST", "/users/signup", {"username": username, "email": email, "password": password})
    print(f"Registration status: {status}, Response: {res}")
    
    print("Logging in...")
    # Use /users/login and form data
    url = f"{BASE_URL}/users/login"
    data = urllib.parse.urlencode({
        "username": email, 
        "password": password
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            token_data = json.loads(response.read().decode('utf-8'))
            status = 200
    except Exception as e:
        print(f"Login failed: {e}")
        # Try to read error body if possible
        if hasattr(e, 'read'):
             print(f"Error body: {e.read().decode()}")
        return

    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Search for "Mridul" (User's claim)
    print("\nSearching for 'Mridul'...")
    status, results = make_request("GET", "/users/search?query=Mridul", headers=headers)
    print(f"Results for 'Mridul': {results}")
    
    # 3. Search for "MridulNegi"
    print("\nSearching for 'MridulNegi'...")
    status, results = make_request("GET", "/users/search?query=MridulNegi", headers=headers)
    print(f"Results for 'MridulNegi': {results}")

    # 4. Search for "debug_user" (Self check)
    print("\nSearching for 'debug_user'...")
    status, results = make_request("GET", "/users/search?query=debug_user", headers=headers)
    print(f"Results for 'debug_user': {results}")

if __name__ == "__main__":
    check_users()
