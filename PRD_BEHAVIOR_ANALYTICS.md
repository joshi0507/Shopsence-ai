# 🛍️ Shopper Behavior & Affinity Discovery

## Product Requirements Document (PRD) - Feature Addendum

**Version:** 1.0.0  
**Status:** Proposed  
**Last Updated:** February 27, 2026  
**Document Owner:** Product Team  
**Related To:** ShopSense AI Core Platform (v2.0.0)

---

## 📋 Table of Contents

1. [Feature Overview](#feature-overview)
2. [Problem Statement](#problem-statement)
3. [Target Audience](#target-audience)
4. [Features & Requirements](#features--requirements)
5. [User Stories](#user-stories)
6. [Technical Specifications](#technical-specifications)
7. [Data Requirements](#data-requirements)
8. [Success Metrics](#success-metrics)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Appendix](#appendix)

---

## 1. Feature Overview

### 1.1 What is Shopper Behavior & Affinity Discovery?

**Shopper Behavior & Affinity Discovery** is an advanced analytics module that transforms raw e-commerce transaction data into deep insights about customer behavior, preferences, and product relationships.

This module enables businesses to:
- **Segment customers** based on behavioral patterns and preferences
- **Discover product affinities** - which products are bought together
- **Analyze sentiment** from customer reviews and ratings
- **Generate data-driven personas** for marketing targeting
- **Receive actionable recommendations** for merchandising and marketing

### 1.2 Value Proposition

| Stakeholder | Value Delivered |
|-------------|-----------------|
| **Merchandising Teams** | Understand which products to bundle, promote, or discontinue based on affinity patterns |
| **Marketing Teams** | Target specific customer segments with personalized campaigns |
| **Product Managers** | Identify cross-selling and upselling opportunities |
| **Customer Success** | Understand sentiment drivers and improve customer experience |
| **Executives** | Strategic insights into customer behavior trends |

### 1.3 Key Capabilities

```
┌─────────────────────────────────────────────────────────────┐
│              Shopper Behavior & Affinity Discovery           │
├─────────────────┬─────────────────┬─────────────────────────┤
│   SEGMENTATION  │    AFFINITY     │      SENTIMENT          │
│   • RFM Analysis│   • Market Basket│   • Review Analysis     │
│   • Clustering  │   • Co-purchase  │   • Rating Distribution │
│   • Personas    │   • Cross-category│  • Keyword Extraction  │
├─────────────────┼─────────────────┼─────────────────────────┤
│   BEHAVIORAL    │   RECOMMENDATION│      VISUALIZATION      │
│   • Patterns    │   • Merchandising│   • Network Graphs     │
│   • Trends      │   • Marketing    │   • Segment Maps       │
│   • Predictions │   • Personalization│  • Sentiment Gauges   │
└─────────────────┴─────────────────┴─────────────────────────┘
```

---

## 2. Problem Statement

### 2.1 Business Challenge

E-commerce businesses struggle with:

| Problem | Impact | Current Gap |
|---------|--------|-------------|
| **Unknown Customer Segments** | One-size-fits-all marketing | No behavioral segmentation |
| **Missed Cross-sell Opportunities** | Lower AOV (Average Order Value) | No affinity analysis |
| **Poor Personalization** | Low conversion rates | Generic recommendations |
| **Unanalyzed Reviews** | Missed sentiment insights | No NLP processing |
| **Intuitive Decisions** | Suboptimal merchandising | Lack of data-driven guidance |

### 2.2 Market Opportunity

**Statistics:**
- 73% of consumers expect personalized experiences (McKinsey)
- Personalization can deliver 5-15% revenue lift
- Market basket analysis can increase AOV by 10-30%
- Sentiment analysis improves customer retention by 15%

### 2.3 Solution Overview

This module addresses the problem statement from the original challenge:

> **Design a shopper behavior analysis and segmentation framework that reveals purchasing affinities and explains how different customer groups interact with products.**

**Our Solution:**
1. **Behavioral Segmentation** - RFM analysis + ML clustering
2. **Affinity Discovery** - Market basket analysis with association rules
3. **Sentiment Analysis** - NLP processing of reviews
4. **Persona Generation** - Data-driven customer profiles
5. **Actionable Insights** - Merchandising & marketing recommendations

---

## 3. Target Audience

### 3.1 Primary Personas

#### 👤 Persona 1: Sarah - Retail Store Owner (Revisited)

**How This Feature Helps:**
- Identifies her best customer segments for targeted promotions
- Reveals which products are frequently bought together for bundling
- Shows customer sentiment to improve product selection
- Provides ready-to-use customer personas for marketing

**Use Case:**
> "Sarah discovers that customers who buy 'Blouses' also frequently purchase 'Handbags'. She creates a bundle deal and sees a 25% increase in average order value."

#### 👤 Persona 2: Mike - E-commerce Manager (Revisited)

**How This Feature Helps:**
- Segments customers by behavior for targeted email campaigns
- Identifies cross-category opportunities for homepage merchandising
- Analyzes review sentiment to identify product issues early
- Discovers high-value customer segments for retention programs

**Use Case:**
> "Mike uses segmentation to identify 'At-Risk' loyal customers and launches a win-back campaign with 40% recovery rate."

#### 👤 Persona 3: Jennifer - Business Analyst (Revisited)

**How This Feature Helps:**
- Automated segmentation saves 10+ hours of manual analysis
- Affinity networks provide visual insights for stakeholder presentations
- Sentiment dashboards answer customer experience questions instantly
- Persona reports enable self-service analytics for marketing team

**Use Case:**
> "Jennifer creates a persona report that the marketing team uses to segment their email list, resulting in 3x higher open rates."

### 3.2 Secondary Personas

#### 👤 Persona 4: Marketing Manager

**Goals:**
- Create targeted campaigns
- Improve ROI on ad spend
- Increase customer lifetime value

**Needs:**
- Clear segment definitions
- Segment size and value
- Preferred channels per segment

#### 👤 Persona 5: Merchandising Director

**Goals:**
- Optimize product assortment
- Maximize revenue per visitor
- Reduce inventory waste

**Needs:**
- Product affinity maps
- Cross-sell opportunities
- Discontinuation recommendations

---

## 4. Features & Requirements

### 4.1 Feature Categories

```
┌────────────────────────────────────────────────────────────┐
│  TIER 1: CORE (MVP)                                        │
├────────────────────────────────────────────────────────────┤
│  ✓ Customer Segmentation (RFM + Clustering)               │
│  ✓ Product Affinity Network                               │
│  ✓ Basic Sentiment Analysis                               │
│  ✓ Data-Driven Personas                                   │
├────────────────────────────────────────────────────────────┤
│  TIER 2: ADVANCED (v2.0)                                  │
├────────────────────────────────────────────────────────────┤
│  ✓ Market Basket Analysis                                 │
│  ✓ Cross-Category Insights                                │
│  ✓ Behavioral Recommendations                             │
│  ✓ Segment Comparison                                     │
├────────────────────────────────────────────────────────────┤
│  TIER 3: PREMIUM (v3.0)                                   │
├────────────────────────────────────────────────────────────┤
│  ✓ Real-time Segmentation                                 │
│  ✓ Predictive Lifetime Value                              │
│  ✓ Advanced NLP (Topic Modeling)                          │
│  ✓ A/B Testing Integration                                │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Detailed Feature Specifications

#### 4.2.1 Customer Segmentation

**User Story:** As a marketing manager, I want to see distinct customer segments so I can create targeted campaigns.

**Requirements:**

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| SEG-01 | RFM Analysis | P0 | Calculate Recency, Frequency, Monetary scores |
| SEG-02 | K-Means Clustering | P0 | 4-6 distinct segments identified |
| SEG-03 | Segment Visualization | P0 | Interactive segment map with sizes |
| SEG-04 | Segment Profiles | P0 | Detailed stats for each segment |
| SEG-05 | Segment Naming | P1 | Auto-generated descriptive names |
| SEG-06 | Segment Export | P1 | CSV export of segment assignments |

**Technical Specifications:**

```yaml
Algorithm: K-Means Clustering
Features:
  - Recency: Days since last purchase
  - Frequency: Number of purchases
  - Monetary: Total spend
  
Segments (Default):
  - Champions: High R, High F, High M
  - Loyal Customers: High F, Medium M
  - Big Spenders: High M, Low F
  - At Risk: Low R, Previously High F
  - Value Seekers: Low M, High discount usage
  
Output Format:
  - segment_id: int
  - segment_name: string
  - customer_count: int
  - avg_rfm_scores: dict
  - characteristics: dict
```

---

#### 4.2.2 Product Affinity Network

**User Story:** As a merchandising manager, I want to see which products are bought together so I can create effective bundles.

**Requirements:**

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| AFF-01 | Co-purchase Analysis | P0 | Identify products bought together |
| AFF-02 | Association Rules | P0 | Calculate support, confidence, lift |
| AFF-03 | Network Visualization | P0 | Interactive affinity graph |
| AFF-04 | Category Affinity | P1 | Cross-category relationships |
| AFF-05 | Affinity Score | P0 | 0-100 strength indicator |
| AFF-06 | Bundle Recommendations | P1 | Suggested product bundles |

**Technical Specifications:**

```yaml
Algorithm: Apriori / FP-Growth
Metrics:
  - Support: Frequency of co-occurrence
  - Confidence: Conditional probability
  - Lift: Strength above random chance
  
Thresholds:
  - min_support: 0.05 (5% of transactions)
  - min_confidence: 0.3 (30% conditional)
  - min_lift: 1.5 (50% above random)
  
Output Format:
  - antecedent: string (product A)
  - consequent: string (product B)
  - support: float
  - confidence: float
  - lift: float
  - transactions: int
```

---

#### 4.2.3 Sentiment Analysis

**User Story:** As a product manager, I want to understand customer sentiment so I can improve products and experience.

**Requirements:**

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| SEN-01 | Rating Distribution | P0 | Show rating breakdown |
| SEN-02 | Sentiment Score | P0 | 0-100 overall sentiment |
| SEN-03 | Category Sentiment | P1 | Sentiment by category |
| SEN-04 | Keyword Extraction | P1 | Top positive/negative terms |
| SEN-05 | Trend Analysis | P2 | Sentiment over time |
| SEN-06 | Alert System | P2 | Flag negative sentiment spikes |

**Technical Specifications:**

```yaml
Methods:
  - Rating-based: Convert 1-5 stars to sentiment score
  - NLP-based: TextBlob/VADER for review text (future)
  
Sentiment Categories:
  - Positive: 70-100
  - Neutral: 40-69
  - Negative: 0-39
  
Output Format:
  - overall_score: float
  - distribution: dict (positive/neutral/negative counts)
  - by_category: dict
  - by_product: dict
  - top_keywords: list
  - trends: list (time series)
```

---

#### 4.2.4 Data-Driven Personas

**User Story:** As a marketing coordinator, I want ready-to-use customer personas so I can create targeted campaigns.

**Requirements:**

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| PER-01 | Auto-Generated Personas | P0 | Create personas from segments |
| PER-02 | Demographics | P0 | Age, gender, location breakdown |
| PER-03 | Behavior Metrics | P0 | Purchase patterns, preferences |
| PER-04 | Persona Cards | P0 | Visual persona representation |
| PER-05 | Export Personas | P1 | PDF/CSV export |
| PER-06 | Custom Naming | P2 | Allow manual persona names |

**Technical Specifications:**

```yaml
Persona Components:
  - Name: Auto-generated (e.g., "Budget-Conscious Brenda")
  - Avatar: Initials or icon
  - Description: 2-3 sentence summary
  - Demographics:
    - Age range
    - Gender split
    - Top locations
  - Behavior:
    - Avg order value
    - Purchase frequency
    - Preferred categories
    - Discount sensitivity
  - Preferences:
    - Payment method
    - Shipping type
    - Season preference
    
Output Format:
  - persona_id: int
  - name: string
  - description: string
  - demographics: dict
  - behavior: dict
  - preferences: dict
  - segment_id: int (linked to segmentation)
```

---

#### 4.2.5 Behavioral Recommendations

**User Story:** As a business owner, I want actionable recommendations so I know what actions to take.

**Requirements:**

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| REC-01 | Merchandising Recommendations | P0 | Product bundling suggestions |
| REC-02 | Marketing Recommendations | P0 | Segment-targeted campaign ideas |
| REC-03 | Pricing Recommendations | P1 | Price optimization suggestions |
| REC-04 | Inventory Recommendations | P1 | Stock level guidance |
| REC-05 | Priority Ranking | P0 | Recommendations ranked by impact |
| REC-06 | Implementation Timeline | P1 | 30/60/90 day action plan |

**Technical Specifications:**

```yaml
Recommendation Categories:
  - Merchandising:
    - Bundle opportunities (from affinity)
    - Cross-sell suggestions
    - Discontinuation candidates
  - Marketing:
    - Segment-specific campaigns
    - Win-back opportunities
    - Upsell targets
  - Pricing:
    - Price elasticity insights
    - Discount optimization
  - Inventory:
    - Fast-mover alerts
    - Slow-mover clearance
    
Output Format:
  - recommendation_id: string
  - category: string
  - title: string
  - description: string
  - expected_impact: string
  - priority: enum (High/Medium/Low)
  - timeline: enum (Immediate/30d/60d/90d)
  - data_support: dict (supporting metrics)
```

---

## 5. User Stories

### 5.1 Segmentation Stories

```
Story SEG-US-01:
As a Marketing Manager,
I want to see my customers grouped into distinct segments,
So that I can create targeted email campaigns for each group.

Acceptance Criteria:
✓ Segment visualization shows 4-6 distinct groups
✓ Each segment displays size (customer count) and value (total revenue)
✓ Clicking a segment shows detailed characteristics
✓ Can export segment member list for email targeting
```

```
Story SEG-US-02:
As a Business Owner,
I want to identify my most valuable customer segment,
So that I can focus retention efforts on high-value customers.

Acceptance Criteria:
✓ Segments ranked by total revenue
✓ "Champions" segment clearly identified
✓ Retention recommendations provided
✓ Churn risk alerts for valuable segments
```

### 5.2 Affinity Stories

```
Story AFF-US-01:
As a Merchandising Manager,
I want to see which products are frequently bought together,
So that I can create effective product bundles.

Acceptance Criteria:
✓ Affinity network graph shows product connections
✓ Connection thickness represents affinity strength
✓ Clicking a product shows its top 5 affinities
✓ Bundle suggestions with expected revenue lift
```

```
Story AFF-US-02:
As an E-commerce Manager,
I want to understand cross-category relationships,
So that I can optimize homepage merchandising.

Acceptance Criteria:
✓ Category-to-category affinity matrix
✓ Recommendations for homepage placement
✓ Cross-sell widget suggestions for product pages
```

### 5.3 Sentiment Stories

```
Story SEN-US-01:
As a Product Manager,
I want to see sentiment analysis for each product category,
So that I can identify products needing improvement.

Acceptance Criteria:
✓ Sentiment score (0-100) per category
✓ Distribution of positive/neutral/negative
✓ Trend showing sentiment change over time
✓ Alerts for categories with declining sentiment
```

```
Story SEN-US-02:
As a Customer Success Manager,
I want to extract key themes from customer feedback,
So that I can address common concerns.

Acceptance Criteria:
✓ Top positive keywords identified
✓ Top negative keywords identified
✓ Clicking a keyword shows related reviews
✓ Sentiment drivers summarized
```

### 5.4 Persona Stories

```
Story PER-US-01:
As a Marketing Coordinator,
I want ready-to-use customer personas,
So that I can quickly understand my target audiences.

Acceptance Criteria:
✓ 4-6 personas auto-generated from data
✓ Each persona has name, description, and stats
✓ Visual persona cards for presentations
✓ Downloadable persona report (PDF)
```

```
Story PER-US-02:
As a Content Creator,
I want to understand persona preferences,
So that I can create relevant content for each segment.

Acceptance Criteria:
✓ Preferred communication channels per persona
✓ Content topics of interest
✓ Best times to engage
✓ Tone and messaging recommendations
```

### 5.5 Recommendation Stories

```
Story REC-US-01:
As a Retail Store Owner,
I want prioritized action items,
So that I know what to focus on first.

Acceptance Criteria:
✓ Top 3 immediate actions highlighted
✓ Each recommendation shows expected impact
✓ Timeline provided (30/60/90 days)
✓ Progress tracking for implemented actions
```

```
Story REC-US-02:
As a Marketing Director,
I want campaign recommendations based on segments,
So that I can improve campaign ROI.

Acceptance Criteria:
✓ Segment-specific campaign ideas
✓ Expected conversion rates
✓ Channel recommendations
✓ Budget allocation suggestions
```

---

## 6. Technical Specifications

### 6.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────┤
│  SegmentsDashboard  AffinityNetwork  SentimentGauge        │
│  PersonasView       Recommendations  BehavioralInsights     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Flask)                            │
├─────────────────────────────────────────────────────────────┤
│  /api/behavior/segments    - Customer segmentation         │
│  /api/behavior/affinity    - Product affinity analysis     │
│  /api/behavior/sentiment   - Sentiment analysis            │
│  /api/behavior/personas    - Persona generation            │
│  /api/behavior/recommendations - Recommendations           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Data Processing
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 ANALYTICS ENGINE (Python)                    │
├─────────────────────────────────────────────────────────────┤
│  segmentation_service.py  - RFM + K-Means                   │
│  affinity_service.py      - Apriori/FP-Growth               │
│  sentiment_service.py     - NLP + Rating analysis           │
│  persona_service.py       - Persona generation              │
│  recommendation_service.py - Insight generation             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER (MongoDB)                       │
├─────────────────────────────────────────────────────────────┤
│  customers          - Customer profiles & segments          │
│  transactions       - Purchase history                      │
│  products           - Product catalog                       │
│  reviews            - Customer reviews & ratings            │
│  affinity_rules     - Pre-computed affinity rules           │
│  sentiment_scores   - Pre-computed sentiment data           │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 API Endpoints

#### Customer Segmentation

```yaml
GET /api/behavior/segments
  Response:
    success: boolean
    data:
      segments: [
        {
          segment_id: int,
          segment_name: string,
          customer_count: int,
          total_revenue: float,
          avg_order_value: float,
          characteristics: {
            avg_recency: float,
            avg_frequency: float,
            avg_monetary: float,
            top_categories: [string],
            preferred_payment: string
          }
        }
      ]
      visualization_data:
        labels: [string]
        values: [int]
        colors: [string]

POST /api/behavior/segments/compute
  Request:
    upload_id: string (optional)
    n_clusters: int (optional, default 4)
  Response:
    success: boolean
    data:
      job_id: string
      status: string (processing/completed/failed)
      segments_count: int

GET /api/behavior/segments/:segment_id/customers
  Response:
    success: boolean
    data:
      customers: [
        {
          customer_id: string,
          email: string,
          rfm_scores: dict,
          total_purchases: int,
          total_spend: float
        }
      ]
      pagination:
        page: int
        limit: int
        total: int
```

#### Product Affinity

```yaml
GET /api/behavior/affinity/network
  Response:
    success: boolean
    data:
      nodes: [
        {
          id: string (product_id),
          label: string (product_name),
          category: string,
          value: float (sales volume),
          color: string
        }
      ]
      links: [
        {
          source: string,
          target: string,
          strength: float (0-1),
          support: float,
          confidence: float,
          lift: float
        }
      ]

GET /api/behavior/affinity/rules
  Query Params:
    product_id: string (optional)
    min_lift: float (optional, default 1.5)
  Response:
    success: boolean
    data:
      rules: [
        {
          antecedent: string,
          consequent: string,
          support: float,
          confidence: float,
          lift: float,
          transactions: int
        }
      ]

GET /api/behavior/affinity/bundles
  Response:
    success: boolean
    data:
      suggested_bundles: [
        {
          bundle_name: string,
          products: [string],
          affinity_score: float,
          estimated_lift: float
        }
      ]
```

#### Sentiment Analysis

```yaml
GET /api/behavior/sentiment/overview
  Response:
    success: boolean
    data:
      overall_score: float (0-100)
      distribution:
        positive: int
        neutral: int
        negative: int
      average_rating: float
      total_reviews: int

GET /api/behavior/sentiment/by-category
  Response:
    success: boolean
    data:
      categories: [
        {
          category: string,
          sentiment_score: float,
          average_rating: float,
          review_count: int,
          trend: string (improving/stable/declining)
        }
      ]

GET /api/behavior/sentiment/keywords
  Response:
    success: boolean
    data:
      positive_keywords: [
        { word: string, count: int, sentiment: float }
      ]
      negative_keywords: [
        { word: string, count: int, sentiment: float }
      ]
```

#### Personas

```yaml
GET /api/behavior/personas
  Response:
    success: boolean
    data:
      personas: [
        {
          persona_id: int,
          name: string,
          role: string,
          description: string,
          avatar_initials: string,
          color: string,
          demographics: {
            age_range: string,
            gender_split: dict,
            top_locations: dict
          },
          behavior: {
            avg_order_value: float,
            purchase_frequency: string,
            preferred_categories: [string],
            discount_sensitivity: float
          },
          preferences: {
            preferred_payment: string,
            preferred_shipping: string,
            season_preference: dict
          },
          segment_id: int
        }
      ]

GET /api/behavior/personas/:persona_id/detail
  Response:
    success: boolean
    data:
      persona: { ... }
      sample_customers: [ ... ]
      marketing_recommendations: [ ... ]
```

#### Recommendations

```yaml
GET /api/behavior/recommendations
  Query Params:
    category: string (optional - filter by category)
    priority: string (optional - High/Medium/Low)
  Response:
    success: boolean
    data:
      recommendations: [
        {
          id: string,
          category: string,
          title: string,
          description: string,
          expected_impact: string,
          priority: string,
          timeline: string,
          data_support: dict,
          implementation_steps: [string]
        }
      ]
      summary:
        total: int
        high_priority: int
        medium_priority: int
        low_priority: int
```

### 6.3 Data Models

```python
# MongoDB Collections

# Customer Segments Collection
{
    "_id": ObjectId,
    "upload_id": string,
    "user_id": ObjectId,
    "segment_id": int,
    "segment_name": string,
    "customer_ids": [string],
    "characteristics": {
        "avg_recency": float,
        "avg_frequency": float,
        "avg_monetary": float,
        "size": int,
        "total_revenue": float
    },
    "created_at": datetime,
    "updated_at": datetime
}

# Affinity Rules Collection
{
    "_id": ObjectId,
    "upload_id": string,
    "user_id": ObjectId,
    "antecedent": string,
    "consequent": string,
    "support": float,
    "confidence": float,
    "lift": float,
    "transactions": int,
    "category_pair": [string, string],
    "created_at": datetime
}

# Sentiment Scores Collection
{
    "_id": ObjectId,
    "upload_id": string,
    "user_id": ObjectId,
    "product_id": string,
    "category": string,
    "sentiment_score": float,
    "average_rating": float,
    "positive_count": int,
    "neutral_count": int,
    "negative_count": int,
    "top_keywords": [string],
    "created_at": datetime
}

# Personas Collection
{
    "_id": ObjectId,
    "upload_id": string,
    "user_id": ObjectId,
    "persona_id": int,
    "name": string,
    "description": string,
    "demographics": dict,
    "behavior": dict,
    "preferences": dict,
    "segment_id": int,
    "color": string,
    "created_at": datetime
}

# Recommendations Collection
{
    "_id": ObjectId,
    "upload_id": string,
    "user_id": ObjectId,
    "category": string,
    "title": string,
    "description": string,
    "priority": string,
    "timeline": string,
    "data_support": dict,
    "implementation_steps": [string],
    "created_at": datetime
}
```

---

## 7. Data Requirements

### 7.1 Input Data Format

The system accepts the `shopping_trends.csv` dataset with the following structure:

```yaml
Required Columns:
  - Customer ID: Unique customer identifier (int)
  - Age: Customer age (int)
  - Gender: Customer gender (string: Male/Female/Other)
  - Item Purchased: Product name (string)
  - Category: Product category (string)
  - Purchase Amount (USD): Transaction value (float)
  - Location: Customer location (string)
  - Review Rating: Product rating (float, 1-5)
  - Subscription Status: Subscription flag (string)
  - Payment Method: Payment type (string)
  - Shipping Type: Shipping method (string)
  - Discount Applied: Discount type (string)
  - Promo Code Used: Promo flag (string: Yes/No)
  - Previous Purchases: Historical purchase count (int)
  - Preferred Payment Method: Payment preference (string)
  - Frequency of Purchases: Purchase frequency (string)

Optional Columns:
  - Size: Product size (string)
  - Color: Product color (string)
  - Season: Seasonal tag (string)
```

### 7.2 Data Transformation

```python
# Data mapping from shopping_trends.csv to internal format

INPUT COLUMN              → INTERNAL FIELD
────────────────────────────────────────────────────
Customer ID               → customer_id
Item Purchased            → product_name
Category                  → category
Purchase Amount (USD)     → price / revenue
Review Rating             → rating / sentiment_score
Age                       → customer_age
Gender                    → customer_gender
Location                  → customer_location
Payment Method            → payment_method
Discount Applied          → discount_type
Promo Code Used           → promo_used
Previous Purchases        → historical_purchases
Frequency of Purchases    → purchase_frequency
Subscription Status       → subscription_status
```

### 7.3 Data Quality Requirements

| Requirement | Description | Validation |
|-------------|-------------|------------|
| **Completeness** | No missing values in key columns | Customer ID, Item, Category, Amount required |
| **Validity** | Values within expected ranges | Rating 1-5, Amount > 0, Age 18-100 |
| **Consistency** | Standardized formats | Category names normalized |
| **Uniqueness** | No duplicate transactions | Transaction ID unique |
| **Timeliness** | Recent data preferred | Data within last 2 years |

### 7.4 Minimum Data Requirements

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| Transactions | 100 | 1,000+ |
| Unique Customers | 20 | 200+ |
| Unique Products | 10 | 50+ |
| Categories | 2 | 5+ |
| Date Range | 30 days | 1 year+ |

---

## 8. Success Metrics

### 8.1 Product Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Segmentation Accuracy** | >80% silhouette score | Clustering quality metric |
| **Affinity Rule Quality** | >1.5 average lift | Association rule strength |
| **Sentiment Accuracy** | >85% vs manual review | Comparison with human labeling |
| **Persona Usefulness** | >4/5 user rating | User feedback surveys |
| **Recommendation Adoption** | >60% implemented | Track implemented recommendations |

### 8.2 Business Impact Metrics

| Metric | Target Impact |
|--------|---------------|
| **Average Order Value** | +10-30% through bundling |
| **Email Campaign CTR** | +50% through segmentation |
| **Customer Retention** | +15% through targeted campaigns |
| **Cross-sell Conversion** | +20% through affinity recommendations |
| **Negative Review Response** | -25% through early detection |

### 8.3 User Adoption Metrics

| Metric | Target |
|--------|--------|
| **Feature Usage Rate** | >70% of active users |
| **Weekly Active Users** | >50% of registered users |
| **Report Exports** | >100/week |
| **NPS Score** | >50 |
| **Time to First Insight** | <5 minutes |

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

```
Week 1:
├── Data transformation layer
├── Customer segmentation service (RFM + K-Means)
├── Basic segmentation API endpoints
└── Segment visualization component

Week 2:
├── Affinity analysis service (Apriori)
├── Affinity API endpoints
├── Network graph visualization
└── Basic recommendation engine
```

### Phase 2: Advanced Features (Weeks 3-4)

```
Week 3:
├── Sentiment analysis service
├── Sentiment dashboard components
├── Persona generation service
└── Persona cards UI

Week 4:
├── Advanced recommendation engine
├── Behavioral insights dashboard
├── Export functionality
└── Integration testing
```

### Phase 3: Polish & Launch (Weeks 5-6)

```
Week 5:
├── UI/UX refinements
├── Performance optimization
├── Documentation completion
└── User acceptance testing

Week 6:
├── Bug fixes
├── Final testing
├── Staging deployment
└── Production launch
```

### Gantt Chart

```
Week:     1    2    3    4    5    6
          ├────├────├────├────├────┤
Segmentation  ██████████
Affinity           ██████████
Sentiment               ██████████
Personas                     ██████████
Recommendations                  ██████████
UI/UX    ████████████████████████████████
Testing                       ████████████
Launch                                  ████
```

---

## 10. Appendix

### 10.1 Glossary

| Term | Definition |
|------|------------|
| **RFM Analysis** | Recency, Frequency, Monetary - customer segmentation technique |
| **Market Basket Analysis** | Technique to find products frequently bought together |
| **Support** | Percentage of transactions containing both items |
| **Confidence** | Probability of buying B given A was bought |
| **Lift** | How much more likely A and B are bought together vs random |
| **Sentiment Score** | Numerical representation of sentiment (0-100) |
| **Persona** | Semi-fictional representation of ideal customer |

### 10.2 References

1. McKinsey: "The value of getting personalization right"
2. Gartner: "Market Guide for Personalization Software"
3. "Mining of Massive Datasets" - Market Basket Analysis chapter
4. TextBlob Documentation: https://textblob.readthedocs.io/
5. scikit-learn Clustering: https://scikit-learn.org/stable/modules/clustering.html
6. mlxtend Association Rules: http://rasbt.github.io/mlxtend/user_guide/frequent_patterns/

### 10.3 Related Documents

- [Main PRD](./PRD.md) - Core ShopSense AI product requirements
- [API Documentation](./docs/API.md) - API reference
- [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Development guidelines
- [Data Transformation Guide](./docs/DATA_TRANSFORMATION.md) - Data mapping details

---

*Document Version: 1.0.0*  
*Last Updated: February 27, 2026*  
*ShopSense AI Product Team*
