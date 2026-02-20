# 🚀 ShopSense AI - Quick Setup Guide

## ⚠️ CRITICAL: Security Setup Required

Before running the application, you **MUST** replace the placeholder credentials.

---

## 🔐 Step 1: Set Up MongoDB

### Option A: MongoDB Atlas (Recommended - Cloud)

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Create a new cluster** (free tier available)
3. **Set up database access**:
   - Click "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create username and strong password
   - Grant "Read and write to any database" permission
4. **Get connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your user's password
5. **Update `.env` file**:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/shopsense_analytics?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

1. **Install MongoDB** (if not installed):
   - Windows: https://www.mongodb.com/try/download/community
   - Or use Docker: `docker run -d -p 27017:27017 --name mongo mongo:7.0`

2. **Update `.env` file**:
   ```env
   MONGO_URI=mongodb://localhost:27017/shopsense_analytics
   ```

---

## 🔑 Step 2: Set Up Google Gemini API

1. **Go to Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Create API key**:
   - Click "Create API Key"
   - Select your Google Cloud project (or create new)
   - Copy the API key
3. **Update `.env` file**:
   ```env
   GEMINI_API_KEY=your-new-api-key-here
   ```

---

## 🖥️ Step 3: Backend Setup

### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

If you get a timeout, install key packages first:
```bash
pip install Flask flask-cors pymongo python-dotenv PyJWT bcrypt
pip install pandas numpy plotly prophet
pip install google-generativeai openpyxl
```

### Run Backend

```bash
python app.py
```

You should see:
```
✅ ShopSense AI initialized (development mode)
✅ MongoDB connected
API blueprints registered
Starting ShopSense AI in development mode on 0.0.0.0:5000
```

Backend runs on: **http://localhost:5000**

---

## 🎨 Step 4: Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Run Frontend

```bash
npm run dev
```

You should see:
```
VITE v6.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

Frontend runs on: **http://localhost:5173**

---

## ✅ Verify Setup

1. **Open browser**: http://localhost:5173
2. **Create account**: Click "Sign Up"
3. **Register**:
   - Username: `admin`
   - Email: `admin@shopsense.ai`
   - Password: `Admin123!@#`
4. **Login** with your credentials
5. **Upload sample data** (see below)

---

## 📊 Sample Data Format

Create a CSV file with these columns:

```csv
product_name,date,units_sold,price
Product A,2024-01-01,100,19.99
Product A,2024-01-02,120,19.99
Product B,2024-01-01,50,29.99
Product B,2024-01-02,60,29.99
```

**Requirements**:
- Required columns: `product_name`, `date`, `units_sold`, `price`
- Date format: `YYYY-MM-DD`
- Minimum 7 days of data for forecasting

---

## 🧪 Test the API

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"Test123!@#\"}"

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"test@example.com\",\"password\":\"Test123!@#\"}"
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error

```
❌ MongoDB connection failed
```

**Fix**:
- Check MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`
- Verify connection string in `.env`
- Check firewall settings

### Module Not Found

```
ModuleNotFoundError: No module named 'flask_cors'
```

**Fix**:
```bash
cd backend
pip install -r requirements.txt
```

### Port Already in Use

```
Address already in use
```

**Fix**:
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port
set PORT=5001
python app.py
```

### Frontend Won't Start

```
npm ERR! code ENOENT
```

**Fix**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FLASK_ENV` | No | `development` | Environment mode |
| `FLASK_DEBUG` | No | `True` | Debug mode |
| `SECRET_KEY` | **Yes** | - | App secret (32+ chars) |
| `JWT_SECRET_KEY` | **Yes** | - | JWT secret (32+ chars) |
| `MONGO_URI` | **Yes** | - | MongoDB connection string |
| `GEMINI_API_KEY` | **Yes** | - | Google Gemini API key |
| `CORS_ORIGINS` | No | `localhost:5173` | Allowed origins |
| `PORT` | No | `5000` | Backend port |

---

## 🎯 Next Steps

1. ✅ Set up MongoDB
2. ✅ Get Gemini API key
3. ✅ Update `.env` file
4. ✅ Install dependencies
5. ✅ Run backend
6. ✅ Run frontend
7. ✅ Create account
8. ✅ Upload data
9. ✅ Explore analytics!

---

## 📞 Need Help?

- **Documentation**: See `docs/` folder
- **API Reference**: `docs/API.md`
- **Developer Guide**: `docs/DEVELOPER_GUIDE.md`
- **Issues**: Create GitHub issue

---

**Ready to analyze your sales data! 🚀**
