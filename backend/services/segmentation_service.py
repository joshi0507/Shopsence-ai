# -*- coding: utf-8 -*-
"""
Customer Segmentation Service - RFM Analysis + K-Means Clustering

This module implements customer segmentation using:
1. RFM (Recency, Frequency, Monetary) analysis
2. K-Means clustering for segment discovery
3. Segment profiling and naming

Example usage:
    from services.segmentation_service import SegmentationService
    
    service = SegmentationService()
    rfm_df = service.compute_rfm_scores(transactions)
    segmented_df, segment_mapping = service.segment_customers(rfm_df, n_clusters=4)
    summaries = service.get_segment_summary(segmented_df, segment_mapping)
"""

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List, Tuple, Optional
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
    
    def __init__(self, random_state: int = 42):
        """
        Initialize segmentation service
        
        Args:
            random_state: Random seed for reproducibility
        """
        self.random_state = random_state
        self.scaler = StandardScaler()
    
    def compute_rfm_scores(
        self,
        transactions_df: pd.DataFrame,
        reference_date: Optional[datetime] = None
    ) -> pd.DataFrame:
        """
        Calculate RFM scores for each customer

        Args:
            transactions_df: Transactions DataFrame with columns:
                - customer_id
                - date
                - revenue
            reference_date: Date for recency calculation (default: today)

        Returns:
            DataFrame with RFM scores per customer:
                - customer_id
                - recency (days since last purchase)
                - frequency (number of purchases)
                - monetary (total spend)
                - r_score, f_score, m_score (1-5 quintiles)
                - rfm_score (combined score)
        """
        if reference_date is None:
            reference_date = datetime.utcnow()

        logger.info(f"Computing RFM scores for {len(transactions_df)} transactions")

        # Ensure date column is datetime
        if not pd.api.types.is_datetime64_any_dtype(transactions_df['date']):
            transactions_df = transactions_df.copy()
            transactions_df['date'] = pd.to_datetime(transactions_df['date'])

        # Aggregate by customer
        rfm = transactions_df.groupby('customer_id').agg({
            'date': lambda x: (reference_date - x.max()).days,
            'revenue': ['sum', 'count']
        })

        # Flatten column names
        rfm.columns = ['recency', 'monetary', 'frequency']
        rfm = rfm.reset_index()

        # Calculate RFM quintile scores (1-5)
        # For recency, lower is better (recent customers are more valuable)
        rfm['r_score'] = pd.qcut(
            rfm['recency'].rank(method='first'),
            5,
            labels=[5, 4, 3, 2, 1],
            duplicates='drop'
        ).astype(int)

        # For frequency and monetary, higher is better
        rfm['f_score'] = pd.qcut(
            rfm['frequency'].rank(method='first'),
            5,
            labels=[1, 2, 3, 4, 5],
            duplicates='drop'
        ).astype(int)

        rfm['m_score'] = pd.qcut(
            rfm['monetary'].rank(method='first'),
            5,
            labels=[1, 2, 3, 4, 5],
            duplicates='drop'
        ).astype(int)

        # Calculate combined RFM score (weighted)
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
            n_clusters: Number of segments to create (default: 4)
            
        Returns:
            Tuple of:
                - DataFrame with segment_id column added
                - Dict mapping segment_id to segment_name
        """
        logger.info(f"Segmenting {len(rfm_df)} customers into {n_clusters} clusters")
        
        # Prepare features (use raw values, not scores)
        features = rfm_df[['recency', 'frequency', 'monetary']].copy()
        
        # Handle any infinite or NaN values
        features = features.replace([np.inf, -np.inf], np.nan)
        features = features.fillna(features.median())
        
        # Scale features
        scaled_features = self.scaler.fit_transform(features)
        
        # Apply K-Means
        kmeans = KMeans(
            n_clusters=n_clusters,
            random_state=self.random_state,
            n_init=10,
            max_iter=300
        )
        rfm_df = rfm_df.copy()
        rfm_df['segment_id'] = kmeans.fit_predict(scaled_features)
        
        # Profile segments and assign names
        segment_mapping = self._profile_segments(rfm_df)
        
        logger.info(f"Created segments: {segment_mapping}")
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
        
        # Calculate medians for comparison
        median_recency = segment_stats['recency'].median()
        median_frequency = segment_stats['frequency'].median()
        median_monetary = segment_stats['monetary'].median()
        
        for _, row in segment_stats.iterrows():
            segment_id = int(row['segment_id'])
            
            # Determine segment type based on characteristics
            is_recent = row['recency'] < median_recency
            is_frequent = row['frequency'] > median_frequency
            is_high_value = row['monetary'] > median_monetary
            
            if is_recent and is_frequent and is_high_value:
                name = self.SEGMENT_NAMES['champions']
            elif is_frequent and not is_high_value:
                name = self.SEGMENT_NAMES['loyal']
            elif not is_frequent and is_high_value:
                name = self.SEGMENT_NAMES['big_spender']
            elif not is_recent:
                name = self.SEGMENT_NAMES['at_risk']
            elif is_recent and not is_frequent:
                name = self.SEGMENT_NAMES['value_seeker']
            elif row['recency'] < 30:
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
            
            # Calculate average order value
            avg_order_value = (
                segment_data['monetary'].mean() / 
                segment_data['frequency'].mean()
            ) if segment_data['frequency'].mean() > 0 else 0
            
            summary = {
                'segment_id': segment_id,
                'segment_name': segment_name,
                'customer_count': int(len(segment_data)),
                'total_revenue': float(segment_data['monetary'].sum()),
                'avg_order_value': float(avg_order_value),
                'characteristics': {
                    'avg_recency': float(segment_data['recency'].mean()),
                    'avg_frequency': float(segment_data['frequency'].mean()),
                    'avg_monetary': float(segment_data['monetary'].mean()),
                    'avg_rfm_score': float(segment_data['rfm_score'].mean())
                },
                'size_percentage': float(
                    len(segment_data) / len(rfm_df) * 100
                )
            }
            
            summaries.append(summary)
        
        # Sort by total revenue
        summaries.sort(key=lambda x: x['total_revenue'], reverse=True)
        
        return summaries
    
    def get_segment_customers(
        self,
        rfm_df: pd.DataFrame,
        segment_id: int,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Get customers in a specific segment with pagination
        
        Args:
            rfm_df: DataFrame with segment assignments
            segment_id: Target segment ID
            page: Page number (1-indexed)
            limit: Results per page
            
        Returns:
            Tuple of (customer list, total count)
        """
        segment_data = rfm_df[rfm_df['segment_id'] == segment_id]
        total = len(segment_data)
        
        # Paginate
        start = (page - 1) * limit
        end = start + limit
        page_data = segment_data.iloc[start:end]
        
        customers = []
        for _, row in page_data.iterrows():
            customers.append({
                'customer_id': str(row['customer_id']),
                'rfm_scores': {
                    'recency': int(row['r_score']),
                    'frequency': int(row['f_score']),
                    'monetary': int(row['m_score'])
                },
                'total_purchases': int(row['frequency']),
                'total_spend': float(row['monetary']),
                'rfm_score': int(row['rfm_score'])
            })
        
        return customers, total
    
    def get_segment_visualization_data(
        self,
        rfm_df: pd.DataFrame,
        segment_mapping: Dict[int, str]
    ) -> Dict[str, Any]:
        """
        Prepare data for segment visualization
        
        Args:
            rfm_df: DataFrame with segment assignments
            segment_mapping: Segment name mapping
            
        Returns:
            Dict with labels, values, and colors for charts
        """
        summaries = self.get_segment_summary(rfm_df, segment_mapping)
        
        # Color palette for segments
        colors = [
            '#00F0FF',  # Cyan - Champions
            '#7000FF',  # Purple - Loyal
            '#FF00AA',  # Pink - Big Spenders
            '#0066FF',  # Blue - At Risk
            '#00FF88',  # Green - Value Seekers
            '#FFD700',  # Gold - New
            '#FF6B00',  # Orange - Promising
            '#FF6D6D'   # Red - Lost
        ]
        
        return {
            'labels': [s['segment_name'] for s in summaries],
            'values': [s['customer_count'] for s in summaries],
            'revenues': [s['total_revenue'] for s in summaries],
            'colors': colors[:len(summaries)],
            'percentages': [s['size_percentage'] for s in summaries]
        }


# Convenience function
def segment_customers(
    transactions_df: pd.DataFrame,
    n_clusters: int = 4
) -> Tuple[pd.DataFrame, Dict[int, str], List[Dict[str, Any]]]:
    """
    Quick segmentation function
    
    Args:
        transactions_df: Transactions DataFrame
        n_clusters: Number of segments
        
    Returns:
        Tuple of (segmented_df, segment_mapping, summaries)
    """
    service = SegmentationService()
    rfm_df = service.compute_rfm_scores(transactions_df)
    segmented_df, segment_mapping = service.segment_customers(rfm_df, n_clusters)
    summaries = service.get_segment_summary(segmented_df, segment_mapping)
    return segmented_df, segment_mapping, summaries
