# 📡 Behavior Analytics API Reference

**Version:** 1.0.0  
**Last Updated:** February 27, 2026  
**Base URL:** `http://localhost:8000/api`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Customer Segmentation](#customer-segmentation)
4. [Product Affinity](#product-affinity)
5. [Sentiment Analysis](#sentiment-analysis)
6. [Personas](#personas)
7. [Recommendations](#recommendations)
8. [Error Codes](#error-codes)
9. [Code Examples](#code-examples)

---

## 1. Overview

### 1.1 Base URL

```
Production: https://api.shopsense.ai/api
Staging: https://staging-api.shopsense.ai/api
Development: http://localhost:8000/api
```

### 1.2 Common Headers

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### 1.3 Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-02-27T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [ ... ]  // Optional
  }
}
```

### 1.4 Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| GET /behavior/* | 100 requests/minute |
| POST /behavior/*/compute | 10 requests/minute |

---

## 2. Authentication

All behavior analytics endpoints require JWT authentication.

### 2.1 Obtaining a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 900
  }
}
```

### 2.2 Using the Token

Include the token in the `Authorization` header:

```http
GET /api/behavior/segments
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 3. Customer Segmentation

### 3.1 Get Customer Segments

Retrieves customer segments with RFM analysis.

```http
GET /api/behavior/segments
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `upload_id` | string | No | Filter by specific upload session |

**Response:**
```json
{
  "success": true,
  "data": {
    "segments": [
      {
        "segment_id": 0,
        "segment_name": "Champions",
        "customer_count": 245,
        "total_revenue": 125430.50,
        "avg_order_value": 85.25,
        "characteristics": {
          "avg_recency": 12.5,
          "avg_frequency": 8.3,
          "avg_monetary": 512.75,
          "avg_rfm_score": 543
        }
      },
      {
        "segment_id": 1,
        "segment_name": "Loyal Customers",
        "customer_count": 520,
        "total_revenue": 98250.00,
        "avg_order_value": 52.30,
        "characteristics": {
          "avg_recency": 25.2,
          "avg_frequency": 6.1,
          "avg_monetary": 189.35,
          "avg_rfm_score": 432
        }
      }
    ],
    "segment_mapping": {
      "0": "Champions",
      "1": "Loyal Customers",
      "2": "Value Seekers",
      "3": "At Risk"
    }
  }
}
```

**Error Responses:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NO_DATA` | 400 | No transaction data available |
| `INTERNAL_ERROR` | 500 | Server error |

---

### 3.2 Compute Segments (Async)

Triggers asynchronous segment computation.

```http
POST /api/behavior/segments/compute
Content-Type: application/json

{
  "upload_id": "upload_abc123",
  "n_clusters": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "job_xyz789",
    "status": "processing",
    "estimated_time": 30
  }
}
```

---

### 3.3 Get Segment Customers

Retrieves customers in a specific segment.

```http
GET /api/behavior/segments/:segment_id/customers
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `segment_id` | int | Segment identifier |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 50 | Results per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "customer_id": "C001",
        "email": "customer@example.com",
        "rfm_scores": {
          "recency": 5,
          "frequency": 5,
          "monetary": 4
        },
        "total_purchases": 15,
        "total_spend": 1250.50
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 245,
      "total_pages": 5
    }
  }
}
```

---

## 4. Product Affinity

### 4.1 Get Affinity Network

Retrieves product affinity network for visualization.

```http
GET /api/behavior/affinity/network
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `upload_id` | string | No | Filter by upload |
| `top_n` | int | No | Number of top rules (default: 50) |

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "wireless_headphones",
        "label": "Wireless Headphones",
        "category": "Electronics",
        "value": 342,
        "color": "#00F0FF"
      },
      {
        "id": "phone_case",
        "label": "Phone Case",
        "category": "Accessories",
        "value": 521,
        "color": "#7000FF"
      }
    ],
    "links": [
      {
        "source": "wireless_headphones",
        "target": "phone_case",
        "strength": 0.85,
        "support": 0.12,
        "confidence": 0.45,
        "lift": 3.2
      }
    ]
  }
}
```

---

### 4.2 Get Affinity Rules

Retrieves association rules.

```http
GET /api/behavior/affinity/rules
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `upload_id` | string | - | Filter by upload |
| `product_id` | string | - | Filter by product |
| `min_lift` | float | 1.5 | Minimum lift threshold |
| `min_confidence` | float | 0.3 | Minimum confidence |

