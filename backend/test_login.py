"""
Test the login API directly
"""
import requests
import json

BASE_URL = 'http://localhost:5000/api'

print("=" * 60)
print("Testing ShopSense AI Login API")
print("=" * 60)

# Test 1: Check if backend is running
print("\n1. Testing if backend is running...")
try:
    response = requests.get(f'{BASE_URL}/health', timeout=5)
    print(f"   ✅ Backend is running")
except:
    print(f"   ❌ Backend is NOT running!")
    print(f"      Start it with: cd backend && python app.py")
    exit(1)

# Test 2: Try to register a new user
print("\n2. Testing user registration...")
test_user = {
    "username": "testuser123",
    "email": "test123@example.com",
    "password": "Test123!@#",
    "company_name": "Test Corp"
}

try:
    response = requests.post(
        f'{BASE_URL}/auth/register',
        json=test_user,
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print(f"   ✅ Registration successful!")
    elif response.status_code == 400:
        print(f"   ⚠️  Registration failed - validation error")
        error_data = response.json()
        if 'error' in error_data:
            print(f"      Error: {error_data['error']['message']}")
    elif response.status_code == 409:
        print(f"   ℹ️  User already exists (this is OK)")
except Exception as e:
    print(f"   ❌ Registration failed: {e}")

# Test 3: Try to login
print("\n3. Testing login...")
login_data = {
    "identifier": "test123@example.com",
    "password": "Test123!@#"
}

try:
    response = requests.post(
        f'{BASE_URL}/auth/login',
        json=login_data,
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print(f"   ✅ Login successful!")
        token = response.json().get('data', {}).get('access_token')
        if token:
            print(f"   Token received: {token[:50]}...")
    elif response.status_code == 400:
        print(f"   ❌ Login failed - 400 Bad Request")
        error_data = response.json()
        if 'error' in error_data:
            print(f"      Error: {error_data['error']['message']}")
            print(f"      \n   This means the request format is wrong.")
            print(f"   Check that you're sending:")
            print(f"   {{")
            print(f"     \"identifier\": \"email or username\",")
            print(f"     \"password\": \"your password\"")
            print(f"   }}")
    elif response.status_code == 401:
        print(f"   ❌ Login failed - invalid credentials")
except Exception as e:
    print(f"   ❌ Login failed: {e}")

print("\n" + "=" * 60)
print("Test Complete")
print("=" * 60)
