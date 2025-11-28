import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def make_request(method, endpoint, data=None, headers=None):
    url = f"{BASE_URL}{endpoint}"
    if headers is None:
        headers = {}
    
    if data is not None:
        data_bytes = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    else:
        data_bytes = None

    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            resp_body = response.read().decode('utf-8')
            try:
                return response.status, json.loads(resp_body)
            except:
                return response.status, resp_body
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(resp_body)
        except:
            return e.code, resp_body
    except Exception as e:
        print(f"Request failed: {e}")
        return 500, str(e)

def create_user(username, email, password):
    status, body = make_request("POST", "/users/signup", {
        "username": username,
        "email": email,
        "password": password
    })
    if status == 201:
        print(f"Created user {username}")
        return True
    elif status == 400 and "already" in str(body):
        print(f"User {username} already exists")
        return True
    else:
        print(f"Failed to create user {username}: {body}")
        return False

def login(email, password):
    # Login expects form data, not JSON
    url = f"{BASE_URL}/users/login"
    data = urllib.parse.urlencode({
        "username": email,
        "password": password
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            body = json.loads(response.read().decode('utf-8'))
            return body["access_token"]
    except Exception as e:
        print(f"Login failed for {email}: {e}")
        return None

def test_friends_flow():
    print("\n--- Testing Friends Flow ---")
    u1 = f"userA_{int(time.time())}"
    u2 = f"userB_{int(time.time())}"
    create_user(u1, f"{u1}@test.com", "password")
    create_user(u2, f"{u2}@test.com", "password")
    
    token1 = login(f"{u1}@test.com", "password")
    token2 = login(f"{u2}@test.com", "password")
    
    if not token1 or not token2:
        return

    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}
    
    _, user1_data = make_request("GET", "/users/me", headers=headers1)
    user1_id = user1_data["id"]
    _, user2_data = make_request("GET", "/users/me", headers=headers2)
    user2_id = user2_data["id"]
    
    print(f"User A ({user1_id}) sending request to User B ({user2_id})...")
    status, body = make_request("POST", f"/friends/request/{user2_id}", headers=headers1)
    print(f"Send Response: {status} {body}")
    assert status == 200
    
    print("User B checking received requests...")
    status, reqs = make_request("GET", "/friends/requests/received", headers=headers2)
    print(f"Received Requests: {reqs}")
    assert len(reqs) > 0
    req_id = reqs[0]["id"]
    assert reqs[0]["requester_id"] == user1_id
    
    print(f"User B accepting request {req_id}...")
    status, body = make_request("POST", f"/friends/respond/{req_id}/accept", headers=headers2)
    print(f"Accept Response: {status} {body}")
    assert status == 200
    
    print("Verifying Friends Lists...")
    _, friends1 = make_request("GET", "/friends", headers=headers1)
    _, friends2 = make_request("GET", "/friends", headers=headers2)
    
    print(f"User A Friends: {[f['username'] for f in friends1]}")
    print(f"User B Friends: {[f['username'] for f in friends2]}")
    
    assert any(f["id"] == user2_id for f in friends1)
    assert any(f["id"] == user1_id for f in friends2)
    print("Friends verification passed!")
    
    return user1_id, user2_id, token1, token2

def test_chat_flow(user1_id, user2_id, token1, token2):
    print("\n--- Testing Chat Persistence ---")
    headers1 = {"Authorization": f"Bearer {token1}"}
    
    print("Checking Chat History (should be empty initially)...")
    status, body = make_request("GET", f"/chat/history/{user2_id}", headers=headers1)
    print(f"History: {body}")
    assert status == 200
    assert isinstance(body, list)
    print("Chat History endpoint works.")

def test_search_flow(token):
    print("\n--- Testing User Search ---")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Search for "user" (should find the created users)
    print("Searching for 'user'...")
    status, results = make_request("GET", "/users/search?query=user", headers=headers)
    print(f"Search Results: {results}")
    assert status == 200
    assert isinstance(results, list)
    assert len(results) > 0
    print("Search verification passed!")

if __name__ == "__main__":
    try:
        res = test_friends_flow()
        if res:
            u1, u2, t1, t2 = res
            test_chat_flow(u1, u2, t1, t2)
            test_search_flow(t1)
            print("\nALL TESTS PASSED")
    except Exception as e:
        print(f"\nTEST FAILED: {e}")
        import traceback
        traceback.print_exc()