**Response:**
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "antecedent": "Wireless Headphones",
        "consequent": "Phone Case",
        "support": 0.12,
        "confidence": 0.45,
        "lift": 3.2,
        "transactions": 156
      },
      {
        "antecedent": "Laptop",
        "consequent": "Laptop Bag",
        "support": 0.08,
        "confidence": 0.62,
        "lift": 4.1,
        "transactions": 98
      }
    ],
    "metadata": {
      "total_rules": 2,
      "min_support_used": 0.05,
      "min_confidence_used": 0.3
    }
  }
}
```

---

### 4.3 Get Bundle Suggestions

Retrieves suggested product bundles.

```http
GET /api/behavior/affinity/bundles
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggested_bundles": [
      {
        "bundle_name": "Wireless Headphones + Phone Case",
        "products": ["Wireless Headphones", "Phone Case"],
        "affinity_score": 3.2,
        "confidence": 0.45,
        "estimated_lift": "220%"
      },
      {
        "bundle_name": "Laptop + Laptop Bag",
        "products": ["Laptop", "Laptop Bag"],
        "affinity_score": 4.1,
        "confidence": 0.62,
        "estimated_lift": "310%"
      }
    ]
  }
}
```

---

## 5. Sentiment Analysis

### 5.1 Get Sentiment Overview

Retrieves overall sentiment metrics.

```http
GET /api/behavior/sentiment/overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_score": 78.5,
    "average_rating": 4.2,
    "total_reviews": 3900,
    "distribution": {
      "positive": 2850,
      "neutral": 780,
      "negative": 270
    },
    "percentages": {
      "positive": 73.1,
      "neutral": 20.0,
      "negative": 6.9
    }
  }
}
```

---

### 5.2 Get Sentiment by Category

Retrieves sentiment breakdown by product category.

```http
GET /api/behavior/sentiment/by-category
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": "Clothing",
        "sentiment_score": 82.3,
        "average_rating": 4.3,
        "review_count": 1250,
        "trend": "improving"
      },
      {
        "category": "Footwear",
        "sentiment_score": 75.1,
        "average_rating": 4.1,
        "review_count": 980,
        "trend": "stable"
      },
      {
        "category": "Accessories",
        "sentiment_score": 68.5,
        "average_rating": 3.8,
        "review_count": 650,
        "trend": "declining"
      }
    ]
  }
}
```

---

### 5.3 Get Sentiment by Product

Retrieves sentiment for individual products.

```http
GET /api/behavior/sentiment/by-product
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `top_n` | int | 20 | Number of products |

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "product_name": "Wireless Headphones",
        "sentiment_score": 88.5,
        "average_rating": 4.6,
        "review_count": 342,
        "purchase_count": 450
      },
      {
        "product_name": "Running Shoes",
        "sentiment_score": 82.0,
        "average_rating": 4.4,
        "review_count": 285,
        "purchase_count": 320
      }
    ]
  }
}
```

---

### 5.4 Get Sentiment Keywords

Retrieves top positive and negative keywords.

```http
GET /api/behavior/sentiment/keywords
```

**Response:**
```json
{
  "success": true,
  "data": {
    "positive_keywords": [
      { "word": "quality", "count": 450, "sentiment": 0.85 },
      { "word": "comfortable", "count": 380, "sentiment": 0.92 },
      { "word": "fast shipping", "count": 320, "sentiment": 0.88 }
    ],
    "negative_keywords": [
      { "word": "expensive", "count": 125, "sentiment": -0.65 },
      { "word": "sizing issues", "count": 98, "sentiment": -0.72 }
    ]
  }
}
```

---

## 6. Personas

### 6.1 Get Customer Personas

Retrieves data-driven customer personas.

```http
GET /api/behavior/personas
```

**Response:**
```json
{
  "success": true,
  "data": {
    "personas": [
      {
        "persona_id": 0,
        "name": "Premium Patricia",
        "role": "Champions",
        "description": "Your best customers, typically aged 35. They spend an average of $125.50 per order and purchase frequently.",
        "avatar_initials": "PP",
        "color": "#00F0FF",
        "demographics": {
          "age_range": "30-40",
          "gender_split": {
            "Female": 0.65,
            "Male": 0.35
          },
          "top_locations": {
            "New York": 45,
            "Los Angeles": 32,
            "Chicago": 28
          }
        },
        "behavior": {
          "avg_order_value": 125.50,
          "purchase_frequency": "Weekly",
          "total_customers": 245,
          "total_revenue": 125430.50
        },
        "preferences": {
          "preferred_payment": "Credit Card",
          "preferred_shipping": "Express",
          "discount_sensitivity": 0.25
        },
        "segment_id": 0
      }
    ]
  }
}
```

---

### 6.2 Get Persona Detail

Retrieves detailed information about a specific persona.

```http
GET /api/behavior/personas/:persona_id/detail
```

**Response:**
```json
{
  "success": true,
  "data": {
    "persona": { ... },
    "sample_customers": [
      {
        "customer_id": "C001",
        "age": 35,
        "gender": "Female",
        "location": "New York",
        "total_spend": 1250.50
      }
    ],
    "marketing_recommendations": [
      "Target with premium product launches",
      "Offer exclusive early access",
      "Invite to VIP loyalty program"
    ]
  }
}
```

---

## 7. Recommendations

### 7.1 Get Behavioral Recommendations

Retrieves actionable recommendations.

```http
GET /api/behavior/recommendations
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `upload_id` | string | Filter by upload |
| `category` | string | Filter: Merchandising/Marketing/Product |
| `priority` | string | Filter: High/Medium/Low |

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "MERCH-001",
        "category": "Merchandising",
        "title": "Create Product Bundle: Wireless Headphones + Phone Case",
        "description": "These products have a strong affinity (lift: 3.2x). Bundling them could increase average order value by 220%.",
        "expected_impact": "10-30% increase in AOV",
        "priority": "High",
        "timeline": "Immediate",
        "implementation_steps": [
          "Create bundle listing",
          "Set bundle price (5-10% discount)",
          "Feature on homepage",
          "Monitor conversion rate"
        ],
        "data_support": {
          "affinity_score": 3.2,
          "confidence": 0.45,
          "transactions": 156
        }
      },
      {
        "id": "MKT-001",
        "category": "Marketing",
        "title": "Launch VIP Loyalty Program for Champions",
        "description": "Your Champions segment (245 customers, $125,430.50 revenue) represents your most valuable customers.",
        "expected_impact": "15-25% increase in retention",
        "priority": "High",
        "timeline": "30 days",
        "implementation_steps": [
          "Define VIP tiers and benefits",
          "Create exclusive offers",
          "Send personalized invitations",
          "Track engagement"
        ],
        "data_support": {
          "segment_size": 245,
          "segment_revenue": 125430.50
        }
      }
    ],
    "summary": {
      "total": 5,
      "high_priority": 2,
      "medium_priority": 2,
      "low_priority": 1
    }
  }
}
```

---

## 8. Error Codes

### 8.1 Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NO_DATA` | 400 | No data available for the request |
| `INVALID_UPLOAD` | 400 | Invalid upload ID provided |
| `PROCESSING` | 400 | Data is still being processed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### 8.2 Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "NO_DATA",
    "message": "No transaction data available for this upload",
    "details": [
      {
        "field": "upload_id",
        "message": "Upload may still be processing"
      }
    ]
  },
  "request_id": "req_abc123"
}
```

---

## 9. Code Examples

### 9.1 JavaScript/TypeScript

```typescript
import { behaviorApi } from './lib/api';

