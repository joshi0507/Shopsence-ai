# ShopSense AI - Comprehensive Technical Documentation

**Version:** 2.0.0  
**Last Updated:** February 2026  
**Status:** Production Ready

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Purpose & Problem Statement](#2-purpose--problem-statement)
3. [Section 1: Overview (Dashboard)](#3-section-1-overview-dashboard)
4. [Section 2: Data Upload](#4-section-2-data-upload)
5. [Section 3: Analysis](#5-section-3-analysis)
6. [Section 4: History](#6-section-4-history)
7. [Section 5: Customers](#7-section-5-customers)
8. [Section 6: Tips](#8-section-6-tips)
9. [Section 7: Account](#9-section-7-account)
10. [Complete Feature List](#10-complete-feature-list)
11. [Feasibility Analysis](#11-feasibility-analysis)
12. [API Reference Summary](#12-api-reference-summary)

---

## 1. System Architecture

### 1.1 High-Level Architecture

ShopSense AI follows a modern three-tier architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    React Frontend                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │Dashboard │ │  Upload  │ │ Analysis │ │ Customers│   │   │
│  │  │  Home    │ │  Center  │ │  Report  │ │ Segments │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  │                                                         │   │
│  │  • TypeScript + React 18.3                              │   │
│  │  • Vite 6.0 (Build Tool)                                │   │
│  │  • Tailwind CSS 3.4 (Styling)                           │   │
│  │  • Framer Motion (Animations)                           │   │
│  │  • Plotly.js / Recharts (Visualizations)                │   │
│  │  • React Three Fiber (3D Graphics)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / REST API
                              │ WebSocket (Real-time)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Flask Backend                         │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │              API Routes (Blueprints)              │   │   │
│  │  │  ┌────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ │   │   │
│  │  │  │ /auth  │ │uploads │ │analytics│ │dashboard │ │   │   │
│  │  │  │ JWT    │ │ CSV    │ │ Insights│ │  KPIs    │ │   │   │
│  │  │  └────────┘ └────────┘ └─────────┘ └──────────┘ │   │   │
│  │  │  ┌────────┐ ┌─────────┐ ┌──────────┐            │   │   │
│  │  │  │/exports│ │/behavior│ │ /health  │            │   │   │
│  │  │  │ PDF/CSV│ │ RFM,    │ │ Monitor  │            │   │   │
│  │  │  │        │ │Affinity │ │          │            │   │   │
│  │  │  └────────┘ └─────────┘ └──────────┘            │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │              Business Services                    │   │   │
│  │  │  • AuthService (JWT, bcrypt)                      │   │   │
│  │  │  • AnalyticsService (Pandas analysis)             │   │   │
│  │  │  • ForecastService (Facebook Prophet)             │   │   │
│  │  │  • SegmentationService (RFM + K-Means)            │   │   │
│  │  │  • AffinityService (Association Rules)            │   │   │
│  │  │  • SentimentService (NLP Analysis)                │   │   │
│  │  │  • PersonaService (Customer Personas)             │   │   │
│  │  │  • RecommendationService (Actionable Insights)    │   │   │
│  │  │  • GeminiService (Google AI Integration)          │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │              Middleware Layer                     │   │   │
│  │  │  • JWT Authentication (@jwt_required)             │   │   │
│  │  │  • Rate Limiting (Flask-Limiter)                  │   │   │
│  │  │  • CORS (Flask-CORS)                              │   │   │
│  │  │  • Security Headers (Flask-Talisman)              │   │   │
│  │  │  • Error Handling (Custom ErrorHandler)           │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PyMongo
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   MongoDB 7.0                            │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐          │   │
│  │  │   users    │ │sales_data  │ │  uploads   │          │   │
│  │  │  - email   │ │ - user_id  │ │ - upload_id│          │   │
│  │  │  - password│ │ - product  │ │ - status   │          │   │
│  │  │  - role    │ │ - date     │ │ - results  │          │   │
│  │  │  - prefs   │ │ - revenue  │ │            │          │   │
│  │  └────────────┘ └────────────┘ └────────────┘          │   │
│  │  ┌────────────┐ ┌────────────┐                          │   │
│  │  │ blacklisted│ │  (indexes  │                          │   │
│  │  │ _tokens    │ │   on user, │                          │   │
│  │  │ (TTL)      │ │   date,    │                          │   │
│  │  │            │ │   product) │                          │   │
│  │  └────────────┘ └────────────┘                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

#### Backend (Python 3.11+)

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Flask 3.0 | Web application framework |
| **Database** | MongoDB 7.0 + PyMongo | NoSQL data storage |
| **Authentication** | PyJWT 2.8, bcrypt | JWT tokens, password hashing |
| **Analytics** | Pandas, NumPy | Data manipulation and analysis |
| **Forecasting** | Facebook Prophet 1.1 | Time-series prediction |
| **AI/ML** | Google Gemini AI, scikit-learn | Insights generation, clustering |
| **Security** | Flask-Limiter, Flask-Talisman | Rate limiting, security headers |
| **Real-time** | Flask-SocketIO | WebSocket communication |
| **Visualization** | Plotly | Chart generation |

#### Frontend (TypeScript)

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | React 18.3 + TypeScript | UI component library |
| **Build Tool** | Vite 6.0 | Fast development and bundling |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **Animations** | Framer Motion | Smooth transitions |
| **Charts** | Plotly.js, Recharts | Data visualization |
| **3D Graphics** | Three.js, React Three Fiber | 3D visualizations |
| **UI Components** | Radix UI, shadcn/ui | Accessible components |
| **Smooth Scroll** | Lenis | Smooth scrolling experience |

#### Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Containerization** | Docker, Docker Compose | Container orchestration |
| **Hosting** | Render.com / AWS | Cloud deployment |
| **CDN** | Cloudflare | Content delivery |
| **Database** | MongoDB Atlas | Managed MongoDB |
| **Cache** | Redis | Session caching |
| **CI/CD** | GitHub Actions | Automated pipelines |
| **Monitoring** | Sentry, Datadog | Error tracking, metrics |

### 1.3 Data Flow

```
User Action → Frontend Component → API Client (api.ts) → 
Backend Route → Service Layer → MongoDB → 
Service Processing → Route Response → Frontend Update
```

**Example: Data Upload Flow**

1. User drops CSV file on upload area (`DataUpload.tsx`)
2. Frontend calls `api.upload(file)` (`api.ts`)
3. Request hits `/api/v1/uploads` route (`uploads.py`)
4. JWT authentication verified (`@jwt_required`)
5. CSV validated and parsed (Pandas)
6. Data stored in MongoDB (`SalesData.insert_many()`)
7. Analytics generated (`AnalyticsService.analyze_product_performance()`)
8. AI insights requested (`GeminiService.generate_business_insights()`)
9. Results stored in upload session
10. Response returned to frontend
11. Dashboard updates with new data

### 1.4 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│  LAYER 1: Transport Security                             │
│  • TLS 1.3 encryption (HTTPS)                            │
│  • HSTS headers                                          │
│  • Secure cookies                                        │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: Authentication                                 │
│  • JWT Bearer tokens (15-min access, 7-day refresh)     │
│  • bcrypt password hashing (12 rounds)                   │
│  • Token blacklist for logout                            │
│  • Rate limiting on auth endpoints (5/min)               │
├─────────────────────────────────────────────────────────┤
│  LAYER 3: Authorization                                  │
│  • Role-based access control (RBAC)                      │
│  • @jwt_required decorator on protected routes           │
│  • @admin_required for admin endpoints                   │
│  • User ownership verification on resources              │
├─────────────────────────────────────────────────────────┤
│  LAYER 4: Application Security                           │
│  • Input validation on all endpoints                     │
│  • SQL/NoSQL injection prevention                        │
│  • XSS protection via Content-Security-Policy            │
│  • CORS configuration                                    │
│  • Rate limiting (100 req/min default)                   │
├─────────────────────────────────────────────────────────┤
│  LAYER 5: Data Security                                  │
│  • Passwords never stored in plaintext                   │
│  • Sensitive fields sanitized in responses               │
│  • Audit logging for all actions                         │
│  • GDPR-ready data handling                              │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Purpose & Problem Statement

### 2.1 What ShopSense AI Does

ShopSense AI is an **AI-powered business analytics platform** that transforms raw sales data into actionable business insights. It enables businesses of all sizes to make data-driven decisions through:

- **Automated Analytics**: Instant analysis of sales performance
- **AI-Generated Insights**: Google Gemini-powered strategic recommendations
- **Predictive Forecasting**: Facebook Prophet for accurate sales predictions
- **Customer Intelligence**: RFM segmentation, affinity analysis, personas
- **Beautiful Visualizations**: Interactive charts and dashboards

### 2.2 Problem Statement

#### Current Market Challenges

| Problem | Impact | Current Solutions |
|---------|--------|-------------------|
| **Data Silos** | Scattered data across spreadsheets, POS, e-commerce | Manual consolidation, error-prone |
| **Analysis Paralysis** | Too much data, not enough insights | Basic dashboards without context |
| **Delayed Insights** | Weekly/monthly reports miss opportunities | Batch processing, lag time |
| **High Cost** | Enterprise BI tools cost $50-200/user/month | Tableau, Power BI, Looker |
| **Complexity** | Steep learning curve for non-technical users | Requires training, analysts |
| **No Actionable Guidance** | Charts show "what" not "what to do" | Descriptive analytics only |

#### Research Validation

- **73%** of SMBs don't use analytics due to complexity/cost (Gartner 2025)
- **4-6 hours** average time to insight for manual analysis
- **68%** of business decisions made without adequate data support
- **15-20%** revenue lost due to poor inventory decisions

### 2.3 How ShopSense AI Solves These Problems

| Challenge | ShopSense Solution |
|-----------|-------------------|
| **Data Silos** | Unified platform - single source of truth |
| **Analysis Paralysis** | AI-curated insights highlight what matters |
| **Delayed Insights** | Real-time analysis, instant results |
| **High Cost** | Fraction of enterprise tool costs |
| **Complexity** | Intuitive UI, no training required |
| **No Guidance** | AI provides specific action items |

### 2.4 Value Proposition

| For | Value Delivered |
|-----|-----------------|
| **Small Businesses** | Enterprise-grade analytics without complexity |
| **Retail Managers** | Real-time visibility into product performance |
| **Data Analysts** | Automated insights, focus on strategy |
| **Executives** | Clear, actionable recommendations |

---

## 3. Section 1: Overview (Dashboard)

### 3.1 Purpose

The Dashboard provides an at-a-glance view of business performance with key metrics, visualizations, and AI insights.

### 3.2 Components

**File:** `/frontend/src/components/DashboardHome.tsx`

### 3.3 Features

#### KPI Cards

| Metric | Description | Calculation |
|--------|-------------|-------------|
| **Total Revenue** | Sum of all sales revenue | Σ(units_sold × price) |
| **Total Units** | Total items sold | Σ(units_sold) |
| **Total Products** | Unique products in catalog | COUNT(DISTINCT product_name) |
| **Avg Order Value** | Revenue per unit sold | Total Revenue / Total Units |
| **Avg Price** | Average product price | AVG(price) |

#### Visualizations

1. **Top Products Bar Chart**
   - Shows top 10 products by units sold
   - Interactive hover for details
   - Color-coded by performance

2. **Low Products Bar Chart**
   - Shows bottom 10 products by units sold
   - Identifies underperformers
   - Helps prioritize actions

3. **Price vs Volume Scatter Plot**
   - Each point represents a product
   - X-axis: Price, Y-axis: Units sold
   - Identifies pricing opportunities

4. **Time Series Line Chart**
   - Daily sales trend over time
   - Shows revenue and units
   - Identifies seasonal patterns

5. **Forecast Chart**
   - 30-day sales prediction
   - Confidence intervals shown
   - Based on Facebook Prophet

### 3.4 API Endpoints

```
GET /api/v1/dashboard          # Complete dashboard data
GET /api/v1/dashboard/kpis     # KPI cards only
GET /api/v1/dashboard/charts   # Chart data only
```

### 3.5 Data Structure

```typescript
interface DashboardData {
  has_data: boolean;
  kpis: {
    total_revenue: number;
    total_units: number;
    total_products: number;
    avg_order_value: number;
    avg_price: number;
  };
  charts: {
    top_products: ProductData[];
    low_products: ProductData[];
    price_volume: ProductData[];
    time_series: TrendData[];
    forecast: ForecastPrediction[];
  };
  analysis: {
    product_analysis: ProductAnalysis;
    trend_analysis: TrendAnalysis;
    recommendations: Recommendation[];
  };
}
```

---

## 4. Section 2: Data Upload

### 4.1 Purpose

Allows users to import sales data via CSV file upload or manual entry for analysis.

### 4.2 Components

**File:** `/frontend/src/components/DataUpload.tsx`

### 4.3 Features

#### CSV Upload

**Supported Format:**
```csv
product_name,date,units_sold,price
iPhone 15,2024-01-15,150,999.99
Samsung S24,2024-01-15,120,899.99
```

**Requirements:**
- File type: `.csv` only
- Maximum size: 10MB
- Required columns: `product_name`, `date`, `units_sold`, `price`
- Date format: `YYYY-MM-DD` (auto-detects common formats)
- Minimum data: 7 days for forecasting

**Validation Rules:**
- `units_sold`: Must be numeric, non-negative
- `price`: Must be numeric, non-negative
- `product_name`: Must be non-empty string
- `date`: Must be valid date within last 5 years

#### Manual Entry

- Add individual sales records via form
- Dynamic row addition/removal
- Real-time validation
- Submit multiple records at once

#### Upload Processing

1. **File Validation**: Check file type, size, structure
2. **Data Parsing**: Read CSV with Pandas
3. **Data Cleaning**: Remove nulls, fix types
4. **Storage**: Insert into MongoDB `sales_data` collection
5. **Analytics**: Generate product summary, trends
6. **AI Insights**: Request insights from Gemini
7. **Response**: Return upload_id and analysis

### 4.4 API Endpoints

```
POST /api/v1/uploads           # Upload CSV file
POST /api/v1/uploads/manual    # Manual data entry
GET  /api/v1/uploads           # List upload history
GET  /api/v1/uploads/:id       # Get upload details
DELETE /api/v1/uploads/:id     # Delete upload
```

### 4.5 Upload Session Model

```python
{
    "_id": ObjectId,
    "upload_id": "abc123-def456",
    "user_id": ObjectId,
    "filename": "sales_january.csv",
    "file_type": "csv",  # or "manual"
    "status": "completed",  # pending, processing, completed, failed
    "row_count": 1000,
    "created_at": datetime,
    "completed_at": datetime,
    "results": {
        "rows_processed": 1000,
        "products": 50,
        "date_range": {
            "start": "2024-01-01",
            "end": "2024-01-31"
        }
    }
}
```

---

## 5. Section 3: Analysis

### 5.1 Purpose

Provides comprehensive AI-powered analysis of sales data with actionable recommendations.

### 5.2 Components

**File:** `/frontend/src/components/AnalysisReport.tsx`

### 5.3 Features

#### Product Performance Analysis

**Metrics Calculated:**
- Total products, revenue, units
- Average price and units per product
- Top performer by units and revenue
- Bottom performer identification
- Price segmentation (quartiles)
- Performance distribution (High/Medium/Low)

**Backend Service:** `AnalyticsService.analyze_product_performance()`

#### Trend Analysis

**Metrics Calculated:**
- Trend direction (increasing/decreasing)
- Average daily growth rate
- Average daily revenue
- Peak and low days of week
- Revenue volatility (standard deviation)
- 7-day and 30-day moving averages

**Backend Service:** `AnalyticsService.analyze_trends()`

#### Sales Forecasting

**Algorithm:** Facebook Prophet

**Parameters:**
- `changepoint_prior_scale`: 0.05
- `seasonality_mode`: additive
- `weekly_seasonality`: enabled
- `interval_width`: 0.8 (80% confidence)

**Output:**
- Daily predictions for 30-90 days
- Lower and upper confidence bounds
- Trend and seasonality components

**Backend Service:** `ForecastService.forecast()`

#### AI-Powered Insights

**Provider:** Google Gemini AI (gemini-2.5-flash model)

**Insight Categories:**

1. **Performance Analysis**
   - Top performers and success factors
   - Underperformers and improvement opportunities
   - Revenue trends and patterns

2. **Market Insights**
   - Customer behavior patterns
   - Market trends and opportunities
   - Competitive positioning

3. **Strategic Recommendations**
   - Immediate actions (0-30 days)
   - Short-term strategies (30-90 days)
   - Long-term initiatives (6-12 months)

4. **Financial Insights**
   - Revenue optimization opportunities
   - Pricing strategy recommendations
   - Margin improvement tactics

5. **Operational Efficiency**
   - Inventory management insights
   - Process improvement suggestions
   - Technology opportunities

6. **Executive Summary**
   - Key takeaways
   - Critical success factors
   - Next steps

**Backend Service:** `GeminiService.generate_business_insights()`

### 5.4 Visualizations

| Chart | Type | Purpose |
|-------|------|---------|
| Most Selling Products | Bar | Top 10 by units |
| Low Selling Products | Bar | Bottom 10 by units |
| Sales Prediction | Line | Prophet forecast |
| Product Performance | Multi | Comprehensive view |
| High Cost High Sales | Scatter | Pricing analysis |
| Low Cost High Sales | Scatter | Value products |

### 5.5 API Endpoints

```
GET  /api/v1/analytics/summary      # Complete analysis
GET  /api/v1/analytics/products     # Product performance
GET  /api/v1/analytics/trends       # Time series data
GET  /api/v1/analytics/forecast     # Sales forecast
POST /api/v1/analytics/insights     # AI insights
```

---

## 6. Section 4: History

### 6.1 Purpose

Tracks all past data uploads and analysis sessions for reference and comparison.

### 6.2 Components

**File:** `/frontend/src/components/DataHistory.tsx`

### 6.3 Features

#### Upload History

- List all uploads with status indicators
- Filter by status (completed, processing, failed)
- Sort by date (newest first)
- Search by filename

#### Upload Details

For each upload session:
- Filename and upload date
- Processing status
- Rows processed
- Product count
- Date range covered
- Link to full analysis report

#### Actions

- **View Report**: Open full analysis for completed uploads
- **Delete**: Remove upload and associated data
- **Compare**: (Future) Compare multiple uploads

### 6.4 Data Structure

```typescript
interface UploadSession {
  _id: string;
  upload_id: string;
  user_id: string;
  filename: string;
  file_type: "csv" | "manual";
  status: "pending" | "processing" | "completed" | "failed";
  row_count?: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  results?: {
    rows_processed: number;
    products: number;
    date_range: {
      start: string;
      end: string;
    };
  };
}
```

### 6.5 API Endpoints

```
GET /api/v1/uploads              # List uploads (with filters)
GET /api/v1/uploads/:id          # Get upload details
DELETE /api/v1/uploads/:id       # Delete upload
```

---

## 7. Section 5: Customers

### 7.1 Purpose

Provides deep customer intelligence through segmentation, affinity analysis, sentiment tracking, and persona generation.

### 7.2 Components

**Files:**
- `/frontend/src/components/CustomerSegments.tsx`
- `/frontend/src/components/AffinityNetwork.tsx`
- `/frontend/src/components/Sentiment.tsx`
- `/frontend/src/components/Personas.tsx`

### 7.3 Features

#### Customer Segmentation (RFM Analysis)

**Methodology:**
1. **Recency**: Days since last purchase (lower is better)
2. **Frequency**: Number of purchases (higher is better)
3. **Monetary**: Total spend (higher is better)

**Scoring:**
- Each dimension scored 1-5 (quintiles)
- Combined RFM score: R×100 + F×10 + M

**Clustering:**
- K-Means algorithm (k=4 default)
- StandardScaler for feature normalization
- Automatic segment naming based on characteristics

**Segment Types:**
| Segment | Characteristics | Strategy |
|---------|----------------|----------|
| **Champions** | Recent, frequent, high spend | VIP rewards |
| **Loyal Customers** | Frequent buyers | Loyalty program |
| **Big Spenders** | High monetary value | Premium offers |
| **At Risk** | Not recent | Win-back campaign |
| **Value Seekers** | Recent, low frequency | Engagement campaigns |
| **New Customers** | Very recent | Onboarding sequence |

**Backend Service:** `SegmentationService`

#### Product Affinity Analysis

**Algorithm:** Association Rule Mining (Apriori)

**Metrics:**
- **Support**: How often items appear together
- **Confidence**: Likelihood of buying Y given X
- **Lift**: How much more likely Y is bought with X

**Applications:**
- Product bundle recommendations
- Cross-sell opportunities
- Store layout optimization
- Marketing campaign targeting

**Output:**
- Affinity network graph (nodes = products, links = relationships)
- Association rules list
- Suggested product bundles

**Backend Service:** `AffinityService`

#### Sentiment Analysis

**Purpose:** Analyze customer satisfaction from product reviews/feedback

**Metrics:**
- Overall sentiment score (0-100)
- Sentiment distribution (positive/neutral/negative)
- Category-level sentiment
- Keyword extraction (positive/negative)

**Visualization:**
- Sentiment gauge chart
- Category comparison bar chart
- Word cloud for keywords

**Backend Service:** `SentimentService`

#### Customer Personas

**Generation:** Data-driven persona creation based on segment characteristics

**Persona Attributes:**
- Name and role (e.g., "Sarah the Explorer")
- Demographics (age, gender, location)
- Behavior metrics (AOV, frequency, RFM score)
- Preferences (payment, shipping, categories)
- Description and motivations

**Use Cases:**
- Marketing campaign targeting
- Product development priorities
- Customer experience design

**Backend Service:** `PersonaService`

#### Behavioral Recommendations

**Categories:**
- **Merchandising**: Bundles, cross-sells, product placement
- **Marketing**: Segment-specific campaigns, loyalty programs
- **Product**: Line expansion, feature improvements
- **Customer Experience**: Satisfaction improvements

**Priority Levels:** High, Medium, Low

**Implementation Steps:** Each recommendation includes actionable steps

**Backend Service:** `RecommendationService`

### 7.4 API Endpoints

```
# Segmentation
GET /api/v1/behavior/segments
GET /api/v1/behavior/segments/:id/customers

# Affinity
GET /api/v1/behavior/affinity/network
GET /api/v1/behavior/affinity/rules
GET /api/v1/behavior/affinity/bundles

# Sentiment
GET /api/v1/behavior/sentiment/overview
GET /api/v1/behavior/sentiment/by-category
GET /api/v1/behavior/sentiment/keywords

# Personas
GET /api/v1/behavior/personas

# Recommendations
GET /api/v1/behavior/recommendations
GET /api/v1/behavior/insights/summary
```

---

## 8. Section 6: Tips

### 8.1 Purpose

Provides contextual guidance, best practices, and help documentation to users.

### 8.2 Features

#### Contextual Tips

Tips appear based on user context:
- **First-time users**: Onboarding guidance
- **Upload page**: CSV format examples
- **Analysis page**: How to interpret insights
- **Customer section**: Segmentation strategies

#### Best Practices Library

**Data Upload:**
- Minimum 7 days of data for forecasting
- Clean data improves accuracy
- Consistent date formats recommended

**Analysis Interpretation:**
- Focus on trends, not single data points
- Consider seasonality in forecasts
- AI recommendations are suggestions, not commands

**Customer Segmentation:**
- Champions need retention focus
- At-risk customers need immediate attention
- New customers need onboarding

#### Video Tutorials (Future)

- Platform walkthrough
- Feature deep-dives
- Use case examples

#### FAQ

Common questions with answers:
- How to format CSV files
- Understanding forecast confidence intervals
- Interpreting RFM scores
- Acting on recommendations

### 8.3 Implementation

Tips are stored as static content in the frontend and displayed via:
- Toast notifications
- Inline help text
- Tooltip popovers
- Dedicated tips panel

---

## 9. Section 7: Account

### 9.1 Purpose

Manages user authentication, profile settings, and preferences.

### 9.2 Components

**File:** `/frontend/src/components/AccountSettings.tsx`

### 9.3 Features

#### Authentication

**Registration:**
- Username (unique, min 3 chars)
- Email (unique, validated format)
- Password (min 8 chars, mixed case, numbers)
- Company name (optional)

**Login:**
- Email or username accepted
- Password verification
- JWT token generation
- Remember me option

**Logout:**
- Token revocation (blacklist)
- Session cleanup
- Redirect to landing page

**Password Reset:**
- Email-based recovery (future)
- Secure token generation
- Expiration handling

#### Profile Management

**Editable Fields:**
- Company name
- Display preferences
- Timezone
- Currency
- Theme (light/dark)

**Read-Only Fields:**
- Username
- Email
- Account creation date
- Role

#### Security Settings

**Password Change:**
- Current password verification
- New password validation
- Confirmation requirement

**Session Management:**
- View active sessions (future)
- Remote logout capability
- Session timeout settings

#### Preferences

**Display:**
- Theme selection
- Date format
- Number format

**Notifications:**
- Email notifications (future)
- In-app notifications
- Report scheduling

### 9.4 User Model

```python
{
    "_id": ObjectId,
    "username": "johndoe",
    "email": "john@example.com",
    "password_hash": "$2b$12$...",  # bcrypt
    "role": "user",  # user, admin, viewer
    "company_name": "Acme Corp",
    "created_at": datetime,
    "updated_at": datetime,
    "last_login": datetime,
    "is_active": True,
    "is_verified": False,
    "preferences": {
        "theme": "dark",
        "timezone": "UTC",
        "date_format": "YYYY-MM-DD",
        "currency": "USD"
    }
}
```

### 9.5 API Endpoints

```
POST /api/v1/auth/register       # Create account
POST /api/v1/auth/login          # Authenticate
POST /api/v1/auth/logout         # Revoke tokens
POST /api/v1/auth/refresh        # Refresh access token
GET  /api/v1/auth/me             # Get current user
PUT  /api/v1/auth/me             # Update profile
POST /api/v1/auth/change-password # Change password
```

### 9.6 Token Management

**Access Token:**
- Duration: 15 minutes
- Purpose: API authentication
- Stored in: Frontend memory + localStorage

**Refresh Token:**
- Duration: 7 days
- Purpose: Obtain new access tokens
- Stored in: Secure localStorage

**Token Blacklist:**
- Revoked tokens stored in MongoDB
- TTL index for automatic expiration
- Checked on every authenticated request

---

## 10. Complete Feature List

### 10.1 Authentication & Authorization

| Feature | Status | Description |
|---------|--------|-------------|
| User Registration | ✅ | Email/password signup with validation |
| User Login | ✅ | Email or username authentication |
| JWT Tokens | ✅ | 15-min access, 7-day refresh |
| Token Refresh | ✅ | Automatic token renewal |
| Logout | ✅ | Token revocation and blacklist |
| Password Change | ✅ | Secure password update |
| Role-Based Access | ✅ | User, Admin, Viewer roles |
| Rate Limiting | ✅ | 5/min auth, 100/min default |

### 10.2 Data Management

| Feature | Status | Description |
|---------|--------|-------------|
| CSV Upload | ✅ | Drag-and-drop file upload |
| Manual Entry | ✅ | Form-based data input |
| Data Validation | ✅ | Column and type checking |
| Upload History | ✅ | Track all uploads |
| Data Deletion | ✅ | Remove uploads and data |
| Data Preview | ⏳ | Show data before processing |
| Excel Upload | ⏳ | .xlsx file support |
| API Integrations | ⏳ | Shopify, WooCommerce |

### 10.3 Analytics & Insights

| Feature | Status | Description |
|---------|--------|-------------|
| KPI Dashboard | ✅ | Revenue, units, products metrics |
| Product Analysis | ✅ | Top/bottom performers |
| Trend Analysis | ✅ | Time series, growth rates |
| Price Analysis | ✅ | Price vs volume scatter |
| Sales Forecasting | ✅ | 30-90 day Prophet forecast |
| AI Insights | ✅ | Google Gemini recommendations |
| Executive Summary | ✅ | One-page key takeaways |
| Custom Date Range | ⏳ | Filter by date range |
| Comparison Mode | ⏳ | Compare periods |

### 10.4 Customer Intelligence

| Feature | Status | Description |
|---------|--------|-------------|
| RFM Segmentation | ✅ | Recency, Frequency, Monetary |
| K-Means Clustering | ✅ | Automatic segment discovery |
| Segment Visualization | ✅ | Pie charts, bar charts |
| Affinity Analysis | ✅ | Product association rules |
| Bundle Recommendations | ✅ | Suggested product bundles |
| Sentiment Analysis | ✅ | Customer satisfaction scoring |
| Customer Personas | ✅ | Data-driven persona generation |
| Behavioral Recommendations | ✅ | Actionable insights |

### 10.5 Visualization

| Feature | Status | Description |
|---------|--------|-------------|
| Bar Charts | ✅ | Product performance |
| Line Charts | ✅ | Time series trends |
| Scatter Plots | ✅ | Price analysis |
| Pie Charts | ✅ | Segment distribution |
| Forecast Charts | ✅ | Prediction with confidence |
| Network Graph | ✅ | Affinity relationships |
| Gauge Charts | ✅ | Sentiment scores |
| Export Charts | ⏳ | PNG, PDF download |

### 10.6 User Experience

| Feature | Status | Description |
|---------|--------|-------------|
| Responsive Design | ✅ | Mobile, tablet, desktop |
| Dark Theme | ✅ | Default dark mode |
| Smooth Animations | ✅ | Framer Motion transitions |
| Real-time Updates | ✅ | WebSocket support |
| Toast Notifications | ✅ | Action feedback |
| Guided Tour | ✅ | First-time onboarding |
| Search | ✅ | Find uploads and reports |
| Keyboard Shortcuts | ⏳ | Quick actions |

### 10.7 Security & Compliance

| Feature | Status | Description |
|---------|--------|-------------|
| Password Hashing | ✅ | bcrypt (12 rounds) |
| JWT Authentication | ✅ | Stateless auth |
| Rate Limiting | ✅ | Prevent abuse |
| CORS Protection | ✅ | Origin validation |
| Security Headers | ✅ | CSP, HSTS |
| Input Validation | ✅ | All endpoints |
| Audit Logging | ✅ | Action tracking |
| GDPR Ready | ✅ | Data handling |

**Legend:** ✅ Implemented | ⏳ Planned | ❌ Not Started

---

## 11. Feasibility Analysis

### 11.1 How ShopSense AI Solves the Problem

#### Problem 1: Data Silos

**Solution:**
- Single platform for all sales data
- CSV upload from any source
- Manual entry for small datasets
- Future: API integrations (Shopify, WooCommerce)

**Implementation:**
```python
# Unified data model in MongoDB
{
    "user_id": ObjectId,
    "product_name": "Product A",
    "date": datetime,
    "units_sold": 100,
    "price": 19.99,
    "revenue": 1999.00  # Auto-calculated
}
```

#### Problem 2: Analysis Paralysis

**Solution:**
- AI-curated insights highlight what matters
- Prioritized recommendations (High/Medium/Low)
- Executive summary for quick decisions

**Implementation:**
```python
# Gemini generates structured insights
{
    "performance_analysis": {
        "top_performers": ["Product A", "Product B"],
        "key_insights": ["Insight 1", "Insight 2"]
    },
    "strategic_recommendations": {
        "immediate_actions": ["Action 1", "Action 2"]
    }
}
```

#### Problem 3: Delayed Insights

**Solution:**
- Real-time analysis on upload
- Instant dashboard updates
- No batch processing delays

**Implementation:**
```python
# Analytics generated during upload
def upload_file():
    # ... validate and store data
    analysis = analytics_service.analyze_product_performance(df)
    insights = gemini_service.generate_business_insights(analysis)
    return {'analysis': analysis, 'insights': insights}
```

#### Problem 4: High Cost

**Solution:**
- Open-source stack (Flask, React, MongoDB)
- No per-user licensing fees
- Cloud-hosted option affordable for SMBs

**Cost Comparison:**
| Solution | Cost (10 users) |
|----------|-----------------|
| Tableau | $840/month |
| Power BI | $100/month |
| Looker | $500/month |
| **ShopSense AI** | **$0 (self-hosted)** |

#### Problem 5: Complexity

**Solution:**
- Intuitive drag-and-drop interface
- No SQL or technical knowledge required
- Guided tour for first-time users
- Contextual tips throughout

**Implementation:**
```typescript
// Simple API client for frontend
const res = await api.upload(file);
if (res.success) {
    toast.success("Upload complete!");
    onViewReport(res.data.upload_id);
}
```

#### Problem 6: No Actionable Guidance

**Solution:**
- AI provides specific action items
- Implementation steps for each recommendation
- Expected impact quantified

**Example Recommendation:**
```json
{
    "title": "Create Product Bundle: Phone + Case",
    "description": "These products have 2.5x lift affinity",
    "expected_impact": "10-15% increase in AOV",
    "priority": "High",
    "timeline": "Immediate",
    "implementation_steps": [
        "Create bundle listing",
        "Set bundle price (5-10% discount)",
        "Feature on homepage",
        "Monitor conversion rate"
    ]
}
```

### 11.2 Technical Feasibility

| Component | Technology | Maturity | Risk |
|-----------|------------|----------|------|
| Backend API | Flask | High | Low |
| Frontend UI | React | High | Low |
| Database | MongoDB | High | Low |
| Authentication | JWT | High | Low |
| Analytics | Pandas | High | Low |
| Forecasting | Prophet | Medium | Low |
| AI Insights | Gemini | Medium | Low |
| Real-time | SocketIO | High | Low |

### 11.3 Business Feasibility

**Market Size:**
- TAM: $25B (Global SMB Analytics)
- SAM: $8B (US & Europe SMB Retail)
- SOM: $80M (1% in 3 years)

**Revenue Model:**
- Free tier: Basic features
- Pro tier: $29/month (advanced analytics)
- Business tier: $99/month (team features)
- Enterprise: Custom pricing

**Competitive Advantage:**
1. AI-first approach (not just dashboards)
2. Affordable pricing for SMBs
3. No training required
4. Beautiful, modern UX

### 11.4 Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| User Acquisition | 10,000 businesses | Month 12 |
| Engagement (DAU/MAU) | >40% | Month 6 |
| Retention (Churn) | <5% monthly | Month 6 |
| Revenue (MRR) | $500K | Month 12 |
| Satisfaction (NPS) | >50 | Month 6 |

---

## 12. API Reference Summary

### 12.1 Base URL

```
Development: http://localhost:5000/api/v1
Production: https://api.shopsense.ai/api/v1
```

### 12.2 Authentication

All endpoints (except health check) require JWT authentication:

```
Authorization: Bearer <access_token>
```

### 12.3 Endpoint Summary

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Authenticate user |
| POST | `/auth/logout` | Revoke tokens |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/me` | Update profile |
| POST | `/auth/change-password` | Change password |

#### Uploads

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/uploads` | Upload CSV file |
| POST | `/uploads/manual` | Manual data entry |
| GET | `/uploads` | List upload history |
| GET | `/uploads/:id` | Get upload details |
| DELETE | `/uploads/:id` | Delete upload |
| GET | `/uploads/:id/data` | Get raw data |

#### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/summary` | Complete analysis |
| GET | `/analytics/products` | Product performance |
| GET | `/analytics/trends` | Time series data |
| GET | `/analytics/forecast` | Sales forecast |
| POST | `/analytics/insights` | AI insights |

#### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Complete dashboard |
| GET | `/dashboard/kpis` | KPI cards only |
| GET | `/dashboard/charts` | Chart data only |

#### Behavior Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/behavior/segments` | Customer segments |
| GET | `/behavior/segments/:id/customers` | Segment customers |
| GET | `/behavior/affinity/network` | Affinity network |
| GET | `/behavior/affinity/rules` | Association rules |
| GET | `/behavior/affinity/bundles` | Product bundles |
| GET | `/behavior/sentiment/overview` | Sentiment overview |
| GET | `/behavior/sentiment/by-category` | Category sentiment |
| GET | `/behavior/sentiment/keywords` | Sentiment keywords |
| GET | `/behavior/personas` | Customer personas |
| GET | `/behavior/recommendations` | Recommendations |
| GET | `/behavior/insights/summary` | Complete summary |

#### Exports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exports/pdf/:id` | Export PDF report |
| GET | `/exports/csv/:id` | Export CSV data |

### 12.4 Error Codes

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

### 12.5 Rate Limits

| Endpoint | Limit |
|----------|-------|
| Default | 100 requests/minute |
| Auth endpoints | 5 requests/minute |
| Upload endpoints | 10 requests/hour |

---

## Appendix

### A. File Structure

```
Shop/
├── backend/
│   ├── app.py                 # Flask application entry
│   ├── config.py              # Configuration management
│   ├── security_config.py     # Security settings
│   ├── routes/
│   │   ├── auth.py           # Authentication routes
│   │   ├── uploads.py        # Upload routes
│   │   ├── analytics.py      # Analytics routes
│   │   ├── dashboard.py      # Dashboard routes
│   │   ├── behavior.py       # Behavior analytics
│   │   └── exports.py        # Export routes
│   ├── services/
│   │   ├── auth_service.py   # Authentication logic
│   │   ├── analytics_service.py
│   │   ├── forecast_service.py
│   │   ├── segmentation_service.py
│   │   ├── affinity_service.py
│   │   ├── sentiment_service.py
│   │   ├── persona_service.py
│   │   └── recommendation_service.py
│   ├── models/
│   │   ├── user.py           # User model
│   │   ├── upload.py         # Upload model
│   │   └── sales_data.py     # Sales data model
│   ├── middleware/
│   │   ├── error_handler.py
│   │   └── rate_limiter.py
│   └── utils/
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main component
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DashboardHome.tsx
│   │   │   ├── DataUpload.tsx
│   │   │   ├── AnalysisReport.tsx
│   │   │   ├── DataHistory.tsx
│   │   │   ├── CustomerSegments.tsx
│   │   │   ├── Personas.tsx
│   │   │   ├── AffinityNetwork.tsx
│   │   │   ├── Sentiment.tsx
│   │   │   ├── AccountSettings.tsx
│   │   │   └── Sidebar.tsx
│   │   └── lib/
│   │       ├── api.ts        # API client
│   │       └── utils.ts
│   └── package.json
├── docs/
│   └── API.md
├── PRD.md                     # Product requirements
├── README.md
└── docker-compose.yml
```

### B. Environment Variables

```env
# Application
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000

# Security
SECRET_KEY=<32+ character random string>
JWT_SECRET_KEY=<32+ character random string>
JWT_ACCESS_TOKEN_EXPIRES=900
JWT_REFRESH_TOKEN_EXPIRES=604800

# Database
MONGO_URI=mongodb://localhost:27017/shopsense_analytics
MONGO_DB_NAME=shopsense_analytics

# AI
GEMINI_API_KEY=<your-gemini-api-key>

# CORS
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### C. Quick Start Commands

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker-compose up -d
```

---

**Document Version:** 1.0  
**Last Updated:** February 28, 2026  
**Maintained By:** ShopSense AI Development Team
