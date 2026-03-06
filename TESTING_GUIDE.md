# 🧪 Shopper Behavior Analytics - Testing Guide

**Version:** 1.0.0  
**Date:** February 27, 2026  
**Status:** Ready for Testing

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start Testing](#quick-start-testing)
3. [Backend Testing](#backend-testing)
4. [Frontend Testing](#frontend-testing)
5. [API Testing with cURL](#api-testing-with-curl)
6. [Manual Testing Checklist](#manual-testing-checklist)
7. [Performance Testing](#performance-testing)
8. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Required Software

```bash
# Python 3.11+
python --version  # Should be 3.11 or higher

# Node.js 20+
node --version  # Should be v20 or higher

# MongoDB (local or Atlas)
# If local:
mongod --version

# If using MongoDB Atlas, ensure connection string is in .env
```

### Install Dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Environment Setup

```bash
# Backend .env file
cd backend
cp .env.example .env

# Edit .env with your credentials:
# - MONGO_URI=mongodb://localhost:27017/shopsense_analytics
# - SECRET_KEY=your-secret-key-min-32-chars
# - JWT_SECRET_KEY=another-secret-key-min-32-chars
# - GEMINI_API_KEY=your-gemini-api-key (optional)
```

---

## 2. Quick Start Testing

### Step 1: Start MongoDB

```bash
# If using local MongoDB
mongod

# Or start with Docker
docker-compose up -d mongodb
```

### Step 2: Start Backend

```bash
cd backend
python app.py

# Should see:
# MongoDB connected
# ShopSense AI initialized (development mode)
# Starting ShopSense AI in development mode on 0.0.0.0:5000
```

### Step 3: Start Frontend

```bash
cd frontend
npm run dev

# Should see:
# VITE v6.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

### Step 4: Upload Test Data

1. Open browser: `http://localhost:5173`
2. Register/Login
3. Navigate to Upload
4. Upload `shopping_trends.csv`
5. Wait for "Processing Complete"

### Step 5: View Analytics

Navigate to each section:
- Dashboard → Overview
- Segments → Customer Segmentation
- Affinity → Product Network
- Personas → Customer Profiles
- Sentiment → Review Analysis
- Insights → Recommendations

---

## 3. Backend Testing

### Run Unit Tests

```bash
cd backend

# Run all behavior analytics tests
pytest tests/test_behavior_analytics.py -v

# Run with coverage
pytest tests/test_behavior_analytics.py -v --cov=services --cov=routes --cov=utils

# Run specific test class
pytest tests/test_behavior_analytics.py::TestSegmentationService -v

# Run specific test
pytest tests/test_behavior_analytics.py::TestSegmentationService::test_compute_rfm_scores -v
```

### Expected Test Output

```
============================= test session starts ==============================
platform win32 -- Python 3.11.x, pytest-8.3.4, pluggy-1.5.0
rootdir: e:\antigravity_project\Shop\backend
plugins: cov-6.0.0, flask-1.3.0
collected 20 items

tests/test_behavior_analytics.py::TestDataMapper::test_transform_shopping_trends PASSED [  5%]
tests/test_behavior_analytics.py::TestDataMapper::test_validate_source_data_valid PASSED [ 10%]
tests/test_behavior_analytics.py::TestDataMapper::test_validate_source_data_missing_columns PASSED [ 15%]
tests/test_behavior_analytics.py::TestDataMapper::test_clean_data_removes_invalid PASSED [ 20%]
tests/test_behavior_analytics.py::TestSegmentationService::test_compute_rfm_scores PASSED [ 25%]
tests/test_behavior_analytics.py::TestSegmentationService::test_segment_customers PASSED [ 30%]
tests/test_behavior_analytics.py::TestSegmentationService::test_get_segment_summary PASSED [ 35%]
tests/test_behavior_analytics.py::TestSegmentationService::test_get_segment_visualization_data PASSED [ 40%]
tests/test_behavior_analytics.py::TestAffinityService::test_create_basket_matrix PASSED [ 45%]
tests/test_behavior_analytics.py::TestAffinityService::test_find_frequent_itemsets PASSED [ 50%]
tests/test_behavior_analytics.py::TestAffinityService::test_build_affinity_network PASSED [ 55%]
tests/test_behavior_analytics.py::TestSentimentService::test_calculate_sentiment_scores PASSED [ 60%]
tests/test_behavior_analytics.py::TestSentimentService::test_get_overview PASSED [ 65%]
tests/test_behavior_analytics.py::TestSentimentService::test_get_by_category PASSED [ 70%]
tests/test_behavior_analytics.py::TestSentimentService::test_extract_keywords PASSED [ 75%]
tests/test_behavior_analytics.py::TestPersonaService::test_generate_personas PASSED [ 80%]
tests/test_behavior_analytics.py::TestRecommendationService::test_generate_recommendations PASSED [ 85%]
tests/test_behavior_analytics.py::TestRecommendationService::test_get_recommendation_summary PASSED [ 90%]
tests/test_behavior_analytics.py::TestIntegration::test_full_pipeline PASSED [ 95%]
tests/test_behavior_analytics.py::TestIntegration::test_full_pipeline PASSED [100%]

======================== 20 passed in 5.23s =============================
```

---

## 4. Frontend Testing

### Run Frontend Tests

```bash
cd frontend

# Run tests (if configured)
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests (if configured)
npm run test:e2e
```

### Manual Frontend Testing

1. **Test Loading States**
   - Navigate to each section
   - Should see loading spinner
   - Should transition to data view

2. **Test Error States**
   - Stop backend server
   - Refresh page
   - Should see error message

3. **Test Empty States**
   - Upload empty CSV
   - Should see "No Data Yet" message

4. **Test Data Display**
   - Upload valid data
   - Verify all metrics display correctly
   - Check charts render properly

---

## 5. API Testing with cURL

### Register and Login

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"Test123!\"}"

# Login
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"identifier\":\"test@example.com\",\"password\":\"Test123!\"}"

# Save the access_token from response
```

### Test Behavior Analytics Endpoints

```bash
# Set token (Windows)
set TOKEN=your_access_token_here

# Get Customer Segments
curl -X GET "http://localhost:5000/api/behavior/segments?upload_id=your_upload_id" ^
  -H "Authorization: Bearer %TOKEN%"

# Get Affinity Network
curl -X GET "http://localhost:5000/api/behavior/affinity/network?upload_id=your_upload_id" ^
  -H "Authorization: Bearer %TOKEN%"

# Get Sentiment Overview
curl -X GET "http://localhost:5000/api/behavior/sentiment/overview?upload_id=your_upload_id" ^
  -H "Authorization: Bearer %TOKEN%"

# Get Personas
curl -X GET "http://localhost:5000/api/behavior/personas?upload_id=your_upload_id" ^
  -H "Authorization: Bearer %TOKEN%"

# Get Recommendations
curl -X GET "http://localhost:5000/api/behavior/recommendations?upload_id=your_upload_id" ^
  -H "Authorization: Bearer %TOKEN%"

# Get Complete Insights Summary
curl -X GET "http://localhost:5000/api/behavior/insights/summary?upload_id=your_upload_id" ^
  -H "Authorization: Bearer %TOKEN%"
```

### Expected API Responses

**Segments Response:**
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
          "avg_monetary": 512.75
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

**Affinity Network Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "blouse",
        "label": "Blouse",
        "value": 150,
        "color": "#00F0FF"
      }
    ],
    "links": [
      {
        "source": "blouse",
        "target": "handbag",
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

## 6. Manual Testing Checklist

### Data Upload ✅

- [ ] Can upload CSV file
- [ ] File validation works
- [ ] Processing indicator shows
- [ ] Success message displays
- [ ] Data appears in history

### Customer Segments ✅

- [ ] Segments display correctly
- [ ] 4-6 segments generated
- [ ] Customer count shown
- [ ] Revenue metrics visible
- [ ] RFM scores display
- [ ] Charts render (pie, bar)
- [ ] Loading state works
- [ ] Error state works

### Product Affinity ✅

- [ ] Network graph displays
- [ ] Nodes are interactive (zoom/pan)
- [ ] Connections visible
- [ ] Top rules display below
- [ ] Lift/Confidence/Support shown
- [ ] Loading state works
- [ ] Error state works

### Sentiment Analysis ✅

- [ ] Gauge displays score
- [ ] Distribution bars animate
- [ ] Category breakdown visible
- [ ] Stats cards show data
- [ ] Loading state works
- [ ] Error state works

### Personas ✅

- [ ] 4-6 personas display
- [ ] Names generated (e.g., "Premium Patricia")
- [ ] Descriptions shown
- [ ] Demographics visible
- [ ] Behavior metrics display
- [ ] Hover effects work
- [ ] Loading state works
- [ ] Error state works

### Recommendations ✅

- [ ] Recommendations listed
- [ ] Priority badges show
- [ ] Categories displayed
- [ ] Implementation steps visible
- [ ] Expected impact shown
- [ ] Loading state works
- [ ] Error state works

---

## 7. Performance Testing

### Load Testing with Apache Bench

```bash
# Test segments endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/behavior/segments?upload_id=test"

# Expected:
# Requests per second: Should be > 50 req/sec
# Time per request: Should be < 500ms
```

### Response Time Targets

| Endpoint | Target (P50) | Target (P95) |
|----------|--------------|--------------|
| GET /behavior/segments | < 200ms | < 500ms |
| GET /behavior/affinity/network | < 300ms | < 800ms |
| GET /behavior/sentiment/overview | < 150ms | < 400ms |
| GET /behavior/personas | < 250ms | < 600ms |
| GET /behavior/recommendations | < 300ms | < 800ms |

### Memory Usage

```bash
# Monitor backend memory
# Should stay under 500MB for normal operation

# Monitor frontend memory
# Chrome DevTools → Memory tab
# Should stay under 100MB
```

---

## 8. Troubleshooting

### Issue: MongoDB Connection Failed

**Symptoms:**
```
MongoDB connection failed
```

**Solutions:**
1. Check MongoDB is running: `mongod`
2. Verify connection string in `.env`
3. Check MongoDB port: `netstat -an | find "27017"`
4. Restart MongoDB service

---

### Issue: Backend Won't Start

**Symptoms:**
```
ModuleNotFoundError: No module named 'xxx'
```

**Solutions:**
1. Reinstall dependencies:
   ```bash
   pip install -r requirements.txt --force-reinstall
   ```
2. Check Python version: `python --version` (should be 3.11+)
3. Activate virtual environment

---

### Issue: Frontend Won't Start

**Symptoms:**
```
npm ERR! missing script: dev
```

**Solutions:**
1. Check Node version: `node --version` (should be v20+)
2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### Issue: API Returns 401 Unauthorized

**Symptoms:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token expired or invalid"
  }
}
```

**Solutions:**
1. Login again to get new token
2. Check token in localStorage
3. Verify Authorization header format: `Bearer <token>`

---

### Issue: Charts Not Rendering

**Symptoms:**
- Blank chart areas
- Console errors about Plotly

**Solutions:**
1. Install Plotly: `npm install plotly.js react-plotly.js`
2. Check data format matches Plotly expectations
3. Verify container has height/width

---

### Issue: No Affinity Rules Generated

**Symptoms:**
- Empty network graph
- "No affinity data" message

**Solutions:**
1. Ensure enough transactions (minimum 100)
2. Lower min_support threshold in API call
3. Check products are purchased together

---

## 9. Test Data

### Sample Test Cases

**Test Case 1: Small Dataset (100 rows)**
```
Expected:
- Segments: 4 generated
- Affinity: 5-10 rules
- Sentiment: Score 60-80
- Personas: 4 generated
- Processing time: < 2 seconds
```

**Test Case 2: Full Dataset (3,900 rows)**
```
Expected:
- Segments: 4-6 generated
- Affinity: 20-50 rules
- Sentiment: Score 70-85
- Personas: 4-6 generated
- Processing time: < 5 seconds
```

**Test Case 3: Invalid Data**
```
Upload CSV with:
- Missing columns
- Invalid ratings (>5)
- Negative prices

Expected:
- Validation error message
- Clear indication of what's wrong
```

---

## 10. Sign-Off Checklist

### Backend ✅

- [ ] All 20 tests pass
- [ ] No console errors
- [ ] MongoDB connected
- [ ] All 11 API endpoints respond
- [ ] Response times within targets
- [ ] Memory usage stable

### Frontend ✅

- [ ] All 5 components load
- [ ] No console errors
- [ ] Charts render correctly
- [ ] Loading states work
- [ ] Error states work
- [ ] Empty states work
- [ ] Responsive on mobile

### Data ✅

- [ ] shopping_trends.csv uploads successfully
- [ ] Data transforms correctly
- [ ] All analytics compute
- [ ] Results match expectations

### Documentation ✅

- [ ] README updated
- [ ] API docs accurate
- [ ] User guide complete
- [ ] Troubleshooting guide helpful

---

## 11. Next Steps After Testing

### If All Tests Pass ✅

1. Deploy to staging environment
2. User acceptance testing
3. Performance optimization
4. Production deployment

### If Tests Fail ❌

1. Document failures
2. Fix issues
3. Re-run tests
4. Repeat until all pass

---

## 📞 Support

### Test Results Template

When reporting issues, include:

```
Test: [Test name]
Environment: [Local/Staging/Production]
Steps to Reproduce:
1. ...
2. ...

Expected: [What should happen]
Actual: [What actually happened]
Screenshots: [If applicable]
Logs: [Relevant log excerpts]
```

### Contact

- **Email:** tanishqjoshi200507@gmail.com
- **Documentation:** See `docs/` folder
- **Issues:** Check troubleshooting section

---

*Generated: February 27, 2026*  
*ShopSense AI QA Team*