// Get customer segments
async function getSegments() {
  const response = await behaviorApi.getSegments('upload_abc123');
  
  if (response.success) {
    console.log('Segments:', response.data.segments);
    
    // Display segment distribution
    response.data.segments.forEach(segment => {
      console.log(`${segment.segment_name}: ${segment.customer_count} customers`);
    });
  } else {
    console.error('Error:', response.error);
  }
}

// Get affinity network
async function getAffinityNetwork() {
  const response = await behaviorApi.getAffinityNetwork('upload_abc123');
  
  if (response.success) {
    const { nodes, links } = response.data;
    console.log(`Network: ${nodes.length} products, ${links.length} connections`);
  }
}

// Get recommendations
async function getRecommendations() {
  const response = await behaviorApi.getRecommendations('upload_abc123');
  
  if (response.success) {
    const highPriority = response.data.recommendations.filter(
      r => r.priority === 'High'
    );
    console.log('High Priority Actions:', highPriority);
  }
}
```

### 9.2 Python

```python
import requests

BASE_URL = 'http://localhost:8000/api'
TOKEN = 'your_jwt_token'

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

# Get customer segments
def get_segments(upload_id):
    response = requests.get(
        f'{BASE_URL}/behavior/segments',
        headers=headers,
        params={'upload_id': upload_id}
    )
    
    if response.status_code == 200:
        data = response.json()
        return data['data']
    else:
        raise Exception(f"Error: {response.json()}")

