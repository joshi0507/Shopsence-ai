# ShopSense AI - API Documentation

## Overview

ShopSense AI provides a RESTful API for business analytics, sales forecasting, and AI-powered insights.

**Base URL:** `http://localhost:8000/api`  
**Version:** 2.0.0  
**Authentication:** JWT Bearer Token

---

## Table of Contents

1. [Authentication](#authentication)
2. [Uploads](#uploads)
3. [Analytics](#analytics)
4. [Dashboard](#dashboard)
5. [Error Handling](#error-handling)

---

## Authentication

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "company_name": "Acme Corp"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "company_name": "Acme Corp"
    }
  }
}
```

---

### Login

**POST** `/auth/login`

Authenticate and receive tokens.

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

---

### Get Current User

**GET** `/auth/me`

Get authenticated user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "company_name": "Acme Corp",
    "preferences": {
      "theme": "dark",
      "timezone": "UTC",
      "currency": "USD"
    }
  }
}
```

---

### Refresh Token

**POST** `/auth/refresh`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Uploads

### Upload CSV File

**POST** `/uploads`

Upload and process a CSV file.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: CSV file (required)

**CSV Format:**
```csv
product_name,date,units_sold,price
Product A,2024-01-01,100,19.99
Product B,2024-01-01,50,29.99
```

**Response (201):**
```json
{
  "success": true,
  "message": "File uploaded and processed successfully",
  "data": {
    "upload_id": "abc123-def456",
    "filename": "sales.csv",
    "rows_processed": 1000,
    "products_count": 50,
    "analysis": {...},
    "recommendations": [...]
  }
}
```

---

### List Uploads

**GET** `/uploads`

Get user's upload history.

**Query Parameters:**
- `limit` (optional): Max results (default: 50, max: 100)
- `status` (optional): Filter by status (pending, processing, completed, failed)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "upload_id": "abc123-def456",
      "filename": "sales.csv",
      "file_type": "csv",
      "status": "completed",
      "row_count": 1000,
      "created_at": "2024-01-15T10:30:00Z",
      "results": {...}
    }
  ]
}
```

---

### Get Upload Details

**GET** `/uploads/:upload_id`

Get specific upload session details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "upload_id": "abc123-def456",
    "filename": "sales.csv",
    "status": "completed",
    "row_count": 1000,
    "results": {
      "rows_processed": 1000,
      "products": 50,
      "date_range": {...}
    }
  }
}
```

---

### Delete Upload

**DELETE** `/uploads/:upload_id`

Delete an upload and associated data.

**Response (200):**
```json
{
  "success": true,
  "message": "Upload deleted successfully"
}
```

---

## Analytics

### Get Summary

**GET** `/analytics/summary`

Get comprehensive analytics summary.

**Query Parameters:**
- `upload_id` (optional): Filter by specific upload
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "product_analysis": {
      "summary": {
        "total_products": 50,
        "total_revenue": 125000.00,
        "total_units": 15000,
        "avg_price": 25.50
      },
      "top_performers": {...},
      "bottom_performers": {...}
    },
    "trend_analysis": {
      "trend_direction": "increasing",
      "avg_daily_growth": 2.5,
      "avg_daily_revenue": 4500.00
    },
    "recommendations": [
      {
        "priority": "high",
        "category": "inventory",
        "recommendation": "Ensure adequate stock of Product A..."
      }
    ]
  }
}
```

---

### Get Product Performance

**GET** `/analytics/products`

Get product performance data.

**Query Parameters:**
- `upload_id` (optional): Filter by upload
- `limit` (optional): Max results (default: 100)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "product_name": "Product A",
        "units_sold": 5000,
        "price": 19.99,
        "revenue": 99950.00
      }
    ],
    "total_products": 50
  }
}
```

---

### Get Trends

**GET** `/analytics/trends`

