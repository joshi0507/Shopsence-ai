# ShopSense AI - Backend Health Check Script
"""
Run this script to check if your backend is properly configured.
"""

import sys
import os

print("=" * 60)
print("ShopSense AI - Backend Configuration Check")
print("=" * 60)

# Check 1: Environment variables
print("\n1. Checking environment variables...")
from dotenv import load_dotenv
load_dotenv()

required_vars = ['SECRET_KEY', 'JWT_SECRET_KEY', 'MONGO_URI']
missing_vars = []

for var in required_vars:
    value = os.getenv(var)
    if value:
        if 'REPLACE' in value or 'CHANGE_THIS' in value:
            print(f"   ⚠️  {var}: Set but needs to be changed")
        else:
            print(f"   ✅ {var}: Configured")
    else:
        missing_vars.append(var)
        print(f"   ❌ {var}: MISSING")

# Check 2: Required packages
print("\n2. Checking required packages...")
packages = {
    'flask': 'Flask',
    'flask_cors': 'Flask-CORS',
    'pymongo': 'pymongo',
    'jwt': 'PyJWT',
    'bcrypt': 'bcrypt',
    'pandas': 'pandas',
    'numpy': 'numpy',
    'plotly': 'plotly',
}

for package, pip_name in packages.items():
    try:
        __import__(package)
        print(f"   ✅ {pip_name}")
    except ImportError:
        print(f"   ❌ {pip_name} - Run: pip install {pip_name}")

# Check 3: MongoDB connection
print("\n3. Checking MongoDB connection...")
try:
    from pymongo import MongoClient
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    if 'REPLACE' in mongo_uri:
        print(f"   ⚠️  MongoDB URI needs to be configured")
        print(f"       Current: {mongo_uri}")
    else:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print(f"   ✅ MongoDB connected successfully")
        print(f"       URI: {mongo_uri[:30]}...")
except Exception as e:
    print(f"   ❌ MongoDB connection failed")
    print(f"       Error: {str(e)}")
    print(f"       \n   To fix:")
    print(f"       1. Update MONGO_URI in .env file")
    print(f"       2. Make sure MongoDB is running")
    print(f"       3. Check firewall settings")

# Check 4: File structure
print("\n4. Checking file structure...")
required_files = [
    'app.py',
    'security_config.py',
    'config.py',
    'requirements.txt',
    '.env',
]

for file in required_files:
    if os.path.exists(file):
        print(f"   ✅ {file}")
    else:
        print(f"   ❌ {file} - MISSING")

# Check 5: Routes
print("\n5. Checking route blueprints...")
routes = ['auth', 'uploads', 'analytics', 'dashboard', 'exports']
for route in routes:
    route_file = f'routes/{route}.py'
    if os.path.exists(route_file):
        print(f"   ✅ {route_file}")
    else:
        print(f"   ❌ {route_file} - MISSING")

print("\n" + "=" * 60)
print("Configuration Check Complete")
print("=" * 60)

if missing_vars:
    print("\n⚠️  ACTION REQUIRED:")
    print("   Edit the .env file and set the following variables:")
    for var in missing_vars:
        print(f"   - {var}")
    print("\n   Then restart the backend.")

print("\n✅ If all checks passed, run: python app.py")
print("=" * 60)
