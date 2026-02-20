"""
Simple test without emoji characters
"""
import requests
import json
import sys

# Set stdout to use UTF-8
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'http://localhost:5000/api'

print("=" * 60)
print("Testing ShopSense AI Login API")
print("=" * 60)

# Test 1: Check if backend is running
print("\n1. Testing if backend is running...")
try:
    response = requests.get(f'{BASE_URL}/health', timeout=5)
    print("   [OK] Backend is running")
except:
    print("   [ERROR] Backend is NOT running!")
    print("   Start it with: cd backend && python app.py")
    exit(1)

# Test 2: Try to login with your credentials
print("\n2. Testing login with your credentials...")
login_data = {
    "identifier": "tjo200101@gmail.com",
    "password": "TJO@200101"
}

try:
    response = requests.post(
        f'{BASE_URL}/auth/login',
        json=login_data,
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   [SUCCESS] Login successful!")
        data = response.json()
        print(f"   User: {data.get('data', {}).get('user', {}).get('email', 'Unknown')}")
    elif response.status_code == 400:
        print("   [ERROR] Bad Request - Invalid request format")
        error_data = response.json()
        print(f"   Error: {error_data.get('error', {}).get('message', 'Unknown')}")
    elif response.status_code == 401:
        print("   [ERROR] Invalid credentials")
        error_data = response.json()
        print(f"   Error: {error_data.get('error', {}).get('message', 'Unknown')}")
except Exception as e:
    print(f"   [ERROR] Request failed: {e}")

print("\n" + "=" * 60)
