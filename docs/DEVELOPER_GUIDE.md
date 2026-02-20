# ShopSense AI - Developer Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment](#development-environment)
3. [Backend Development](#backend-development)
4. [Frontend Development](#frontend-development)
5. [Database Schema](#database-schema)
6. [API Development](#api-development)
7. [Testing Guide](#testing-guide)
8. [Deployment Guide](#deployment-guide)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Web App    │  │ Mobile App  │  │  API Client │         │
│  │  (React)    │  │ (Future)    │  │  (SDK)      │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                  │
│         └────────────────┴────────────────┘                  │
│                      │                                        │
│                 ┌────▼────┐                                  │
│                 │   CDN   │                                  │
│                 └────┬────┘                                  │
└──────────────────────┼────────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────────┐
│                     API Gateway                                │
│         (Rate Limiting │ Auth │ Routing)                      │
└──────────────────────┬────────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────────┐
│                   Application Layer                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Flask Application                      │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │ │
│  │  │   Auth   │ │ Uploads  │ │Analytics │ │Dashboard │   │ │
│  │  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │   │ │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │ │
│  │       │            │            │            │          │ │
│  │  ┌────▼────────────▼────────────▼────────────▼─────┐   │ │
│  │  │              Services Layer                      │   │ │
│  │  │  AuthService │ AnalyticsService │ ForecastService│   │ │
│  │  └──────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────┬────────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────────┐
│                      Data Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  MongoDB    │  │    Redis    │  │  File Store │          │
│  │  (Primary)  │  │   (Cache)   │  │    (S3)     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
shopsense-ai/
├── backend/
│   ├── app.py                    # Application factory
│   ├── security_config.py        # Security configuration
│   ├── config.py                 # Environment config
│   ├── gemini_service.py         # Google Gemini integration
│   ├── analytics_mongo.py        # Legacy analytics (to be deprecated)
│   │
│   ├── routes/                   # API Route Blueprints
│   │   ├── __init__.py
│   │   ├── auth.py              # /api/auth/*
│   │   ├── uploads.py           # /api/uploads/*
│   │   ├── analytics.py         # /api/analytics/*
│   │   └── dashboard.py         # /api/dashboard/*
│   │
│   ├── models/                   # Database Models
│   │   ├── __init__.py
│   │   ├── user.py              # User model
│   │   ├── upload.py            # UploadSession model
│   │   └── sales_data.py        # SalesData model
│   │
│   ├── services/                 # Business Logic
│   │   ├── __init__.py
│   │   ├── auth_service.py      # JWT authentication
│   │   ├── analytics_service.py # Analytics logic
│   │   └── forecast_service.py  # Forecasting logic
│   │
│   ├── middleware/               # Request Middleware
│   │   ├── __init__.py
│   │   ├── auth_middleware.py   # JWT decorators
│   │   ├── error_handler.py     # Error handling
│   │   └── rate_limiter.py      # Rate limiting
│   │
│   ├── utils/                    # Utilities
│   │   ├── __init__.py
│   │   ├── validators.py        # Input validation
│   │   └── helpers.py           # Helper functions
│   │
│   ├── tests/                    # Test Suite
│   │   ├── conftest.py          # Pytest fixtures
│   │   ├── test_auth.py         # Auth tests
│   │   ├── test_analytics.py    # Analytics tests
│   │   ├── test_uploads.py      # Upload tests
│   │   └── test_security.py     # Security tests
│   │
│   ├── templates/                # HTML Templates (legacy)
│   ├── uploads/                  # Uploaded files
│   ├── logs/                     # Application logs
│   └── requirements.txt          # Dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Root component
│   │   ├── main.tsx             # Entry point
│   │   │
│   │   ├── components/          # React Components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DataUpload.tsx
│   │   │   ├── AnalysisReport.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   └── ...
│   │   │
│   │   ├── lib/                 # Libraries
│   │   │   ├── api.ts          # API client
│   │   │   └── utils.ts        # Utilities
│   │   │
│   │   └── hooks/               # Custom Hooks
│   │       └── ...
│   │
│   ├── public/                   # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                         # Documentation
│   ├── API.md                    # API reference
│   └── ...
│
├── .github/
│   └── workflows/               # CI/CD pipelines
│       ├── ci-cd.yml
│       └── codeql.yml
│
├── docker-compose.yml           # Docker configuration
├── PRD.md                       # Product requirements
└── README.md                    # Project overview
```

---

## Development Environment

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | Backend runtime |
| Node.js | 20+ | Frontend runtime |
| MongoDB | 7.0+ | Database |
| Git | 2.40+ | Version control |
| Docker | 24+ | Containerization |

### Environment Setup

#### 1. Clone and Setup

```bash
git clone https://github.com/your-org/shopsense-ai.git
cd shopsense-ai
```

#### 2. Backend Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:
```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=<generate-secure-random-string>
JWT_SECRET_KEY=<generate-secure-random-string>
MONGO_URI=mongodb://localhost:27017/shopsense_analytics
GEMINI_API_KEY=<your-gemini-api-key>
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### 3. Frontend Environment

```bash
cd frontend
npm install
```

(Optional) Create `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

#### 4. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name shopsense-mongo mongo:7.0

# Or install locally and run
mongod --dbpath /data/db
```

#### 5. Start Services

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Backend Development

### Creating a New Route

1. **Create route file in `routes/`:**

```python
# routes/reports.py
from flask import Blueprint, request, jsonify, g
from .auth import jwt_required

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@reports_bp.route('', methods=['GET'])
@jwt_required
def list_reports():
    """List all reports for current user."""
    # Implementation
    return jsonify({'success': True, 'data': []})
```

2. **Register blueprint in `app.py`:**

```python
from routes.reports import reports_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(reports_bp)  # Add new blueprint
```

### Creating a New Model

```python
# models/report.py
from datetime import datetime
from bson.objectid import ObjectId

class Report:
    COLLECTION_NAME = 'reports'
    
    def __init__(self, db):
        self.db = db
        self.collection = db[self.COLLECTION_NAME]
        self.collection.create_index('user_id')
        self.collection.create_index('created_at')
    
    def create(self, user_id: str, name: str, data: dict):
        report = {
            'user_id': ObjectId(user_id),
            'name': name,
            'data': data,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = self.collection.insert_one(report)
        report['_id'] = result.inserted_id
        return report
```

### Creating a New Service

```python
# services/report_service.py
class ReportService:
    def __init__(self, db):
        from models.report import Report
        self.report_model = Report(db)
    
    def generate_report(self, user_id: str, report_type: str):
        # Business logic
        data = self._gather_data(report_type)
        return self.report_model.create(user_id, report_type, data)
```

---

## Frontend Development

### Creating a New Component

```tsx
// components/ReportCard.tsx
import React from 'react';

interface ReportCardProps {
  title: string;
  value: number;
  trend?: 'up' | 'down';
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  value,
  trend
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend && (
        <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? '↑' : '↓'} Trend
        </span>
      )}
    </div>
  );
};
```

### API Client Usage

```typescript
// lib/api.ts
import { api } from './api';

// Get dashboard data
const dashboard = await api.getDashboard();

// Upload file
const formData = new FormData();
formData.append('file', file);
const upload = await api.upload(formData);

// Get AI insights
const insights = await api.getAIInsights(uploadId);
```

---

## Database Schema

### Collections

```javascript
// users
{
  _id: ObjectId,
  username: string (unique),
  email: string (unique),
  password_hash: string,
  role: 'user' | 'admin' | 'viewer',
  company_name: string,
  created_at: datetime,
  updated_at: datetime,
  last_login: datetime,
  is_active: boolean,
  is_verified: boolean,
  preferences: {
    theme: 'light' | 'dark',
    timezone: string,
    currency: string
  }
}

// upload_sessions
{
  _id: ObjectId,
  upload_id: string (unique),
  user_id: ObjectId,
  filename: string,
  file_type: 'csv' | 'excel' | 'api',
  status: 'pending' | 'processing' | 'completed' | 'failed',
  row_count: number,
  created_at: datetime,
  completed_at: datetime,
  error_message: string,
  results: object
}

// sales_data
{
  _id: ObjectId,
  user_id: ObjectId,
  upload_id: string,
  product_name: string,
  date: date,
  units_sold: number,
  price: number,
  revenue: number,
  category: string,
  created_at: datetime
}
```

---

## Testing Guide

### Backend Testing

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test
pytest tests/test_auth.py::TestAuthLogin::test_login_success -v

# Run tests matching pattern
pytest -k "test_upload" -v
```

### Writing Tests

```python
# tests/test_reports.py
import pytest

class TestReports:
    def test_list_reports(self, client, auth_token):
        response = client.get(
            '/api/reports',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
```

### Frontend Testing

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

---

## Deployment Guide

### Local Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment (Render)

1. **Connect GitHub to Render**
2. **Use `render.yaml` configuration**
3. **Set environment variables:**
   - `MONGO_URI`
   - `SECRET_KEY`
   - `JWT_SECRET_KEY`
   - `GEMINI_API_KEY`

### Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| FLASK_ENV | development | production |
| FLASK_DEBUG | True | False |
| SECRET_KEY | Local random | Secure random |
| MONGO_URI | localhost | Atlas cluster |
| CORS_ORIGINS | localhost | Your domain |

---

## Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check connection string
echo $MONGO_URI
```

**Port Already in Use:**
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

**Module Not Found:**
```bash
# Reinstall dependencies
cd backend
pip install -r requirements.txt --force-reinstall
```

---

## Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Pytest Documentation](https://docs.pytest.org/)
