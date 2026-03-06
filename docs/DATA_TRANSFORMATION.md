# 🔄 Data Transformation Guide

**For:** shopping_trends.csv → ShopSense AI Format  
**Version:** 1.0.0  
**Last Updated:** February 27, 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Source Data Format](#source-data-format)
3. [Target Data Format](#target-data-format)
4. [Column Mapping](#column-mapping)
5. [Transformation Rules](#transformation-rules)
6. [Step-by-Step Guide](#step-by-step-guide)
7. [Validation](#validation)
8. [Troubleshooting](#troubleshooting)

---

## 1. Overview

### 1.1 Purpose

This guide explains how to transform the `shopping_trends.csv` dataset into the format expected by ShopSense AI's analytics engine.

### 1.2 The Challenge

**ShopSense AI expects:**
```
product_name, date, units_sold, price
```

**shopping_trends.csv provides:**
```
Customer ID, Age, Gender, Item Purchased, Category, 
Purchase Amount (USD), Location, ... (19 columns total)
```

### 1.3 Solution

A data transformation layer maps and converts the source format to the target format while preserving all valuable behavioral and demographic data.

---

## 2. Source Data Format

### 2.1 shopping_trends.csv Structure

**Dataset Statistics:**
- **Records:** 3,900 rows
- **Columns:** 19
- **File Size:** ~500 KB

### 2.2 Column Details

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| Customer ID | int | 1 | Unique customer identifier |
| Age | int | 55 | Customer age |
| Gender | object | Male | Customer gender |
| Item Purchased | object | Blouse | Product name |
| Category | object | Clothing | Product category |
| Purchase Amount (USD) | int | 125 | Transaction value |
| Location | object | California | Customer location |
| Size | object | L | Product size |
| Color | object | Red | Product color |
| Season | object | Winter | Season tag |
| Review Rating | float | 4.5 | Customer rating (1-5) |
| Subscription Status | object | Yes | Subscription flag |
| Payment Method | object | Credit Card | Payment type |
| Shipping Type | object | Standard | Shipping method |
| Discount Applied | object | 10% | Discount type |
| Promo Code Used | object | Yes | Promo flag |
| Previous Purchases | int | 5 | Historical count |
| Preferred Payment Method | object | Credit Card | Payment preference |
| Frequency of Purchases | object | Weekly | Purchase frequency |

### 2.3 Data Characteristics

**Categories:**
- Clothing
- Footwear
- Outerwear
- Accessories

**Sample Items:**
- Blouse, Sweater, Jeans, Sandals, Sneakers, Shirt, Shorts, Coat, Handbag, Shoes, Dress, Skirt, Sunglasses, Pants, Jacket, Hoodie, Jewelry, T-shirt, Scarf, Hat

**Gender Distribution:**
- Male: 2,652 records (68%)
- Female: 1,248 records (32%)

**Review Rating Range:**
- Minimum: 2.5
- Maximum: 5.0

---

## 3. Target Data Format

### 3.1 ShopSense AI Collections

The transformed data is stored in three MongoDB collections:

#### transactions
```json
{
  "user_id": "ObjectId",
  "upload_id": "upload_abc123",
  "customer_id": "C001",
  "product_id": "blouse_001",
  "product_name": "Blouse",
  "category": "Clothing",
  "date": "2025-01-01T00:00:00Z",
  "quantity": 1,
  "price": 125.00,
  "revenue": 125.00,
  "rating": 4.5,
  "payment_method": "Credit Card",
  "shipping_type": "Standard",
  "discount_applied": "10%",
  "promo_used": "Yes"
}
```

#### customers
```json
{
  "user_id": "ObjectId",
  "upload_id": "upload_abc123",
  "customer_id": "C001",
  "age": 55,
  "gender": "Male",
  "location": "California",
  "total_spend": 1250.50,
  "purchase_count": 10,
  "avg_rating": 4.3,
  "historical_purchases": 5,
  "preferred_payment": "Credit Card",
  "purchase_frequency": "Weekly",
  "subscription_status": "Yes"
}
```

#### products
```json
{
  "user_id": "ObjectId",
  "upload_id": "upload_abc123",
  "product_id": "blouse_001",
  "product_name": "Blouse",
  "category": "Clothing",
  "avg_price": 125.00,
  "units_sold": 150,
  "avg_rating": 4.5,
  "rating_count": 120
}
```

---

## 4. Column Mapping

### 4.1 Primary Mapping

| Source Column | Target Field | Collection | Transformation |
|---------------|--------------|------------|----------------|
| Customer ID | customer_id | transactions, customers | Convert to string |
| Item Purchased | product_name | transactions, products | Direct copy |
| Category | category | transactions, products | Direct copy |
| Purchase Amount (USD) | price, revenue | transactions | Direct copy |
| Review Rating | rating | transactions | Direct copy |
| Age | age | customers | Direct copy |
| Gender | gender | customers | Direct copy |
| Location | location | customers | Direct copy |
| Payment Method | payment_method | transactions | Direct copy |
| Shipping Type | shipping_type | transactions | Direct copy |
| Discount Applied | discount_applied | transactions | Direct copy |
| Promo Code Used | promo_used | transactions | Direct copy |
| Previous Purchases | historical_purchases | customers | Direct copy |
| Preferred Payment Method | preferred_payment | customers | Direct copy |
| Frequency of Purchases | purchase_frequency | customers | Direct copy |
| Subscription Status | subscription_status | customers | Direct copy |

### 4.2 Derived Fields

| Target Field | Source | Calculation |
|--------------|--------|-------------|
| product_id | Item Purchased | `item.lower().replace(' ', '_')` |
| quantity | - | Constant: 1 (each row = 1 unit) |
| revenue | Purchase Amount (USD) | Same as price (quantity=1) |
| total_spend | Purchase Amount (USD) | SUM by customer_id |
| purchase_count | - | COUNT by customer_id |
| avg_rating | Review Rating | AVG by customer_id |
| avg_price | Purchase Amount (USD) | AVG by product |
| units_sold | - | COUNT by product |

### 4.3 Synthetic Fields

| Field | Reason | Generation Method |
|-------|--------|-------------------|
| date | Not in source | Sequential timestamps |
| user_id | Multi-tenant | From authenticated user |
| upload_id | Versioning | From upload session |

---

## 5. Transformation Rules

### 5.1 Data Type Conversions

```python
# Customer ID: int → string
customer_id = str(row['Customer ID'])

# Purchase Amount: int → float
price = float(row['Purchase Amount (USD)'])

# Review Rating: float → float (validate range)
rating = float(row['Review Rating'])
assert 1.0 <= rating <= 5.0

# Date: synthetic generation
from datetime import datetime, timedelta
base_date = datetime(2025, 1, 1)
date = base_date + timedelta(hours=index)
```

### 5.2 Data Cleaning Rules

```python
# Remove rows with missing critical fields
required_fields = ['Customer ID', 'Item Purchased', 'Purchase Amount (USD)']
df = df.dropna(subset=required_fields)

# Normalize category names
df['Category'] = df['Category'].str.strip().str.title()

# Normalize product names
df['Item Purchased'] = df['Item Purchased'].str.strip().str.title()

# Validate price > 0
df = df[df['Purchase Amount (USD)'] > 0]

# Validate rating in range
df = df[(df['Review Rating'] >= 1) & (df['Review Rating'] <= 5)]
```

### 5.3 Aggregation Rules

**For customers collection:**
```python
customers = df.groupby('Customer ID').agg({
    'Age': 'first',
    'Gender': 'first',
    'Location': 'first',
    'Purchase Amount (USD)': 'sum',      # total_spend
    'Customer ID': 'count',               # purchase_count
    'Review Rating': 'mean',              # avg_rating
    'Previous Purchases': 'first',
    'Preferred Payment Method': 'first',
    'Frequency of Purchases': 'first',
    'Subscription Status': 'first'
})
```

**For products collection:**
```python
products = df.groupby('Item Purchased').agg({
    'Category': 'first',
    'Purchase Amount (USD)': 'mean',      # avg_price
    'Customer ID': 'count',               # units_sold
    'Review Rating': ['mean', 'count']    # avg_rating, rating_count
})
```

---

## 6. Step-by-Step Guide

### 6.1 Complete Transformation Script

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Shopping Trends Data Transformation Script

Transforms shopping_trends.csv to ShopSense AI format.
"""

import pandas as pd
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def transform_shopping_trends(input_file: str, user_id: str, upload_id: str):
    """
    Transform shopping_trends.csv to ShopSense AI format.
    
    Args:
        input_file: Path to shopping_trends.csv
        user_id: User identifier
        upload_id: Upload session identifier
    
    Returns:
        dict: Transformed DataFrames
    """
    logger.info(f"Reading {input_file}...")
    
    # Step 1: Read source data
    df = pd.read_csv(input_file)
    logger.info(f"Loaded {len(df)} rows, {len(df.columns)} columns")
    
    # Step 2: Validate required columns
    required_columns = [
        'Customer ID', 'Item Purchased', 'Category',
        'Purchase Amount (USD)', 'Review Rating'
    ]
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
    
    # Step 3: Clean data
    logger.info("Cleaning data...")
    df = clean_data(df)
    logger.info(f"After cleaning: {len(df)} rows")
    
    # Step 4: Generate synthetic dates
    df['date'] = generate_synthetic_dates(df)
    
    # Step 5: Transform transactions
    logger.info("Transforming transactions...")
    transactions = transform_transactions(df, user_id, upload_id)
    
    # Step 6: Transform customers
    logger.info("Transforming customers...")
    customers = transform_customers(df, user_id, upload_id)
    
    # Step 7: Transform products
    logger.info("Transforming products...")
    products = transform_products(df, user_id, upload_id)
    
    logger.info("Transformation complete!")
    logger.info(f"  Transactions: {len(transactions)} rows")
    logger.info(f"  Customers: {len(customers)} rows")
    logger.info(f"  Products: {len(products)} rows")
    
    return {
        'transactions': transactions,
        'customers': customers,
        'products': products
    }


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean and validate data"""
    
    # Remove rows with missing critical fields
    required = ['Customer ID', 'Item Purchased', 'Purchase Amount (USD)']
    df = df.dropna(subset=required).copy()
    
    # Normalize text fields
    df['Category'] = df['Category'].str.strip().str.title()
    df['Item Purchased'] = df['Item Purchased'].str.strip().str.title()
    
    # Validate price
    df = df[df['Purchase Amount (USD)'] > 0]
    
    # Validate rating
    df = df[(df['Review Rating'] >= 1) & (df['Review Rating'] <= 5)]
    
    return df


def generate_synthetic_dates(df: pd.DataFrame) -> pd.Series:
    """Generate synthetic dates for transactions"""
    base_date = datetime(2025, 1, 1)
    dates = [base_date + timedelta(hours=i) for i in range(len(df))]
    return pd.to_datetime(dates)


def transform_transactions(df: pd.DataFrame, user_id: str, upload_id: str) -> pd.DataFrame:
    """Transform to transactions format"""
    transactions = pd.DataFrame()
    
    transactions['user_id'] = user_id
    transactions['upload_id'] = upload_id
    transactions['customer_id'] = df['Customer ID'].astype(str)
    transactions['product_id'] = df['Item Purchased'].apply(
        lambda x: x.lower().replace(' ', '_')
    )
    transactions['product_name'] = df['Item Purchased']
    transactions['category'] = df['Category']
    transactions['date'] = df['date']
    transactions['quantity'] = 1
    transactions['price'] = df['Purchase Amount (USD)']
    transactions['revenue'] = df['Purchase Amount (USD)']
    transactions['rating'] = df['Review Rating']
    
    # Optional fields
    if 'Payment Method' in df.columns:
        transactions['payment_method'] = df['Payment Method']
    if 'Shipping Type' in df.columns:
        transactions['shipping_type'] = df['Shipping Type']
    if 'Discount Applied' in df.columns:
        transactions['discount_applied'] = df['Discount Applied']
    if 'Promo Code Used' in df.columns:
        transactions['promo_used'] = df['Promo Code Used']
    
    return transactions


def transform_customers(df: pd.DataFrame, user_id: str, upload_id: str) -> pd.DataFrame:
    """Transform to customers format"""
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


def transform_products(df: pd.DataFrame, user_id: str, upload_id: str) -> pd.DataFrame:
    """Transform to products format"""
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
    
    products['product_id'] = products['product_name'].apply(
        lambda x: x.lower().replace(' ', '_')
    )
    products['user_id'] = user_id
    products['upload_id'] = upload_id
    
    # Reorder columns
    products = products[['user_id', 'upload_id', 'product_id', 
                         'product_name', 'category', 'avg_price',
                         'units_sold', 'avg_rating', 'rating_count']]
    
    return products


if __name__ == '__main__':
    # Example usage
    result = transform_shopping_trends(
        input_file='shopping_trends.csv',
        user_id='user_123',
        upload_id='upload_456'
    )
    
    # Save to CSV for inspection
    result['transactions'].to_csv('transactions_transformed.csv', index=False)
    result['customers'].to_csv('customers_transformed.csv', index=False)
    result['products'].to_csv('products_transformed.csv', index=False)
    
    print("Transformation complete! Check output files.")
```

### 6.2 Running the Script

```bash
# Save script as transform_data.py
python transform_data.py
```

### 6.3 Integration with ShopSense AI

```python
# In backend/routes/uploads.py

from utils.data_mapper import DataMapper

@uploads_bp.route('', methods=['POST'])
@jwt_required
def upload_file():
    # ... existing code ...
    
    # Read CSV
    df = pd.read_csv(file)
    
    # Transform
    mapper = DataMapper()
    transformed = mapper.transform_shopping_trends(
        df,
        user_id=g.current_user['user_id'],
        upload_id=upload_session['upload_id']
    )
    
    # Store in MongoDB
    db['transactions'].insert_many(
        transformed['transactions'].to_dict('records')
    )
    db['customers'].insert_many(
        transformed['customers'].to_dict('records')
    )
    db['products'].insert_many(
        transformed['products'].to_dict('records')
    )
```

---

## 7. Validation

### 7.1 Pre-Transformation Validation

```python
def validate_source_data(df: pd.DataFrame) -> tuple:
    """
    Validate source data before transformation.
    
    Returns:
        tuple: (is_valid, error_messages)
    """
    errors = []
    
    # Check row count
    if len(df) < 100:
        errors.append(f"Warning: Only {len(df)} rows (minimum 100 recommended)")
    
    # Check required columns
    required = ['Customer ID', 'Item Purchased', 'Category', 
                'Purchase Amount (USD)', 'Review Rating']
    missing = [col for col in required if col not in df.columns]
    if missing:
        errors.append(f"Missing columns: {missing}")
    
    # Check for duplicates
    if df.duplicated().sum() > 0:
        errors.append(f"Found {df.duplicated().sum()} duplicate rows")
    
    # Check value ranges
    if df['Review Rating'].min() < 1 or df['Review Rating'].max() > 5:
        errors.append("Review Rating out of range (1-5)")
    
    if df['Purchase Amount (USD)'].min() <= 0:
        errors.append("Purchase Amount must be > 0")
    
    # Check unique values
    unique_customers = df['Customer ID'].nunique()
    unique_products = df['Item Purchased'].nunique()
    
    if unique_customers < 20:
        errors.append(f"Only {unique_customers} unique customers (minimum 20)")
    
    if unique_products < 10:
        errors.append(f"Only {unique_products} unique products (minimum 10)")
    
    is_valid = len(errors) == 0
    return is_valid, errors
```

### 7.2 Post-Transformation Validation

```python
def validate_transformed_data(transformed: dict) -> tuple:
    """
    Validate transformed data.
    
    Returns:
        tuple: (is_valid, error_messages)
    """
    errors = []
    
    transactions = transformed['transactions']
    customers = transformed['customers']
    products = transformed['products']
    
    # Check transactions
    required_tx_fields = ['user_id', 'upload_id', 'customer_id', 
                          'product_id', 'date', 'price', 'revenue']
    missing = [f for f in required_tx_fields if f not in transactions.columns]
    if missing:
        errors.append(f"Transactions missing fields: {missing}")
    
    if (transactions['price'] <= 0).any():
        errors.append("Transactions with price <= 0")
    
    if (transactions['revenue'] < 0).any():
        errors.append("Transactions with negative revenue")
    
    # Check customers
    if len(customers) == 0:
        errors.append("No customers in transformed data")
    
    # Check products
    if len(products) == 0:
        errors.append("No products in transformed data")
    
    # Check consistency
    tx_customers = set(transactions['customer_id'].unique())
    cust_ids = set(customers['customer_id'].unique())
    
    if tx_customers != cust_ids:
        errors.append("Customer ID mismatch between transactions and customers")
    
    tx_products = set(transactions['product_id'].unique())
    prod_ids = set(products['product_id'].unique())
    
    if tx_products != prod_ids:
        errors.append("Product ID mismatch between transactions and products")
    
    is_valid = len(errors) == 0
    return is_valid, errors
```

### 7.3 Data Quality Report

```python
def generate_data_quality_report(df: pd.DataFrame, transformed: dict):
    """Generate comprehensive data quality report"""
    
    report = {
        'source': {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'unique_customers': df['Customer ID'].nunique(),
            'unique_products': df['Item Purchased'].nunique(),
            'unique_categories': df['Category'].nunique(),
            'date_range': 'Synthetic (generated)',
            'price_range': {
                'min': df['Purchase Amount (USD)'].min(),
                'max': df['Purchase Amount (USD)'].max(),
                'mean': df['Purchase Amount (USD)'].mean()
            },
            'rating_range': {
                'min': df['Review Rating'].min(),
                'max': df['Review Rating'].max(),
                'mean': df['Review Rating'].mean()
            }
        },
        'transformed': {
            'transactions': len(transformed['transactions']),
            'customers': len(transformed['customers']),
            'products': len(transformed['products'])
        },
        'quality_checks': {
            'missing_values': df.isnull().sum().to_dict(),
            'duplicate_rows': df.duplicated().sum()
        }
    }
    
    return report
```

---

## 8. Troubleshooting

### 8.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **Missing columns error** | Different CSV format | Verify CSV matches shopping_trends.csv structure |
| **Date generation warning** | No date column in source | Expected - synthetic dates are generated |
| **Customer count mismatch** | Duplicate customer IDs | Check for data entry errors |
| **Price validation failure** | Zero or negative prices | Filter out invalid records |
| **Memory error** | Very large dataset | Use chunking or sampling |

### 8.2 Performance Optimization

```python
# For large datasets (>100K rows)

# Use chunking
chunk_size = 10000
chunks = []
for chunk in pd.read_csv('shopping_trends.csv', chunksize=chunk_size):
    transformed_chunk = transform_shopping_trends(chunk, ...)
    chunks.append(transformed_chunk)

# Combine chunks
final_result = pd.concat(chunks, ignore_index=True)

# Or use sampling for testing
df_sample = df.sample(n=1000, random_state=42)
```

### 8.3 Error Handling

```python
try:
    result = transform_shopping_trends('shopping_trends.csv', user_id, upload_id)
except FileNotFoundError:
    logger.error("CSV file not found")
except pd.errors.EmptyDataError:
    logger.error("CSV file is empty")
except ValueError as e:
    logger.error(f"Validation error: {e}")
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise
```

---

## Appendix A: Sample Transformed Data

### Transactions Sample
```csv
user_id,upload_id,customer_id,product_id,product_name,category,date,quantity,price,revenue,rating
user_123,upload_456,1,blouse,Blouse,Clothing,2025-01-01 00:00:00,1,125.0,125.0,4.5
user_123,upload_456,2,sweater,Sweater,Clothing,2025-01-01 01:00:00,1,89.0,89.0,4.2
```

### Customers Sample
```csv
customer_id,age,gender,location,total_spend,purchase_count,avg_rating
1,55,Male,California,1250.50,10,4.3
2,19,Female,New York,890.25,7,4.5
```

### Products Sample
```csv
product_id,product_name,category,avg_price,units_sold,avg_rating,rating_count
blouse,Blouse,Clothing,125.00,150,4.5,120
sweater,Sweater,Clothing,89.00,98,4.2,85
```

---

*Document Version: 1.0.0*  
*Last Updated: February 27, 2026*  
*ShopSense AI Development Team*
