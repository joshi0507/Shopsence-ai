# 🛠️ Shopper Behavior Analytics - Implementation Guide

**Version:** 1.0.0  
**Last Updated:** February 27, 2026  
**Audience:** Developers, Data Engineers, Data Scientists

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Setup & Installation](#setup--installation)
3. [Data Transformation Layer](#data-transformation-layer)
4. [Customer Segmentation](#customer-segmentation)
5. [Product Affinity Analysis](#product-affinity-analysis)
6. [Sentiment Analysis](#sentiment-analysis)
7. [Persona Generation](#persona-generation)
8. [Recommendation Engine](#recommendation-engine)
9. [API Implementation](#api-implementation)
10. [Frontend Integration](#frontend-integration)
11. [Testing Guide](#testing-guide)
12. [Troubleshooting](#troubleshooting)

---

## 1. Architecture Overview

### 1.1 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Segments   │ │   Affinity   │ │   Sentiment  │            │
│  │   Dashboard  │ │   Network    │ │   Gauge      │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐                              │
│  │   Personas   │ │   Behavioral │                              │
│  │   Cards      │ │   Insights   │                              │
│  └──────────────┘ └──────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Flask API Routes (routes/behavior.py)        │  │
│  │  GET  /api/behavior/segments                              │  │
│  │  GET  /api/behavior/affinity/network                      │  │
│  │  GET  /api/behavior/sentiment/overview                    │  │
│  │  GET  /api/behavior/personas                              │  │
│  │  GET  /api/behavior/recommendations                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Service Layer Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BUSINESS LOGIC LAYER                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Segmentation │ │   Affinity   │ │  Sentiment   │            │
│  │   Service    │ │   Service    │ │   Service    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐                              │
│  │   Persona    │ │ Recommendation│                              │
│  │   Service    │ │   Service    │                              │
│  └──────────────┘ └──────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Data Access
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   MongoDB Collections                     │  │
│  │  • customers        • affinity_rules                     │  │
│  │  • transactions     • sentiment_scores                   │  │
│  │  • products         • personas                           │  │
│  │  • segments         • recommendations                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
1. User uploads shopping_trends.csv
         │
         ▼
2. Data transformation (map columns to internal format)
         │
         ▼
3. Store in MongoDB (customers, transactions, products)
         │
         ▼
4. Trigger analytics pipeline:
   ├── Segmentation (RFM + K-Means)
   ├── Affinity (Apriori algorithm)
   ├── Sentiment (Rating analysis)
   └── Persona generation
         │
         ▼
5. Store results in MongoDB
         │
         ▼
6. Frontend queries API and displays visualizations
```

---

## 2. Setup & Installation

### 2.1 Prerequisites

```bash
# Python version
Python 3.11+

# Required packages (add to requirements.txt)
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
mlxtend>=0.23.0        # For Apriori algorithm
textblob>=0.17.0       # For sentiment analysis (future)
pymongo>=4.5.0
flask>=3.0.0
```

### 2.2 Installation Steps

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install new dependencies
pip install scikit-learn mlxtend textblob

# 3. Download TextBlob corpora (for future NLP features)
python -m textblob.download_corpora

# 4. Verify installation
python -c "from sklearn.cluster import KMeans; print('✓ scikit-learn OK')"
python -c "from mlxtend.frequent_patterns import apriori; print('✓ mlxtend OK')"
```

### 2.3 Project Structure

```
backend/
├── routes/
│   └── behavior.py              # NEW: API routes for behavior analytics
├── services/
│   ├── segmentation_service.py  # NEW: Customer segmentation
│   ├── affinity_service.py      # NEW: Product affinity
│   ├── sentiment_service.py     # NEW: Sentiment analysis
│   ├── persona_service.py       # NEW: Persona generation
│   └── recommendation_service.py # NEW: Recommendations
├── models/
│   ├── customer_segment.py      # NEW: Segment model
│   ├── affinity_rule.py         # NEW: Affinity rules model
│   └── sentiment_score.py       # NEW: Sentiment scores model
├── utils/
│   └── data_mapper.py           # NEW: Data transformation
└── tests/
    ├── test_segmentation.py     # NEW
    ├── test_affinity.py         # NEW
    ├── test_sentiment.py        # NEW
    └── test_personas.py         # NEW
```

---

## 3. Data Transformation Layer

### 3.1 Implementation: `utils/data_mapper.py`

```python
# -*- coding: utf-8 -*-
"""
Data Mapper - Transform shopping_trends.csv to internal format

This module handles the transformation of the shopping_trends dataset
to the internal data format used by ShopSense AI.
"""

import pandas as pd
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class DataMapper:
    """Transform external data formats to internal schema"""
    
    def __init__(self):
        """Initialize data mapper"""
        pass
    
    def transform_shopping_trends(
        self, 
        df: pd.DataFrame,
        user_id: str,
        upload_id: str
    ) -> Dict[str, pd.DataFrame]:
        """
        Transform shopping_trends.csv to internal format
        
        Args:
            df: Raw DataFrame from shopping_trends.csv
            user_id: User ObjectId
            upload_id: Upload session ID
            
        Returns:
            dict: Transformed DataFrames for each collection
        """
        logger.info(f"Transforming shopping_trends data: {len(df)} rows")
        
        # Validate required columns
        required_columns = [
            'Customer ID', 'Item Purchased', 'Category',
            'Purchase Amount (USD)', 'Review Rating'
        ]
        missing = [col for col in required_columns if col not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")
        
        # Create synthetic date if not present
        if 'date' not in df.columns:
            df['date'] = pd.date_range(
                start='2025-01-01',
                periods=len(df),
                freq='h'
            )
        
        # Transform transactions
        transactions_df = self._transform_transactions(
            df, user_id, upload_id
        )
        
        # Transform customers
        customers_df = self._transform_customers(
            df, user_id, upload_id
        )
        
        # Transform products
        products_df = self._transform_products(
            df, user_id, upload_id
        )
        
        logger.info(
            f"Transformation complete: "
            f"{len(transactions_df)} transactions, "
            f"{len(customers_df)} customers, "
            f"{len(products_df)} products"
        )
        
        return {
            'transactions': transactions_df,
            'customers': customers_df,
            'products': products_df
        }
    
    def _transform_transactions(
        self, 
        df: pd.DataFrame,
        user_id: str,
        upload_id: str
    ) -> pd.DataFrame:
        """Transform to transactions collection format"""
        transactions = pd.DataFrame()
        
        # Map columns
        transactions['user_id'] = user_id
        transactions['upload_id'] = upload_id
        transactions['customer_id'] = df['Customer ID'].astype(str)
        transactions['product_id'] = df['Item Purchased'].apply(
            lambda x: x.lower().replace(' ', '_')
        )
        transactions['product_name'] = df['Item Purchased']
        transactions['category'] = df['Category']
        transactions['date'] = df['date']
        transactions['quantity'] = 1  # Each row = 1 unit
        transactions['price'] = df['Purchase Amount (USD)']
        transactions['revenue'] = df['Purchase Amount (USD)']
        transactions['rating'] = df['Review Rating']
        
        # Additional fields
        transactions['payment_method'] = df.get('Payment Method', 'Unknown')
        transactions['shipping_type'] = df.get('Shipping Type', 'Standard')
        transactions['discount_applied'] = df.get('Discount Applied', 'None')
        transactions['promo_used'] = df.get('Promo Code Used', 'No')
        
        return transactions
    
    def _transform_customers(
        self,
        df: pd.DataFrame,
        user_id: str,
        upload_id: str
    ) -> pd.DataFrame:
        """Transform to customers collection format"""
        # Aggregate by customer
        customers = df.groupby('Customer ID').agg({
            'Age': 'first',
            'Gender': 'first',
            'Location': 'first',
            'Purchase Amount (USD)': 'sum',
            'Customer ID': 'count',
            'Review Rating': 'mean',
            'Previous Purchases': 'first',
            'Preferred Payment Method': 'first',
            'Frequency of Purchases': 'first',
            'Subscription Status': 'first'
        }).reset_index()
        
        customers.columns = [
            'customer_id', 'age', 'gender', 'location',
            'total_spend', 'purchase_count', 'avg_rating',
            'historical_purchases', 'preferred_payment',
            'purchase_frequency', 'subscription_status'
        ]
        
        customers['user_id'] = user_id
        customers['upload_id'] = upload_id
        
        return customers
    
    def _transform_products(
        self,
        df: pd.DataFrame,
        user_id: str,
        upload_id: str
    ) -> pd.DataFrame:
        """Transform to products collection format"""
        # Aggregate by product
        products = df.groupby('Item Purchased').agg({
            'Category': 'first',
            'Purchase Amount (USD)': 'mean',
            'Customer ID': 'count',
            'Review Rating': ['mean', 'count']
        }).reset_index()
        
        products.columns = [
            'product_name', 'category', 'avg_price',
            'units_sold', 'avg_rating', 'rating_count'
        ]
        
        products['user_id'] = user_id
        products['upload_id'] = upload_id
        products['product_id'] = products['product_name'].apply(
            lambda x: x.lower().replace(' ', '_')
        )
        
        return products
```

### 3.2 Usage Example

```python
# In upload route handler
from utils.data_mapper import DataMapper

mapper = DataMapper()

# Read uploaded CSV
df = pd.read_csv(uploaded_file)

# Transform
transformed_data = mapper.transform_shopping_trends(
    df,
    user_id=current_user_id,
    upload_id=upload_session_id
)

# Store in MongoDB
db['transactions'].insert_many(
    transformed_data['transactions'].to_dict('records')
)
db['customers'].insert_many(
    transformed_data['customers'].to_dict('records')
)
db['products'].insert_many(
    transformed_data['products'].to_dict('records')
)
```

---

## 4. Customer Segmentation

### 4.1 Implementation: `services/segmentation_service.py`

```python
# -*- coding: utf-8 -*-
"""
Customer Segmentation Service - RFM Analysis + K-Means Clustering

This module implements customer segmentation using:
1. RFM (Recency, Frequency, Monetary) analysis
2. K-Means clustering for segment discovery
3. Segment profiling and naming
"""

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class SegmentationService:
    """Customer segmentation using RFM and clustering"""
    
    # Segment names based on characteristics
    SEGMENT_NAMES = {
        'champions': 'Champions',
        'loyal': 'Loyal Customers',
        'big_spender': 'Big Spenders',
        'at_risk': 'At Risk',
        'value_seeker': 'Value Seekers',
        'new': 'New Customers',
        'promising': 'Promising',
        'lost': 'Lost Customers'
    }
    
    def __init__(self):
        """Initialize segmentation service"""
        self.scaler = StandardScaler()
    
    def compute_rfm_scores(
        self,
        transactions_df: pd.DataFrame,
        reference_date: datetime = None
    ) -> pd.DataFrame:
        """
        Calculate RFM scores for each customer
        
        Args:
            transactions_df: Transactions DataFrame
            reference_date: Date for recency calculation (default: today)
            
        Returns:
            DataFrame with RFM scores per customer
        """
        if reference_date is None:
            reference_date = datetime.now()
        
        # Aggregate by customer
        rfm = transactions_df.groupby('customer_id').agg({
            'date': lambda x: (reference_date - x.max()).days,
            'customer_id': 'count',
            'revenue': 'sum'
        }).reset_index()
        
        rfm.columns = ['customer_id', 'recency', 'frequency', 'monetary']
        
        # Calculate RFM quintile scores (1-5)
        rfm['r_score'] = pd.qcut(rfm['recency'], 5, labels=[5, 4, 3, 2, 1])
        rfm['f_score'] = pd.qcut(rfm['frequency'].rank(method='first'), 5, 
                                  labels=[1, 2, 3, 4, 5])
        rfm['m_score'] = pd.qcut(rfm['monetary'], 5, labels=[1, 2, 3, 4, 5])
        
        # Convert to numeric
        rfm['r_score'] = rfm['r_score'].astype(int)
        rfm['f_score'] = rfm['f_score'].astype(int)
        rfm['m_score'] = rfm['m_score'].astype(int)
        
        # Calculate combined RFM score
        rfm['rfm_score'] = (
            rfm['r_score'] * 100 + 
            rfm['f_score'] * 10 + 
            rfm['m_score']
        )
        
        logger.info(f"Computed RFM scores for {len(rfm)} customers")
        return rfm
    
    def segment_customers(
        self,
        rfm_df: pd.DataFrame,
        n_clusters: int = 4
    ) -> Tuple[pd.DataFrame, Dict[int, str]]:
        """
        Segment customers using K-Means clustering
        
        Args:
            rfm_df: DataFrame with RFM scores
            n_clusters: Number of segments to create
            
        Returns:
            Tuple of (DataFrame with segments, segment name mapping)
        """
        # Prepare features
        features = rfm_df[['recency', 'frequency', 'monetary']].copy()
        
        # Scale features
        scaled_features = self.scaler.fit_transform(features)
        
        # Apply K-Means
        kmeans = KMeans(
            n_clusters=n_clusters,
            random_state=42,
            n_init=10
        )
        rfm_df['segment_id'] = kmeans.fit_predict(scaled_features)
        
        # Profile segments and assign names
        segment_mapping = self._profile_segments(rfm_df)
        
        logger.info(
            f"Created {n_clusters} segments: {segment_mapping}"
        )
        
        return rfm_df, segment_mapping
    
    def _profile_segments(
        self,
        rfm_df: pd.DataFrame
    ) -> Dict[int, str]:
        """
        Analyze segments and assign descriptive names
        
        Args:
            rfm_df: DataFrame with segment assignments
            
        Returns:
            Dict mapping segment_id to segment_name
        """
        segment_mapping = {}
        
        # Calculate segment characteristics
        segment_stats = rfm_df.groupby('segment_id').agg({
            'recency': 'mean',
            'frequency': 'mean',
            'monetary': 'mean',
            'rfm_score': 'mean'
        }).reset_index()
        
        for _, row in segment_stats.iterrows():
            segment_id = int(row['segment_id'])
            
            # Determine segment type based on characteristics
            if (row['frequency'] > segment_stats['frequency'].median() and
                row['monetary'] > segment_stats['monetary'].median() and
                row['recency'] < segment_stats['recency'].median()):
                name = self.SEGMENT_NAMES['champions']
            elif (row['frequency'] > segment_stats['frequency'].median() and
                  row['monetary'] <= segment_stats['monetary'].median()):
                name = self.SEGMENT_NAMES['loyal']
            elif (row['monetary'] > segment_stats['monetary'].quantile(0.75)):
                name = self.SEGMENT_NAMES['big_spender']
            elif (row['recency'] > segment_stats['recency'].quantile(0.75)):
                name = self.SEGMENT_NAMES['at_risk']
            elif (row['recency'] < segment_stats['recency'].median() and
                  row['frequency'] < segment_stats['frequency'].median()):
                name = self.SEGMENT_NAMES['value_seeker']
            elif (row['recency'] < 30):
                name = self.SEGMENT_NAMES['new']
            else:
                name = f"Segment {segment_id}"
            
            segment_mapping[segment_id] = name
        
        return segment_mapping
    
    def get_segment_summary(
        self,
        rfm_df: pd.DataFrame,
        segment_mapping: Dict[int, str]
    ) -> List[Dict[str, Any]]:
        """
        Generate summary statistics for each segment
        
        Args:
            rfm_df: DataFrame with segment assignments
            segment_mapping: Segment name mapping
            
        Returns:
            List of segment summary dictionaries
        """
        summaries = []
        
        for segment_id, segment_name in segment_mapping.items():
            segment_data = rfm_df[rfm_df['segment_id'] == segment_id]
            
            summary = {
                'segment_id': segment_id,
                'segment_name': segment_name,
                'customer_count': len(segment_data),
                'total_revenue': float(segment_data['monetary'].sum()),
                'avg_order_value': float(
                    segment_data['monetary'].mean() / 
                    segment_data['frequency'].mean()
                ) if segment_data['frequency'].mean() > 0 else 0,
                'characteristics': {
                    'avg_recency': float(segment_data['recency'].mean()),
                    'avg_frequency': float(segment_data['frequency'].mean()),
                    'avg_monetary': float(segment_data['monetary'].mean()),
                    'avg_rfm_score': float(segment_data['rfm_score'].mean())
                }
            }
            
            summaries.append(summary)
        
        # Sort by revenue
        summaries.sort(key=lambda x: x['total_revenue'], reverse=True)
        
        return summaries
```

### 4.2 Usage Example

```python
# In API route
from services.segmentation_service import SegmentationService

service = SegmentationService()

# Get transactions from MongoDB
transactions = get_transactions(user_id, upload_id)

# Compute RFM scores
rfm_df = service.compute_rfm_scores(transactions)

# Segment customers
segmented_df, segment_mapping = service.segment_customers(
    rfm_df, 
    n_clusters=4
)

# Get summaries
summaries = service.get_segment_summary(
    segmented_df, 
    segment_mapping
)

return jsonify({
    'success': True,
    'data': {
        'segments': summaries,
        'segment_mapping': segment_mapping
    }
})
```

---

## 5. Product Affinity Analysis

### 5.1 Implementation: `services/affinity_service.py`

```python
# -*- coding: utf-8 -*-
"""
Product Affinity Service - Market Basket Analysis

This module implements product affinity analysis using:
1. Apriori algorithm for frequent itemset mining
2. Association rules for product relationships
3. Affinity network generation
"""

import pandas as pd
import numpy as np
from mlxtend.frequent_patterns import apriori, association_rules
from typing import Dict, Any, List, Tuple
import logging

logger = logging.getLogger(__name__)


class AffinityService:
    """Product affinity and market basket analysis"""
    
    def __init__(self):
        """Initialize affinity service"""
        pass
    
    def create_basket_matrix(
        self,
        transactions_df: pd.DataFrame,
        level: str = 'product'
    ) -> pd.DataFrame:
        """
        Create binary basket matrix for Apriori
        
        Args:
            transactions_df: Transactions DataFrame
            level: 'product' or 'category'
            
        Returns:
            Binary basket matrix (customers x items)
        """
        if level == 'product':
            # Group by customer and product
            basket = transactions_df.groupby(
                ['customer_id', 'product_name']
            ).size().unstack(fill_value=0)
        else:  # category
            basket = transactions_df.groupby(
                ['customer_id', 'category']
            ).size().unstack(fill_value=0)
        
        # Convert to binary (1 if purchased, 0 otherwise)
        basket_binary = basket.applymap(lambda x: 1 if x > 0 else 0)
        
        logger.info(
            f"Created basket matrix: {basket_binary.shape[0]} customers x "
            f"{basket_binary.shape[1]} items"
        )
        
        return basket_binary
    
    def find_frequent_itemsets(
        self,
        basket_df: pd.DataFrame,
        min_support: float = 0.05
    ) -> pd.DataFrame:
        """
        Find frequent itemsets using Apriori
        
        Args:
            basket_df: Binary basket matrix
            min_support: Minimum support threshold
            
        Returns:
            DataFrame of frequent itemsets
        """
        frequent_itemsets = apriori(
            basket_df,
            min_support=min_support,
            use_colnames=True,
            max_len=2  # Only pairs for simplicity
        )
        
        logger.info(
            f"Found {len(frequent_itemsets)} frequent itemsets "
            f"(min_support={min_support})"
        )
        
        return frequent_itemsets
    
    def generate_association_rules(
        self,
        frequent_itemsets: pd.DataFrame,
        min_confidence: float = 0.3,
        min_lift: float = 1.5
    ) -> pd.DataFrame:
        """
        Generate association rules
        
        Args:
            frequent_itemsets: Frequent itemsets from Apriori
            min_confidence: Minimum confidence threshold
            min_lift: Minimum lift threshold
            
        Returns:
            DataFrame of association rules
        """
        rules = association_rules(
            frequent_itemsets,
            metric="confidence",
            min_threshold=min_confidence
        )
        
        # Filter by lift
        rules = rules[rules['lift'] >= min_lift]
        
        # Sort by lift
        rules = rules.sort_values('lift', ascending=False)
        
        logger.info(
            f"Generated {len(rules)} association rules "
            f"(min_lift={min_lift})"
        )
        
        return rules
    
    def build_affinity_network(
        self,
        rules_df: pd.DataFrame,
        transactions_df: pd.DataFrame,
        top_n: int = 50
    ) -> Dict[str, Any]:
        """
        Build affinity network for visualization
        
        Args:
            rules_df: Association rules DataFrame
            transactions_df: Transactions for product stats
            top_n: Number of top rules to include
            
        Returns:
            Network data (nodes and links)
        """
        # Get top rules
        top_rules = rules_df.head(top_n)
        
        # Build nodes
        products = set()
        for _, rule in top_rules.iterrows():
            products.add(str(rule['antecedents']))
            products.add(str(rule['consequents']))
        
        # Calculate product stats
        product_stats = transactions_df.groupby('product_name').agg({
            'revenue': 'sum',
            'customer_id': 'count'
        }).reset_index()
        product_stats.columns = ['product', 'revenue', 'transactions']
        
        # Create nodes
        nodes = []
        for i, product in enumerate(products):
            # Clean product name
            product_clean = product.replace("frozenset({'", "").replace("'})", "")
            
            stats = product_stats[
                product_stats['product'] == product_clean
            ]
            
            nodes.append({
                'id': product_clean,
                'label': product_clean,
                'category': 'product',
                'value': float(stats['transactions'].iloc[0]) if len(stats) > 0 else 1,
                'color': self._get_color_for_value(
                    float(stats['revenue'].iloc[0]) if len(stats) > 0 else 0,
                    product_stats['revenue']
                )
            })
        
        # Create links
        links = []
        for _, rule in top_rules.iterrows():
            antecedent = str(rule['antecedents']).replace(
                "frozenset({'", ""
            ).replace("'})", "")
            consequent = str(rule['consequents']).replace(
                "frozenset({'", ""
            ).replace("'})", "")
            
            links.append({
                'source': antecedent,
                'target': consequent,
                'strength': float(rule['lift']) / 5,  # Normalize
                'support': float(rule['support']),
                'confidence': float(rule['confidence']),
                'lift': float(rule['lift'])
            })
        
        return {
            'nodes': nodes,
            'links': links
        }
    
    def _get_color_for_value(
        self,
        value: float,
        series: pd.Series
    ) -> str:
        """Get color based on value percentile"""
        percentile = (series < value).mean()
        
        if percentile > 0.75:
            return '#00F0FF'  # Cyan - high value
        elif percentile > 0.5:
            return '#7000FF'  # Purple - medium
        else:
            return '#FF00AA'  # Pink - low
    
    def suggest_bundles(
        self,
        rules_df: pd.DataFrame,
        min_lift: float = 2.0
    ) -> List[Dict[str, Any]]:
        """
        Suggest product bundles based on affinity
        
        Args:
            rules_df: Association rules
            min_lift: Minimum lift for bundle consideration
            
        Returns:
            List of bundle suggestions
        """
        bundles = []
        
        high_lift_rules = rules_df[rules_df['lift'] >= min_lift]
        
        for _, rule in high_lift_rules.iterrows():
            antecedent = str(rule['antecedents']).replace(
                "frozenset({'", ""
            ).replace("'})", "")
            consequent = str(rule['consequents']).replace(
                "frozenset({'", ""
            ).replace("'})", "")
            
            bundles.append({
                'bundle_name': f"{antecedent} + {consequent}",
                'products': [antecedent, consequent],
                'affinity_score': float(rule['lift']),
                'confidence': float(rule['confidence']),
                'estimated_lift': f"{(float(rule['lift']) - 1) * 100:.0f}%"
            })
        
        return bundles[:10]  # Top 10 bundles
```

---

## 6. Sentiment Analysis

### 6.1 Implementation: `services/sentiment_service.py`

```python
# -*- coding: utf-8 -*-
"""
Sentiment Analysis Service - Review & Rating Analysis

This module implements sentiment analysis using:
1. Rating-based sentiment scoring
2. Distribution analysis
3. Category-level sentiment breakdown
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class SentimentService:
    """Sentiment analysis for reviews and ratings"""
    
    # Sentiment thresholds
    POSITIVE_THRESHOLD = 4.0  # Ratings >= 4 are positive
    NEGATIVE_THRESHOLD = 3.0  # Ratings < 3 are negative
    
    def __init__(self):
        """Initialize sentiment service"""
        pass
    
    def calculate_sentiment_scores(
        self,
        transactions_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Calculate sentiment scores from ratings
        
        Args:
            transactions_df: Transactions with ratings
            
        Returns:
            DataFrame with sentiment scores
        """
        sentiment_df = transactions_df.copy()
        
        # Convert 1-5 rating to 0-100 sentiment score
        sentiment_df['sentiment_score'] = (
            (sentiment_df['rating'] - 1) / 4 * 100
        )
        
        # Categorize sentiment
        sentiment_df['sentiment_label'] = sentiment_df['rating'].apply(
            lambda x: 'Positive' if x >= self.POSITIVE_THRESHOLD 
            else ('Neutral' if x >= self.NEGATIVE_THRESHOLD 
            else 'Negative')
        )
        
        logger.info(
            f"Calculated sentiment for {len(sentiment_df)} reviews"
        )
        
        return sentiment_df
    
    def get_overview(
        self,
        sentiment_df: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Get overall sentiment summary
        
        Args:
            sentiment_df: DataFrame with sentiment scores
            
        Returns:
            Sentiment overview dictionary
        """
        distribution = sentiment_df['sentiment_label'].value_counts().to_dict()
        
        return {
            'overall_score': float(sentiment_df['sentiment_score'].mean()),
            'average_rating': float(sentiment_df['rating'].mean()),
            'total_reviews': len(sentiment_df),
            'distribution': {
                'positive': distribution.get('Positive', 0),
                'neutral': distribution.get('Neutral', 0),
                'negative': distribution.get('Negative', 0)
            },
            'percentages': {
                'positive': distribution.get('Positive', 0) / len(sentiment_df) * 100,
                'neutral': distribution.get('Neutral', 0) / len(sentiment_df) * 100,
                'negative': distribution.get('Negative', 0) / len(sentiment_df) * 100
            }
        }
    
    def get_by_category(
        self,
        sentiment_df: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        """
        Get sentiment breakdown by category
        
        Args:
            sentiment_df: DataFrame with sentiment scores
            
        Returns:
            List of category sentiment summaries
        """
        category_sentiment = sentiment_df.groupby('category').agg({
            'sentiment_score': 'mean',
            'rating': ['mean', 'count'],
            'sentiment_label': lambda x: x.value_counts().idxmax()
        }).reset_index()
        
        category_sentiment.columns = [
            'category', 'sentiment_score', 'avg_rating', 
            'review_count', 'dominant_sentiment'
        ]
        
        # Determine trend (simplified - would need historical data)
        category_sentiment['trend'] = 'stable'
        
        return category_sentiment.to_dict('records')
    
    def get_by_product(
        self,
        sentiment_df: pd.DataFrame,
        top_n: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get sentiment by product
        
        Args:
            sentiment_df: DataFrame with sentiment scores
            top_n: Number of products to return
            
        Returns:
            List of product sentiment summaries
        """
        product_sentiment = sentiment_df.groupby('product_name').agg({
            'sentiment_score': 'mean',
            'rating': ['mean', 'count'],
            'customer_id': 'count'
        }).reset_index()
        
        product_sentiment.columns = [
            'product_name', 'sentiment_score', 'avg_rating', 
            'review_count', 'purchase_count'
        ]
        
        # Sort by review count
        product_sentiment = product_sentiment.sort_values(
            'review_count', ascending=False
        ).head(top_n)
        
        return product_sentiment.to_dict('records')
```

---

## 7. Persona Generation

### 7.1 Implementation: `services/persona_service.py`

```python
# -*- coding: utf-8 -*-
"""
Persona Service - Data-Driven Customer Persona Generation

This module generates customer personas from segmentation data.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class PersonaService:
    """Generate customer personas from data"""
    
    # Persona name templates
    NAME_TEMPLATES = {
        'Champions': ['Premium Patricia', 'Loyal Larry', 'Elite Emma'],
        'Loyal Customers': ['Regular Rachel', 'Faithful Fred', 'Steady Steve'],
        'Big Spenders': ['Luxury Linda', 'Premium Paul', 'Whale William'],
        'At Risk': ['Fading Frank', 'Slipping Susan', 'Departing Dan'],
        'Value Seekers': ['Budget Betty', 'Thrifty Tom', 'Saver Sam'],
        'New Customers': ['Newbie Nancy', 'Fresh Fred', 'Rookie Rick']
    }
    
    def __init__(self):
        """Initialize persona service"""
        pass
    
    def generate_personas(
        self,
        segmented_customers: pd.DataFrame,
        segment_mapping: Dict[int, str],
        original_df: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        """
        Generate personas from segmented customer data
        
        Args:
            segmented_customers: DataFrame with segment assignments
            segment_mapping: Segment name mapping
            original_df: Original customer data with demographics
            
        Returns:
            List of persona dictionaries
        """
        personas = []
        
        for segment_id, segment_name in segment_mapping.items():
            segment_customers = segmented_customers[
                segmented_customers['segment_id'] == segment_id
            ]
            
            # Get customer IDs in this segment
            customer_ids = segment_customers['customer_id'].tolist()
            
            # Get demographic data
            demo_data = original_df[
                original_df['Customer ID'].isin(customer_ids)
            ]
            
            # Generate persona
            persona = self._create_persona(
                segment_id=segment_id,
                segment_name=segment_name,
                demo_data=demo_data,
                rfm_data=segment_customers
            )
            
            personas.append(persona)
        
        return personas
    
    def _create_persona(
        self,
        segment_id: int,
        segment_name: str,
        demo_data: pd.DataFrame,
        rfm_data: pd.DataFrame
    ) -> Dict[str, Any]:
        """Create a single persona"""
        
        # Generate name
        names = self.NAME_TEMPLATES.get(
            segment_name, 
            ['Customer Chris', 'Shopper Sharon']
        )
        name = np.random.choice(names)
        
        # Calculate demographics
        avg_age = demo_data['Age'].mean() if 'Age' in demo_data.columns else 35
        gender_split = demo_data['Gender'].value_counts().to_dict()
        top_locations = demo_data['Location'].value_counts().head(3).to_dict()
        
        # Calculate behavior
        avg_order_value = rfm_data['monetary'].mean() / rfm_data['frequency'].mean()
        
        # Get preferences from original data
        preferred_payment = demo_data.get(
            'Preferred Payment Method', 
            pd.Series(['Unknown'])
        ).mode().iloc[0] if len(demo_data) > 0 else 'Unknown'
        
        purchase_frequency = demo_data.get(
            'Frequency of Purchases',
            pd.Series(['Monthly'])
        ).mode().iloc[0] if len(demo_data) > 0 else 'Monthly'
        
        # Generate description
        description = self._generate_description(
            segment_name, avg_age, avg_order_value
        )
        
        return {
            'persona_id': segment_id,
            'name': name,
            'role': segment_name,
            'avatar_initials': ''.join([n[0] for n in name.split()[:2]]),
            'description': description,
            'color': self._get_color_for_segment(segment_id),
            'demographics': {
                'age_range': f"{int(avg_age - 5)}-{int(avg_age + 5)}",
                'gender_split': gender_split,
                'top_locations': top_locations
            },
            'behavior': {
                'avg_order_value': float(avg_order_value),
                'purchase_frequency': purchase_frequency,
                'total_customers': len(rfm_data),
                'total_revenue': float(rfm_data['monetary'].sum())
            },
            'preferences': {
                'preferred_payment': preferred_payment,
                'preferred_shipping': demo_data['Shipping Type'].mode().iloc[0] 
                    if 'Shipping Type' in demo_data.columns and len(demo_data) > 0 
                    else 'Standard',
                'discount_sensitivity': float(
                    len(demo_data[demo_data['Discount Applied'] != 'None']) / 
                    len(demo_data)
                ) if len(demo_data) > 0 else 0.5
            },
            'segment_id': segment_id
        }
    
    def _generate_description(
        self,
        segment_name: str,
        avg_age: float,
        avg_order_value: float
    ) -> str:
        """Generate persona description"""
        
        descriptions = {
            'Champions': (
                f"Your best customers, typically aged {int(avg_age)}. "
                f"They spend an average of ${avg_order_value:.2f} per order "
                "and purchase frequently. They're highly engaged and loyal."
            ),
            'Loyal Customers': (
                f"Consistent buyers aged {int(avg_age)} who value your brand. "
                f"They spend ${avg_order_value:.2f} on average and return regularly. "
                "Great candidates for loyalty programs."
            ),
            'Big Spenders': (
                f"High-value customers with an average order of ${avg_order_value:.2f}. "
                "They may not purchase frequently but spend significantly when they do. "
                "Focus on premium offerings."
            ),
            'At Risk': (
                f"Previously active customers (avg age {int(avg_age)}) who haven't "
                "purchased recently. They used to spend ${avg_order_value:.2f} on average. "
                "Need re-engagement campaigns."
            ),
            'Value Seekers': (
                f"Budget-conscious shoppers aged {int(avg_age)} looking for deals. "
                f"Average spend is ${avg_order_value:.2f}. "
                "Respond well to discounts and promotions."
            ),
            'New Customers': (
                f"Recent acquisitions, typically aged {int(avg_age)}. "
                f"First purchase averaged ${avg_order_value:.2f}. "
                "Focus on onboarding and second-purchase conversion."
            )
        }
        
        return descriptions.get(
            segment_name,
            f"Customer segment with average age {int(avg_age)} and "
            f"order value ${avg_order_value:.2f}."
        )
    
    def _get_color_for_segment(self, segment_id: int) -> str:
        """Get color for persona visualization"""
        colors = [
            '#00F0FF',  # Cyan
            '#7000FF',  # Purple
            '#FF00AA',  # Pink
            '#0066FF',  # Blue
            '#00FF88',  # Green
            '#FFD700'   # Gold
        ]
        return colors[segment_id % len(colors)]
```

---

## 8. Recommendation Engine

### 8.1 Implementation: `services/recommendation_service.py`

```python
# -*- coding: utf-8 -*-
"""
Recommendation Service - Behavioral Insights & Recommendations

This module generates actionable recommendations based on 
segmentation, affinity, and sentiment analysis.
"""

from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class RecommendationService:
    """Generate behavioral recommendations"""
    
    def __init__(self):
        """Initialize recommendation service"""
        pass
    
    def generate_recommendations(
        self,
        segments: List[Dict[str, Any]],
        affinity_rules: List[Dict[str, Any]],
        sentiment_data: Dict[str, Any],
        bundles: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Generate comprehensive recommendations
        
        Args:
            segments: Customer segment summaries
            affinity_rules: Product affinity rules
            sentiment_data: Sentiment analysis results
            bundles: Suggested product bundles
            
        Returns:
            List of recommendation dictionaries
        """
        recommendations = []
        
        # Generate merchandising recommendations
        recommendations.extend(
            self._generate_merchandising_recommendations(
                affinity_rules, bundles
            )
        )
        
        # Generate marketing recommendations
        recommendations.extend(
            self._generate_marketing_recommendations(segments)
        )
        
        # Generate sentiment-based recommendations
        recommendations.extend(
            self._generate_sentiment_recommendations(sentiment_data)
        )
        
        # Sort by priority
        priority_order = {'High': 0, 'Medium': 1, 'Low': 2}
        recommendations.sort(
            key=lambda x: priority_order.get(x['priority'], 2)
        )
        
        return recommendations
    
    def _generate_merchandising_recommendations(
        self,
        affinity_rules: List[Dict[str, Any]],
        bundles: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate merchandising recommendations"""
        recommendations = []
        
        # Bundle recommendations
        if bundles:
            top_bundle = bundles[0]
            recommendations.append({
                'id': 'MERCH-001',
                'category': 'Merchandising',
                'title': f"Create Product Bundle: {top_bundle['bundle_name']}",
                'description': (
                    f"These products have a strong affinity (lift: "
                    f"{top_bundle['affinity_score']:.2f}x). "
                    f"Bundling them could increase average order value by "
                    f"{top_bundle['estimated_lift']}."
                ),
                'expected_impact': (
                    f"10-{top_bundle['estimated_lift']} increase in AOV"
                ),
                'priority': 'High',
                'timeline': 'Immediate',
                'implementation_steps': [
                    f"Create bundle listing for {top_bundle['bundle_name']}",
                    "Set bundle price (5-10% discount vs individual)",
                    "Feature on homepage and product pages",
                    "Monitor conversion rate and AOV impact"
                ]
            })
        
        # Cross-sell recommendations
        if affinity_rules and len(affinity_rules) > 0:
            top_rule = affinity_rules[0]
            recommendations.append({
                'id': 'MERCH-002',
                'category': 'Merchandising',
                'title': (
                    f"Add Cross-sell: {top_rule['antecedents']} → "
                    f"{top_rule['consequents']}"
                ),
                'description': (
                    f"Customers who buy {top_rule['antecedents']} often "
                    f"purchase {top_rule['consequents']} (confidence: "
                    f"{top_rule['confidence']*100:.1f}%)."
                ),
                'expected_impact': '5-15% increase in cross-sell conversion',
                'priority': 'Medium',
                'timeline': '30 days',
                'implementation_steps': [
                    "Add 'Frequently Bought Together' widget",
                    "Configure cross-sell on product pages",
                    "A/B test placement and messaging"
                ]
            })
        
        return recommendations
    
    def _generate_marketing_recommendations(
        self,
        segments: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate marketing recommendations"""
        recommendations = []
        
        # Find Champions segment
        champions = next(
            (s for s in segments if s['segment_name'] == 'Champions'), 
            None
        )
        
        if champions:
            recommendations.append({
                'id': 'MKT-001',
                'category': 'Marketing',
                'title': 'Launch VIP Loyalty Program for Champions',
                'description': (
                    f"Your Champions segment ({champions['customer_count']} "
                    f"customers, ${champions['total_revenue']:,.2f} revenue) "
                    "represents your most valuable customers. Implement a VIP "
                    "program to retain and reward them."
                ),
                'expected_impact': '15-25% increase in retention',
                'priority': 'High',
                'timeline': '30 days',
                'implementation_steps': [
                    'Define VIP tiers and benefits',
                    'Create exclusive offers for Champions',
                    'Send personalized invitations',
                    'Track engagement and redemption rates'
                ]
            })
        
        # Find At Risk segment
        at_risk = next(
            (s for s in segments if s['segment_name'] == 'At Risk'), 
            None
        )
        
        if at_risk:
            recommendations.append({
                'id': 'MKT-002',
                'category': 'Marketing',
                'title': 'Win-Back Campaign for At-Risk Customers',
                'description': (
                    f"{at_risk['customer_count']} customers are at risk of "
                    f"churning. Launch a targeted win-back campaign with "
                    "special offers."
                ),
                'expected_impact': '20-40% reactivation rate',
                'priority': 'High',
                'timeline': 'Immediate',
                'implementation_steps': [
                    'Segment at-risk customers',
                    'Create compelling win-back offer',
                    'Design email sequence (3-5 emails)',
                    'Monitor reactivation and adjust messaging'
                ]
            })
        
        return recommendations
    
    def _generate_sentiment_recommendations(
        self,
        sentiment_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate sentiment-based recommendations"""
        recommendations = []
        
        # Check for low sentiment categories
        if 'by_category' in sentiment_data:
            low_sentiment = [
                c for c in sentiment_data['by_category']
                if c.get('sentiment_score', 100) < 60
            ]
            
            if low_sentiment:
                worst = low_sentiment[0]
                recommendations.append({
                    'id': 'SEN-001',
                    'category': 'Product',
                    'title': f"Address Issues in {worst['category']}",
                    'description': (
                        f"{worst['category']} has low sentiment "
                        f"({worst['sentiment_score']:.1f}/100). "
                        "Investigate product quality or customer concerns."
                    ),
                    'expected_impact': 'Improved customer satisfaction',
                    'priority': 'High',
                    'timeline': 'Immediate',
                    'implementation_steps': [
                        f"Review {worst['category']} product quality",
                        "Analyze customer feedback and reviews",
                        "Identify common complaints",
                        "Implement improvements or replacements"
                    ]
                })
        
        return recommendations
```

---

## 9. API Implementation

### 9.1 Implementation: `routes/behavior.py`

```python
# -*- coding: utf-8 -*-
"""
Behavior Analytics Routes

API endpoints for shopper behavior analysis.
"""

from flask import Blueprint, request, jsonify, current_app, g
from datetime import datetime
import pandas as pd

from services.segmentation_service import SegmentationService
from services.affinity_service import AffinityService
from services.sentiment_service import SentimentService
from services.persona_service import PersonaService
from services.recommendation_service import RecommendationService
from models.sales_data import SalesData
from routes.auth import jwt_required

behavior_bp = Blueprint(
    'behavior', 
    __name__, 
    url_prefix='/api/behavior'
)


def get_sales_model():
    """Get sales data model"""
    db = current_app.config['MONGO_DB']
    return SalesData(db)


@behavior_bp.route('/segments', methods=['GET'])
@jwt_required
def get_segments():
    """Get customer segments"""
    try:
        upload_id = request.args.get('upload_id')
        user_id = g.current_user['user_id']
        
        sales_model = get_sales_model()
        
        # Get transactions
        transactions = sales_model.get_transactions(
            user_id, upload_id
        )
        
        if transactions.empty:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NO_DATA',
                    'message': 'No transaction data available'
                }
            }), 400
        
        # Compute segmentation
        segmentation_service = SegmentationService()
        rfm_df = segmentation_service.compute_rfm_scores(transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(
            rfm_df, n_clusters=4
        )
        summaries = segmentation_service.get_segment_summary(
            segmented_df, segment_mapping
        )
        
        return jsonify({
            'success': True,
            'data': {
                'segments': summaries,
                'segment_mapping': segment_mapping
            }
        })
        
    except Exception as e:
        current_app.logger.error(f'Segments error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Failed to get segments'
            }
        }), 500


@behavior_bp.route('/affinity/network', methods=['GET'])
@jwt_required
def get_affinity_network():
    """Get product affinity network"""
    try:
        upload_id = request.args.get('upload_id')
        user_id = g.current_user['user_id']
        
        sales_model = get_sales_model()
        transactions = sales_model.get_transactions(user_id, upload_id)
        
        if transactions.empty:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_DATA', 'message': 'No data'}
            }), 400
        
        # Compute affinity
        affinity_service = AffinityService()
        basket = affinity_service.create_basket_matrix(transactions)
        itemsets = affinity_service.find_frequent_itemsets(basket)
        rules = affinity_service.generate_association_rules(itemsets)
        network = affinity_service.build_affinity_network(
            rules, transactions
        )
        
        return jsonify({
            'success': True,
            'data': network
        })
        
    except Exception as e:
        current_app.logger.error(f'Affinity network error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500


@behavior_bp.route('/sentiment/overview', methods=['GET'])
@jwt_required
def get_sentiment_overview():
    """Get sentiment overview"""
    try:
        upload_id = request.args.get('upload_id')
        user_id = g.current_user['user_id']
        
        sales_model = get_sales_model()
        transactions = sales_model.get_transactions(user_id, upload_id)
        
        if transactions.empty:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_DATA', 'message': 'No data'}
            }), 400
        
        # Compute sentiment
        sentiment_service = SentimentService()
        sentiment_df = sentiment_service.calculate_sentiment_scores(
            transactions
        )
        overview = sentiment_service.get_overview(sentiment_df)
        
        return jsonify({
            'success': True,
            'data': overview
        })
        
    except Exception as e:
        current_app.logger.error(f'Sentiment error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500


@behavior_bp.route('/personas', methods=['GET'])
@jwt_required
def get_personas():
    """Get customer personas"""
    try:
        upload_id = request.args.get('upload_id')
        user_id = g.current_user['user_id']
        
        # Get data and compute segments
        sales_model = get_sales_model()
        transactions = sales_model.get_transactions(user_id, upload_id)
        
        segmentation_service = SegmentationService()
        rfm_df = segmentation_service.compute_rfm_scores(transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(
            rfm_df
        )
        
        # Get original customer data
        customers = sales_model.get_customers(user_id, upload_id)
        
        # Generate personas
        persona_service = PersonaService()
        personas = persona_service.generate_personas(
            segmented_df, segment_mapping, customers
        )
        
        return jsonify({
            'success': True,
            'data': {
                'personas': personas
            }
        })
        
    except Exception as e:
        current_app.logger.error(f'Personas error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500


@behavior_bp.route('/recommendations', methods=['GET'])
@jwt_required
def get_recommendations():
    """Get behavioral recommendations"""
    try:
        upload_id = request.args.get('upload_id')
        user_id = g.current_user['user_id']
        
        # Get all data
        sales_model = get_sales_model()
        transactions = sales_model.get_transactions(user_id, upload_id)
        
        # Compute all analytics
        segmentation_service = SegmentationService()
        affinity_service = AffinityService()
        sentiment_service = SentimentService()
        recommendation_service = RecommendationService()
        
        # Segmentation
        rfm_df = segmentation_service.compute_rfm_scores(transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(
            rfm_df
        )
        segments = segmentation_service.get_segment_summary(
            segmented_df, segment_mapping
        )
        
        # Affinity
        basket = affinity_service.create_basket_matrix(transactions)
        itemsets = affinity_service.find_frequent_itemsets(basket)
        rules = affinity_service.generate_association_rules(itemsets)
        bundles = affinity_service.suggest_bundles(rules)
        
        # Sentiment
        sentiment_df = sentiment_service.calculate_sentiment_scores(
            transactions
        )
        sentiment_overview = sentiment_service.get_overview(sentiment_df)
        
        # Generate recommendations
        recommendations = recommendation_service.generate_recommendations(
            segments,
            rules.to_dict('records'),
            sentiment_overview,
            bundles
        )
        
        return jsonify({
            'success': True,
            'data': {
                'recommendations': recommendations
            }
        })
        
    except Exception as e:
        current_app.logger.error(f'Recommendations error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500
```

---

## 10. Frontend Integration

### 10.1 API Client Extension

```typescript
// frontend/src/lib/api.ts - Add these methods

export interface Segment {
  segment_id: number;
  segment_name: string;
  customer_count: number;
  total_revenue: number;
  characteristics: {
    avg_recency: number;
    avg_frequency: number;
    avg_monetary: number;
  };
}

export interface Persona {
  persona_id: number;
  name: string;
  role: string;
  description: string;
  demographics: {
    age_range: string;
    gender_split: Record<string, number>;
  };
  behavior: {
    avg_order_value: number;
    purchase_frequency: string;
  };
}

export interface AffinityNetwork {
  nodes: Array<{
    id: string;
    label: string;
    value: number;
    color: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    strength: number;
    lift: number;
  }>;
}

export interface SentimentOverview {
  overall_score: number;
  average_rating: number;
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  timeline: string;
  implementation_steps: string[];
}

class BehaviorAPI {
  /**
   * Get customer segments
   */
  async getSegments(uploadId?: string): Promise<{
    success: boolean;
    data?: {
      segments: Segment[];
      segment_mapping: Record<number, string>;
    };
    error?: ApiError;
  }> {
    const params = uploadId ? `?upload_id=${uploadId}` : '';
    return this.request(`/api/behavior/segments${params}`, 'GET');
  }

  /**
   * Get affinity network
   */
  async getAffinityNetwork(uploadId?: string): Promise<{
    success: boolean;
    data?: AffinityNetwork;
    error?: ApiError;
  }> {
    const params = uploadId ? `?upload_id=${uploadId}` : '';
    return this.request(`/api/behavior/affinity/network${params}`, 'GET');
  }

  /**
   * Get sentiment overview
   */
  async getSentimentOverview(uploadId?: string): Promise<{
    success: boolean;
    data?: SentimentOverview;
    error?: ApiError;
  }> {
    const params = uploadId ? `?upload_id=${uploadId}` : '';
    return this.request(`/api/behavior/sentiment/overview${params}`, 'GET');
  }

  /**
   * Get personas
   */
  async getPersonas(uploadId?: string): Promise<{
    success: boolean;
    data?: { personas: Persona[] };
    error?: ApiError;
  }> {
    const params = uploadId ? `?upload_id=${uploadId}` : '';
    return this.request(`/api/behavior/personas${params}`, 'GET');
  }

  /**
   * Get recommendations
   */
  async getRecommendations(uploadId?: string): Promise<{
    success: boolean;
    data?: { recommendations: Recommendation[] };
    error?: ApiError;
  }> {
    const params = uploadId ? `?upload_id=${uploadId}` : '';
    return this.request(`/api/behavior/recommendations${params}`, 'GET');
  }
}

// Add to existing api instance
export const api = new API();
export const behaviorApi = new BehaviorAPI();
```

---

## 11. Testing Guide

### 11.1 Unit Tests

```python
# backend/tests/test_segmentation.py
import pytest
import pandas as pd
from services.segmentation_service import SegmentationService


class TestSegmentationService:
    
    @pytest.fixture
    def sample_transactions(self):
        """Create sample transaction data"""
        return pd.DataFrame({
            'customer_id': ['C1', 'C1', 'C2', 'C2', 'C3'],
            'date': pd.date_range('2025-01-01', periods=5),
            'revenue': [100, 150, 200, 250, 50]
        })
    
    def test_compute_rfm_scores(self, sample_transactions):
        """Test RFM score calculation"""
        service = SegmentationService()
        rfm_df = service.compute_rfm_scores(sample_transactions)
        
        assert len(rfm_df) == 3  # 3 unique customers
        assert 'recency' in rfm_df.columns
        assert 'frequency' in rfm_df.columns
        assert 'monetary' in rfm_df.columns
        assert 'rfm_score' in rfm_df.columns
    
    def test_segment_customers(self, sample_transactions):
        """Test customer segmentation"""
        service = SegmentationService()
        rfm_df = service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = service.segment_customers(
            rfm_df, n_clusters=3
        )
        
        assert 'segment_id' in segmented_df.columns
        assert len(segment_mapping) == 3
        assert all(isinstance(k, int) for k in segment_mapping.keys())
```

### 11.2 Integration Tests

```python
# backend/tests/test_behavior_api.py
import pytest
from flask import url_for


class TestBehaviorAPI:
    
    def test_get_segments(self, client, auth_headers):
        """Test segments endpoint"""
        response = client.get(
            url_for('behavior.get_segments'),
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'segments' in data['data']
    
    def test_get_personas(self, client, auth_headers):
        """Test personas endpoint"""
        response = client.get(
            url_for('behavior.get_personas'),
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'personas' in data['data']
```

---

## 12. Troubleshooting

### 12.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **K-Means convergence warning** | Too few data points | Reduce n_clusters or add more data |
| **No affinity rules found** | min_support too high | Lower min_support to 0.01 |
| **Empty segments** | Data quality issues | Check for missing values |
| **Slow performance** | Large dataset | Use sampling or increase thresholds |

### 12.2 Performance Optimization

```python
# For large datasets, use sampling
sample_df = transactions_df.sample(n=10000, random_state=42)

# Or increase min_support for Apriori
itemsets = apriori(basket, min_support=0.1)  # Instead of 0.05
```

---

*Document Version: 1.0.0*  
*Last Updated: February 27, 2026*  
*ShopSense AI Development Team*
