@echo off
echo ============================================================
echo ShopSense AI - Quick Debug Start
echo ============================================================
echo.

echo Step 1: Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python not found! Install Python 3.11+
    pause
    exit /b 1
)
echo.

echo Step 2: Checking MongoDB connection...
python -c "from pymongo import MongoClient; from dotenv import load_dotenv; import os; load_dotenv(); c = MongoClient(os.getenv('MONGO_URI'), serverSelectionTimeoutMS=2000); c.admin.command('ping'); print('MongoDB OK')" 2>nul
if errorlevel 1 (
    echo WARNING: MongoDB connection failed!
    echo Check your MONGO_URI in .env file
    echo.
)
echo.

echo Step 3: Starting backend server...
echo Backend will run on http://localhost:5000
echo Press Ctrl+C to stop
echo.
echo ============================================================
echo.
python app.py