Get time series sales data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "date": "2024-01-01",
        "units_sold": 500,
        "revenue": 12500.00
      }
    ],
    "data_points": 90
  }
}
```

---

### Get Forecast

**GET** `/analytics/forecast`

Get sales forecast using Facebook Prophet.

**Query Parameters:**
- `upload_id` (optional): Filter by upload
- `periods` (optional): Days to forecast (default: 30, max: 90)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "forecast_period_days": 30,
    "total_predicted_revenue": 150000.00,
    "avg_daily_revenue": 5000.00,
    "predictions": [
      {
        "date": "2024-04-01",
        "predicted_revenue": 5200.00,
        "lower_bound": 4500.00,
        "upper_bound": 5900.00,
        "trend": 5100.00,
        "weekly_effect": 100.00
      }
    ],
    "model_info": {
      "algorithm": "Facebook Prophet",
      "trained_on": "2024-01-01",
      "trained_to": "2024-03-31"
    }
  }
}
```

---

### Get AI Insights

**POST** `/analytics/insights`

Get AI-powered business insights using Google Gemini.

**Request Body:**
```json
{
  "upload_id": "abc123-def456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "performance_analysis": {
      "title": "Performance Analysis",
      "content": "Your top performer is Product A..."
    },
    "market_insights": {...},
    "strategic_recommendations": {
      "immediate_actions": [...],
      "short_term_strategies": [...],
      "long_term_initiatives": [...]
    },
    "financial_insights": {...},
    "operational_efficiency": {...},
    "executive_summary": {
      "title": "Executive Summary",
      "content": "Key takeaways..."
    }
  }
}
```

---

## Dashboard

### Get Complete Dashboard

**GET** `/dashboard`

Get all dashboard data in a single request.

**Query Parameters:**
- `upload_id` (optional): Filter by upload

**Response (200):**
```json
{
  "success": true,
  "data": {
    "has_data": true,
    "kpis": {
      "total_revenue": 125000.00,
      "total_units": 15000,
      "total_products": 50,
      "avg_order_value": 8.33,
      "avg_price": 25.50
    },
    "charts": {
      "top_products": [...],
      "low_products": [...],
      "price_volume": [...],
      "time_series": [...],
      "forecast": [...]
    },
    "analysis": {
      "product_analysis": {...},
      "trend_analysis": {...},
      "recommendations": [...]
    },
    "uploads": [...]
  }
}
```

---

### Get KPIs

**GET** `/dashboard/kpis`

Get KPI cards data only.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_revenue": 125000.00,
    "total_units": 15000,
    "total_products": 50,
    "avg_order_value": 8.33,
    "avg_price": 25.50
  }
}
```

---

### Get Charts

**GET** `/dashboard/charts`

Get chart data only.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "top_products": [...],
    "low_products": [...],
    "time_series": [...]
  }
}
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `TOKEN_MISSING` | 401 | No authentication token |
| `TOKEN_INVALID` | 401 | Invalid or expired token |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Default | 100 requests/minute |
| Auth endpoints | 5 requests/minute |
| Upload endpoints | 10 requests/hour |

---

## Pagination

List endpoints support pagination:

```
GET /api/uploads?limit=50&page=1
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "total_pages": 3
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
const API_BASE = 'http://localhost:8000/api';

class ShopSenseAPI {
  private token: string | null = null;

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password })
    });
    const data = await res.json();
    this.token = data.data.access_token;
    return data;
  }

  async getDashboard() {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return res.json();
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/uploads`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token}` },
      body: formData
    });
    return res.json();
  }
}
```

### Python

```python
import requests

class ShopSenseAPI:
    def __init__(self, base_url='http://localhost:8000/api'):
        self.base_url = base_url
        self.token = None
        self.session = requests.Session()
    
    def login(self, email, password):
        res = self.session.post(f'{self.base_url}/auth/login', json={
            'identifier': email,
            'password': password
        })
        data = res.json()
        self.token = data['data']['access_token']
        self.session.headers.update({
            'Authorization': f'Bearer {self.token}'
        })
        return data
    
    def get_dashboard(self):
        res = self.session.get(f'{self.base_url}/dashboard')
        return res.json()
    
    def upload_file(self, filepath):
        with open(filepath, 'rb') as f:
            res = self.session.post(
                f'{self.base_url}/uploads',
                files={'file': f}
            )
        return res.json()
```

---

## Changelog

### v2.0.0 (February 2026)
- JWT authentication
- Modular architecture
- Rate limiting
- Enhanced security

### v1.0.0 (January 2026)
- Initial release
- Basic analytics
- CSV upload
- MongoDB integration