# Get affinity rules
def get_affinity_rules(upload_id):
    response = requests.get(
        f'{BASE_URL}/behavior/affinity/rules',
        headers=headers,
        params={'upload_id': upload_id}
    )
    
    if response.status_code == 200:
        data = response.json()
        return data['data']['rules']
    else:
        raise Exception(f"Error: {response.json()}")

# Get recommendations
def get_recommendations(upload_id):
    response = requests.get(
        f'{BASE_URL}/behavior/recommendations',
        headers=headers,
        params={'upload_id': upload_id}
    )
    
    if response.status_code == 200:
        data = response.json()
        return data['data']['recommendations']
    else:
        raise Exception(f"Error: {response.json()}")

# Usage
segments = get_segments('upload_abc123')
for segment in segments['segments']:
    print(f"{segment['segment_name']}: {segment['customer_count']} customers")
```

### 9.3 cURL

```bash
# Get customer segments
curl -X GET "http://localhost:8000/api/behavior/segments?upload_id=upload_abc123" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get affinity network
curl -X GET "http://localhost:8000/api/behavior/affinity/network?upload_id=upload_abc123" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get sentiment overview
curl -X GET "http://localhost:8000/api/behavior/sentiment/overview?upload_id=upload_abc123" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get personas
curl -X GET "http://localhost:8000/api/behavior/personas?upload_id=upload_abc123" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get recommendations
curl -X GET "http://localhost:8000/api/behavior/recommendations?upload_id=upload_abc123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 10. Webhooks (Future)

### 10.1 Available Events

| Event | Description |
|-------|-------------|
| `segmentation.completed` | Segment computation finished |
| `affinity.completed` | Affinity analysis finished |
| `recommendations.ready` | New recommendations available |

### 10.2 Webhook Payload

```json
{
  "event": "segmentation.completed",
  "timestamp": "2026-02-27T10:30:00Z",
  "data": {
    "upload_id": "upload_abc123",
    "job_id": "job_xyz789",
    "segments_count": 4
  }
}
```

---

*Document Version: 1.0.0*  
*Last Updated: February 27, 2026*  
*ShopSense AI Development Team*
