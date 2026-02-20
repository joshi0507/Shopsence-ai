# ShopSense AI - Analytics Service Tests
"""
Tests for analytics service.
"""

import pytest
import pandas as pd
import numpy as np
from services.analytics_service import AnalyticsService


class TestAnalyticsService:
    """Test analytics service methods."""
    
    @pytest.fixture
    def analytics_service(self):
        """Create analytics service instance."""
        return AnalyticsService()
    
    @pytest.fixture
    def sample_product_df(self):
        """Create sample product data DataFrame."""
        return pd.DataFrame({
            'product_name': ['Product A', 'Product B', 'Product C', 'Product D'],
            'units_sold': [100, 200, 150, 50],
            'price': [10.0, 20.0, 15.0, 25.0],
            'revenue': [1000.0, 4000.0, 2250.0, 1250.0]
        })
    
    @pytest.fixture
    def sample_daily_df(self):
        """Create sample daily sales DataFrame."""
        dates = pd.date_range(start='2024-01-01', periods=30, freq='D')
        return pd.DataFrame({
            'date': dates,
            'units_sold': np.random.randint(50, 200, 30),
            'revenue': np.random.uniform(500, 2000, 30)
        })
    
    def test_analyze_product_performance(self, analytics_service, sample_product_df):
        """Test product performance analysis."""
        result = analytics_service.analyze_product_performance(sample_product_df)
        
        assert 'summary' in result
        assert result['summary']['total_products'] == 4
        assert result['summary']['total_units'] == 500
        assert 'top_performers' in result
        assert 'bottom_performers' in result
    
    def test_analyze_product_performance_empty(self, analytics_service):
        """Test product performance analysis with empty data."""
        empty_df = pd.DataFrame()
        result = analytics_service.analyze_product_performance(empty_df)
        
        assert 'error' not in result
        assert result['summary']['total_products'] == 0
    
    def test_analyze_trends(self, analytics_service, sample_daily_df):
        """Test trend analysis."""
        result = analytics_service.analyze_trends(sample_daily_df)
        
        assert 'trend_direction' in result
        assert 'avg_daily_revenue' in result
        assert 'data_points' in result
        assert result['data_points'] == 30
    
    def test_analyze_trends_empty(self, analytics_service):
        """Test trend analysis with empty data."""
        empty_df = pd.DataFrame(columns=['date', 'units_sold', 'revenue'])
        result = analytics_service.analyze_trends(empty_df)
        
        assert 'error' in result
    
    def test_generate_recommendations(self, analytics_service, sample_product_df):
        """Test recommendation generation."""
        analysis = analytics_service.analyze_product_performance(sample_product_df)
        recommendations = analytics_service.generate_recommendations(analysis)
        
        assert isinstance(recommendations, list)
        assert len(recommendations) > 0
        
        for rec in recommendations:
            assert 'priority' in rec
            assert 'category' in rec
            assert 'recommendation' in rec
    
    def test_generate_recommendations_empty(self, analytics_service):
        """Test recommendations with no data."""
        recommendations = analytics_service.generate_recommendations({'error': 'No data'})
        
        assert len(recommendations) > 0
        assert recommendations[0]['priority'] == 'high'
