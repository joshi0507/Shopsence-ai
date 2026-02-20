# -*- coding: utf-8 -*-
"""
Sales Data Model - MongoDB Sales Data Collection

Handles storage and retrieval of sales data.
"""

from datetime import datetime
from bson.objectid import ObjectId
from typing import Optional, Dict, Any, List
import pandas as pd


class SalesData:
    """Sales data model for MongoDB operations."""
    
    COLLECTION_NAME = 'sales_data'
    
    def __init__(self, db):
        """
        Initialize SalesData model.
        
        Args:
            db: MongoDB database connection.
        """
        self.db = db
        self.collection = db[self.COLLECTION_NAME]
        
        # Create indexes for efficient queries
        self.collection.create_index('upload_id')
        self.collection.create_index('user_id')
        self.collection.create_index('product_name')
        self.collection.create_index('date')
        self.collection.create_index([('user_id', 1), ('date', -1)])
    
    def insert_many(
        self,
        user_id: str,
        upload_id: str,
        data: List[Dict[str, Any]]
    ) -> int:
        """
        Insert multiple sales records.
        
        Args:
            user_id: User ObjectId as string.
            upload_id: Associated upload session ID.
            data: List of sales records.
        
        Returns:
            int: Number of records inserted.
        """
        if not data:
            return 0
        
        # Add metadata to each record
        records = []
        for record in data:
            processed_record = {
                'user_id': ObjectId(user_id),
                'upload_id': upload_id,
                'product_name': record.get('product_name', ''),
                'date': self._parse_date(record.get('date')),
                'units_sold': int(record.get('units_sold', 0)),
                'price': float(record.get('price', 0)),
                'revenue': float(record.get('units_sold', 0)) * float(record.get('price', 0)),
                'category': record.get('category', 'Uncategorized'),
                'created_at': datetime.utcnow()
            }
            records.append(processed_record)
        
        result = self.collection.insert_many(records)
        return len(result.inserted_ids)
    
    def find_by_upload_id(self, upload_id: str) -> List[Dict[str, Any]]:
        """
        Find all sales data for an upload.
        
        Args:
            upload_id: Upload session identifier.
        
        Returns:
            list: List of sales records.
        """
        cursor = self.collection.find({'upload_id': upload_id})
        return list(cursor)
    
    def find_by_user(self, user_id: str, limit: int = 10000) -> List[Dict[str, Any]]:
        """
        Find sales data for a user.
        
        Args:
            user_id: User ObjectId as string.
            limit: Maximum number of records.
        
        Returns:
            list: List of sales records.
        """
        cursor = self.collection.find(
            {'user_id': ObjectId(user_id)}
        ).sort('date', -1).limit(limit)
        
        return list(cursor)
    
    def find_by_date_range(
        self,
        user_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """
        Find sales data within a date range.
        
        Args:
            user_id: User ObjectId as string.
            start_date: Start date.
            end_date: End date.
        
        Returns:
            list: List of sales records.
        """
        cursor = self.collection.find({
            'user_id': ObjectId(user_id),
            'date': {
                '$gte': start_date,
                '$lte': end_date
            }
        }).sort('date', 1)
        
        return list(cursor)
    
    def get_product_summary(self, user_id: str, upload_id: Optional[str] = None) -> pd.DataFrame:
        """
        Get aggregated product sales summary.
        
        Args:
            user_id: User ObjectId as string.
            upload_id: Optional upload session ID to filter.
        
        Returns:
            pd.DataFrame: Product summary with columns: product_name, units_sold, price, revenue.
        """
        match_stage = {'user_id': ObjectId(user_id)}
        if upload_id:
            match_stage['upload_id'] = upload_id
        
        pipeline = [
            {'$match': match_stage},
            {
                '$group': {
                    '_id': '$product_name',
                    'product_name': {'$first': '$product_name'},
                    'units_sold': {'$sum': '$units_sold'},
                    'price': {'$avg': '$price'},
                    'revenue': {'$sum': '$revenue'},
                    'transactions': {'$sum': 1}
                }
            },
            {'$sort': {'units_sold': -1}}
        ]
        
        results = list(self.collection.aggregate(pipeline))
        
        if not results:
            return pd.DataFrame(columns=['product_name', 'units_sold', 'price', 'revenue'])
        
        df = pd.DataFrame(results)
        df = df.rename(columns={'_id': 'product_id'})
        
        return df[['product_name', 'units_sold', 'price', 'revenue']]
    
    def get_daily_sales(self, user_id: str, upload_id: Optional[str] = None) -> pd.DataFrame:
        """
        Get daily sales aggregation.
        
        Args:
            user_id: User ObjectId as string.
            upload_id: Optional upload session ID to filter.
        
        Returns:
            pd.DataFrame: Daily sales with columns: date, units_sold, revenue.
        """
        match_stage = {'user_id': ObjectId(user_id)}
        if upload_id:
            match_stage['upload_id'] = upload_id
        
        pipeline = [
            {'$match': match_stage},
            {
                '$group': {
                    '_id': '$date',
                    'date': {'$first': '$date'},
                    'units_sold': {'$sum': '$units_sold'},
                    'revenue': {'$sum': '$revenue'},
                    'transactions': {'$sum': 1}
                }
            },
            {'$sort': {'date': 1}}
        ]
        
        results = list(self.collection.aggregate(pipeline))
        
        if not results:
            return pd.DataFrame(columns=['date', 'units_sold', 'revenue'])
        
        df = pd.DataFrame(results)
        df['date'] = pd.to_datetime(df['date'])
        
        return df[['date', 'units_sold', 'revenue']]
    
    def delete_by_upload_id(self, upload_id: str) -> int:
        """
        Delete all sales data for an upload.
        
        Args:
            upload_id: Upload session identifier.
        
        Returns:
            int: Number of records deleted.
        """
        result = self.collection.delete_many({'upload_id': upload_id})
        return result.deleted_count
    
    def _parse_date(self, date_value) -> datetime:
        """
        Parse various date formats to datetime.
        
        Args:
            date_value: Date value in various formats.
        
        Returns:
            datetime: Parsed datetime object.
        """
        if isinstance(date_value, datetime):
            return date_value
        
        if isinstance(date_value, str):
            # Try common formats
            formats = [
                '%Y-%m-%d',
                '%Y/%m/%d',
                '%d-%m-%Y',
                '%d/%m/%Y',
                '%m-%d-%Y',
                '%m/%d/%Y'
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(date_value, fmt)
                except ValueError:
                    continue
        
        # Default to today if parsing fails
        return datetime.utcnow()
