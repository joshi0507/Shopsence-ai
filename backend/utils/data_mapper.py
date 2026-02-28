# -*- coding: utf-8 -*-
"""
Data Mapper - Transform shopping_trends.csv to ShopSense AI format

This module handles the transformation of the shopping_trends dataset
to the internal data format used by ShopSense AI.

Example usage:
    from utils.data_mapper import DataMapper
    
    mapper = DataMapper()
    transformed = mapper.transform_shopping_trends(
        df,
        user_id='user_123',
        upload_id='upload_456'
    )
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
import logging

logger = logging.getLogger(__name__)


class DataMapper:
    """Transform external data formats to ShopSense AI internal schema"""
    
    def __init__(self):
        """Initialize data mapper"""
        self.required_columns = [
            'Customer ID', 'Item Purchased', 'Category',
            'Purchase Amount (USD)', 'Review Rating'
        ]
    
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
            user_id: User identifier
            upload_id: Upload session ID
            
        Returns:
            dict: Transformed DataFrames for transactions, customers, products
            
        Raises:
            ValueError: If required columns are missing
        """
        logger.info(f"Transforming shopping_trends data: {len(df)} rows")
        
        # Validate required columns
        missing = [col for col in self.required_columns if col not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")
        
        # Create synthetic date if not present
        if 'date' not in df.columns:
            df = df.copy()
            df['date'] = self._generate_synthetic_dates(len(df))
        
        # Clean data
        df = self._clean_data(df)
        
        # Transform to collections
        transactions_df = self._transform_transactions(df, user_id, upload_id)
        customers_df = self._transform_customers(df, user_id, upload_id)
        products_df = self._transform_products(df, user_id, upload_id)
        
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
    
    def _generate_synthetic_dates(self, n_rows: int) -> pd.Series:
        """
        Generate synthetic dates for transactions
        
        Args:
            n_rows: Number of dates to generate
            
        Returns:
            Series of datetime objects
        """
        base_date = datetime(2025, 1, 1)
        dates = [base_date + timedelta(hours=i) for i in range(n_rows)]
        return pd.to_datetime(dates)
    
    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and validate data

        Args:
            df: Raw DataFrame

        Returns:
            Cleaned DataFrame
        """
        df = df.copy()

        # Remove rows with missing critical fields
        df = df.dropna(subset=self.required_columns)

        # Normalize text fields
        if 'Category' in df.columns:
            df['Category'] = df['Category'].str.strip().str.title()
        if 'Item Purchased' in df.columns:
            df['Item Purchased'] = df['Item Purchased'].str.strip().str.title()
        if 'Gender' in df.columns:
            df['Gender'] = df['Gender'].str.strip().str.title()
        if 'Location' in df.columns:
            df['Location'] = df['Location'].str.strip().str.title()

        # Validate price > 0
        df = df[df['Purchase Amount (USD)'] > 0]

        # Validate rating in range 1-5
        df = df[(df['Review Rating'] >= 1) & (df['Review Rating'] <= 5)]

        # Validate age if present
        if 'Age' in df.columns:
            df = df[(df['Age'] >= 18) & (df['Age'] <= 100)]

        return df
    
    def _transform_transactions(
        self, 
        df: pd.DataFrame,
        user_id: str,
        upload_id: str
    ) -> pd.DataFrame:
        """
        Transform to transactions collection format
        
        Args:
            df: Cleaned DataFrame
            user_id: User identifier
            upload_id: Upload session ID
            
        Returns:
            Transactions DataFrame
        """
        transactions = pd.DataFrame()
        
        # Core fields
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
        transactions['price'] = df['Purchase Amount (USD)'].astype(float)
        transactions['revenue'] = transactions['price'] * transactions['quantity']
        transactions['rating'] = df['Review Rating'].astype(float)
        
        # Additional behavioral fields
        optional_mappings = {
            'Payment Method': 'payment_method',
            'Shipping Type': 'shipping_type',
            'Discount Applied': 'discount_applied',
            'Promo Code Used': 'promo_used',
            'Size': 'size',
            'Color': 'color',
            'Season': 'season'
        }
        
        for source_col, target_col in optional_mappings.items():
            if source_col in df.columns:
                transactions[target_col] = df[source_col]
            else:
                transactions[target_col] = None
        
        return transactions
    
    def _transform_customers(
        self,
        df: pd.DataFrame,
        user_id: str,
        upload_id: str
    ) -> pd.DataFrame:
        """
        Transform to customers collection format
        
        Args:
            df: Cleaned DataFrame
            user_id: User identifier
            upload_id: Upload session ID
            
        Returns:
            Customers DataFrame (aggregated by customer)
        """
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
        
        # Rename columns
        customers.columns = [
            'customer_id', 'age', 'gender', 'location',
            'total_spend', 'purchase_count', 'avg_rating',
            'historical_purchases', 'preferred_payment',
            'purchase_frequency', 'subscription_status'
        ]
        
        # Add metadata
        customers['user_id'] = user_id
        customers['upload_id'] = upload_id
        
        # Convert customer_id to string
        customers['customer_id'] = customers['customer_id'].astype(str)
        
        return customers
    
    def _transform_products(
        self,
        df: pd.DataFrame,
        user_id: str,
        upload_id: str
    ) -> pd.DataFrame:
        """
        Transform to products collection format
        
        Args:
            df: Cleaned DataFrame
            user_id: User identifier
            upload_id: Upload session ID
            
        Returns:
            Products DataFrame (aggregated by product)
        """
        # Aggregate by product
        products = df.groupby('Item Purchased').agg({
            'Category': 'first',
            'Purchase Amount (USD)': 'mean',
            'Customer ID': 'count',
            'Review Rating': ['mean', 'count']
        }).reset_index()
        
        # Flatten column names
        products.columns = [
            'product_name', 'category', 'avg_price',
            'units_sold', 'avg_rating', 'rating_count'
        ]
        
        # Add metadata
        products['product_id'] = products['product_name'].apply(
            lambda x: x.lower().replace(' ', '_')
        )
        products['user_id'] = user_id
        products['upload_id'] = upload_id
        
        # Reorder columns
        products = products[[
            'user_id', 'upload_id', 'product_id', 'product_name',
            'category', 'avg_price', 'units_sold', 'avg_rating', 'rating_count'
        ]]
        
        return products
    
    def validate_source_data(self, df: pd.DataFrame) -> Tuple[bool, List[str]]:
        """
        Validate source data before transformation
        
        Args:
            df: Source DataFrame
            
        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors = []
        warnings = []
        
        # Check required columns
        missing = [col for col in self.required_columns if col not in df.columns]
        if missing:
            errors.append(f"Missing required columns: {missing}")
            return False, errors
        
        # Check row count
        if len(df) < 100:
            warnings.append(f"Warning: Only {len(df)} rows (minimum 100 recommended)")
        
        # Check for duplicates
        duplicates = df.duplicated().sum()
        if duplicates > 0:
            warnings.append(f"Found {duplicates} duplicate rows")
        
        # Check value ranges
        if 'Review Rating' in df.columns:
            if df['Review Rating'].min() < 1 or df['Review Rating'].max() > 5:
                errors.append("Review Rating out of range (1-5)")
        
        if 'Purchase Amount (USD)' in df.columns:
            if (df['Purchase Amount (USD)'] <= 0).any():
                errors.append("Purchase Amount must be > 0")
        
        # Check unique values
        if 'Customer ID' in df.columns:
            unique_customers = df['Customer ID'].nunique()
            if unique_customers < 20:
                warnings.append(f"Only {unique_customers} unique customers (minimum 20 recommended)")
        
        if 'Item Purchased' in df.columns:
            unique_products = df['Item Purchased'].nunique()
            if unique_products < 10:
                warnings.append(f"Only {unique_products} unique products (minimum 10 recommended)")
        
        # Combine errors and warnings
        all_messages = errors + warnings
        is_valid = len(errors) == 0
        
        return is_valid, all_messages
    
    def generate_data_quality_report(
        self, 
        df: pd.DataFrame, 
        transformed: Dict[str, pd.DataFrame]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive data quality report
        
        Args:
            df: Source DataFrame
            transformed: Transformed DataFrames dict
            
        Returns:
            Data quality report dictionary
        """
        report = {
            'source': {
                'total_rows': int(len(df)),
                'total_columns': int(len(df.columns)),
                'unique_customers': int(df['Customer ID'].nunique()),
                'unique_products': int(df['Item Purchased'].nunique()),
                'unique_categories': int(df['Category'].nunique()),
                'price_range': {
                    'min': float(df['Purchase Amount (USD)'].min()),
                    'max': float(df['Purchase Amount (USD)'].max()),
                    'mean': float(df['Purchase Amount (USD)'].mean())
                },
                'rating_range': {
                    'min': float(df['Review Rating'].min()),
                    'max': float(df['Review Rating'].max()),
                    'mean': float(df['Review Rating'].mean())
                }
            },
            'transformed': {
                'transactions': int(len(transformed['transactions'])),
                'customers': int(len(transformed['customers'])),
                'products': int(len(transformed['products']))
            },
            'quality_checks': {
                'missing_values': df.isnull().sum().to_dict(),
                'duplicate_rows': int(df.duplicated().sum())
            }
        }
        
        return report


# Convenience function for quick transformation
def transform_shopping_data(
    df: pd.DataFrame,
    user_id: str,
    upload_id: str
) -> Dict[str, pd.DataFrame]:
    """
    Quick transformation function
    
    Args:
        df: Source DataFrame
        user_id: User identifier
        upload_id: Upload session ID
        
    Returns:
        Transformed DataFrames dict
    """
    mapper = DataMapper()
    return mapper.transform_shopping_trends(df, user_id, upload_id)
