# 🔧 Troubleshooting Guide - ShopSense AI

## ❌ Login/Register Not Working (400 Error)

### Problem
Getting `400 (BAD REQUEST)` error when trying to login or register.

### Solution

#### 1. Check Backend is Running

```bash
# Open a terminal and check
cd backend
python app.py
```

**Expected output:**
```
✅ ShopSense AI initialized (development mode)
✅ MongoDB connected
API blueprints registered
Starting ShopSense AI in development mode on 0.0.0.0:5000
```

**If you see errors:**

**Error: MongoDB connection failed**
```
❌ MongoDB connection failed: ...
```

**Fix:**
1. Open `backend/.env` file
2. Update `MONGO_URI` with your MongoDB connection string
3. For local MongoDB: `MONGO_URI=mongodb://localhost:27017/shopsense_analytics`
4. For MongoDB Atlas: Get connection string from https://cloud.mongodb.com/

**Error: Module not found**
```
ModuleNotFoundError: No module named 'flask_cors'
```

**Fix:**
```bash
cd backend
pip install -r requirements.txt
```

---

#### 2. Run Configuration Check

```bash
cd backend
python check_setup.py
```

This will check:
- ✅ Environment variables are set
- ✅ Required packages are installed
- ✅ MongoDB connection works
- ✅ All required files exist

---

#### 3. Test API Directly

**Test registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"Test123!@#\"}"
```

**Expected response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": { ... }
}
```

**If you get 400 error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "..."
  }
}
```

Check the error message - it will tell you what's wrong.

---

#### 4. Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors

**Common errors:**

**"Connection refused"**
- Backend is not running
- Start backend: `python app.py`

**"CORS error"**
- Backend CORS not configured correctly
- Check `backend/.env` has: `CORS_ORIGINS=http://localhost:5173`

**"400 Bad Request"**
- Check backend logs for details
- Run: `python check_setup.py`

---

#### 5. Verify .env File

Open `backend/.env` and verify:

```env
# Should NOT contain "REPLACE" or "CHANGE_THIS"
SECRET_KEY=f1bf921b4ec85e3f43206b3d3cd3225ff5ea229d3b83557a7a454dac94d66934
JWT_SECRET_KEY=17b65217674feae1a9b0200e3869642dee13a4f7d65a94e7195735602beefb89

# Should be your actual MongoDB connection
MONGO_URI=mongodb://localhost:27017/shopsense_analytics
# OR for Atlas:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/shopsense

# Should be your actual Gemini API key
GEMINI_API_KEY=your-actual-api-key
```

---

## 🛠️ Common Issues & Fixes

### Issue: "ModuleNotFoundError"

```bash
cd backend
pip install Flask flask-cors pymongo python-dotenv PyJWT bcrypt
pip install pandas numpy plotly google-generativeai openpyxl
```

### Issue: "Port already in use"

**Windows:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID 12345 /F
```

**Or change port:**
```bash
set PORT=5001
python app.py
```

### Issue: MongoDB not running

**Start local MongoDB:**
```bash
# Windows (if installed as service)
net start MongoDB

# Or use Docker
docker run -d -p 27017:27017 --name mongo mongo:7.0
```

### Issue: Frontend won't connect to backend

1. Check backend is running on port 5000
2. Check frontend API URL: `frontend/src/lib/api.ts`
   ```typescript
   const API_BASE_URL = "http://localhost:5000/api";
   ```
3. Check CORS in `backend/.env`:
   ```env
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```

---

## 📝 Quick Fix Checklist

Run through this checklist:

- [ ] 1. Backend installed: `pip install -r requirements.txt`
- [ ] 2. MongoDB running: `mongosh --eval "db.adminCommand('ping')"`
- [ ] 3. `.env` file configured (no "REPLACE" placeholders)
- [ ] 4. Backend starts without errors: `python app.py`
- [ ] 5. Frontend starts: `npm run dev`
- [ ] 6. Can access backend: http://localhost:5000/api/health
- [ ] 7. Can access frontend: http://localhost:5173

---

## 🆘 Still Having Issues?

### Get Backend Logs

```bash
cd backend
python app.py 2>&1 | tee backend.log
```

Check `backend.log` for errors.

### Test Database Connection

```bash
cd backend
python -c "from pymongo import MongoClient; from dotenv import load_dotenv; import os; load_dotenv(); c = MongoClient(os.getenv('MONGO_URI')); print('Connected!' if c.admin.command('ping') else 'Failed')"
```

### Reset Everything

```bash
# Backend
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Success Indicators

You know it's working when:

1. **Backend terminal shows:**
   ```
   ✅ ShopSense AI initialized
   ✅ MongoDB connected
   API blueprints registered
   ```

2. **Frontend loads** at http://localhost:5173

3. **Can create account** - No errors on registration

4. **Can login** - Redirects to dashboard

5. **Can upload data** - CSV upload works

---

**Need more help? Check:**
- `SETUP_GUIDE.md` - Full setup instructions
- `docs/API.md` - API documentation
- `docs/DEVELOPER_GUIDE.md` - Developer guide
