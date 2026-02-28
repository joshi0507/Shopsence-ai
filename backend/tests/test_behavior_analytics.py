# ShopSense AI - Behavior Analytics Test Suite

"""
Test suite for ShopSense AI Behavior Analytics module

This module contains comprehensive tests for:
- Data transformation (data_mapper)
- Customer segmentation (segmentation_service)
- Product affinity (affinity_service)
- Sentiment analysis (sentiment_service)
- Persona generation (persona_service)
- Recommendations (recommendation_service)

Run with: pytest tests/test_behavior_analytics.py -v
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any


# ============================================================================
# Fixtures
# ============================================================================

@pytest.fixture
def sample_transactions():
    """Create sample transaction data for testing"""
    np.random.seed(42)
    n_customers = 100
    n_products = 20
    n_transactions = 500
    
    customers = [f"C{i:03d}" for i in range(1, n_customers + 1)]
    products = [f"Product {i}" for i in range(1, n_products + 1)]
    categories = ["Electronics", "Clothing", "Home", "Sports"]
    
    base_date = datetime(2025, 1, 1)
    
    transactions = pd.DataFrame({
        'customer_id': np.random.choice(customers, n_transactions),
        'product_name': np.random.choice(products, n_transactions),
        'category': np.random.choice(categories, n_transactions),
        'date': [base_date + timedelta(days=np.random.randint(0, 365)) for _ in range(n_transactions)],
        'quantity': np.random.randint(1, 5, n_transactions),
        'price': np.random.uniform(10, 500, n_transactions),
        'revenue': np.random.uniform(10, 500, n_transactions) * np.random.randint(1, 5, n_transactions),
        'rating': np.random.uniform(1, 5, n_transactions)
    })
    
    transactions['revenue'] = transactions['price'] * transactions['quantity']
    
    return transactions


@pytest.fixture
def sample_shopping_trends():
    """Create sample shopping_trends.csv format data"""
    np.random.seed(42)
    n_rows = 500
    
    items = ['Blouse', 'Sweater', 'Jeans', 'Sandals', 'Sneakers', 'Shirt', 
             'Shorts', 'Coat', 'Handbag', 'Shoes', 'Dress', 'Skirt']
    categories = ['Clothing', 'Footwear', 'Outerwear', 'Accessories']
    genders = ['Male', 'Female']
    locations = ['California', 'New York', 'Texas', 'Florida', 'Illinois']
    
    data = {
        'Customer ID': np.random.randint(1, 100, n_rows),
        'Age': np.random.randint(18, 70, n_rows),
        'Gender': np.random.choice(genders, n_rows),
        'Item Purchased': np.random.choice(items, n_rows),
        'Category': np.random.choice(categories, n_rows),
        'Purchase Amount (USD)': np.random.uniform(20, 500, n_rows),
        'Location': np.random.choice(locations, n_rows),
        'Review Rating': np.random.uniform(2.5, 5.0, n_rows),
        'Previous Purchases': np.random.randint(0, 20, n_rows),
        'Preferred Payment Method': np.random.choice(['Credit Card', 'PayPal', 'Cash'], n_rows),
        'Frequency of Purchases': np.random.choice(['Weekly', 'Monthly', 'Annually'], n_rows),
        'Subscription Status': np.random.choice(['Yes', 'No'], n_rows),
        'Payment Method': np.random.choice(['Credit Card', 'PayPal', 'Debit Card'], n_rows),
        'Shipping Type': np.random.choice(['Standard', 'Express'], n_rows),
        'Discount Applied': np.random.choice(['None', '10%', '20%'], n_rows),
        'Promo Code Used': np.random.choice(['Yes', 'No'], n_rows),
    }
    
    return pd.DataFrame(data)


# ============================================================================
# Data Mapper Tests
# ============================================================================

class TestDataMapper:
    """Tests for DataMapper class"""
    
    def test_transform_shopping_trends(self, sample_shopping_trends):
        """Test shopping trends transformation"""
        from utils.data_mapper import DataMapper
        
        mapper = DataMapper()
        result = mapper.transform_shopping_trends(
            sample_shopping_trends,
            user_id='user_123',
            upload_id='upload_456'
        )
        
        assert 'transactions' in result
        assert 'customers' in result
        assert 'products' in result
        
        assert len(result['transactions']) == len(sample_shopping_trends)
        assert len(result['customers']) <= len(sample_shopping_trends)
        assert len(result['products']) <= len(sample_shopping_trends)
    
    def test_validate_source_data_valid(self, sample_shopping_trends):
        """Test validation with valid data"""
        from utils.data_mapper import DataMapper
        
        mapper = DataMapper()
        is_valid, messages = mapper.validate_source_data(sample_shopping_trends)
        
        assert is_valid is True
    
    def test_validate_source_data_missing_columns(self):
        """Test validation with missing columns"""
        from utils.data_mapper import DataMapper
        
        mapper = DataMapper()
        df = pd.DataFrame({'wrong_column': [1, 2, 3]})
        is_valid, messages = mapper.validate_source_data(df)
        
        assert is_valid is False
        assert any('Missing required columns' in msg for msg in messages)
    
    def test_clean_data_removes_invalid(self, sample_shopping_trends):
        """Test data cleaning removes invalid rows"""
        from utils.data_mapper import DataMapper
        
        mapper = DataMapper()
        
        # Add invalid data
        sample_shopping_trends.loc[0, 'Purchase Amount (USD)'] = -10
        sample_shopping_trends.loc[1, 'Review Rating'] = 6.0
        
        cleaned = mapper._clean_data(sample_shopping_trends)
        
        assert len(cleaned) < len(sample_shopping_trends)


# ============================================================================
# Segmentation Service Tests
# ============================================================================

class TestSegmentationService:
    """Tests for SegmentationService class"""
    
    def test_compute_rfm_scores(self, sample_transactions):
        """Test RFM score calculation"""
        from services.segmentation_service import SegmentationService
        
        service = SegmentationService()
        rfm_df = service.compute_rfm_scores(sample_transactions)
        
        assert len(rfm_df) > 0
        assert 'recency' in rfm_df.columns
        assert 'frequency' in rfm_df.columns
        assert 'monetary' in rfm_df.columns
        assert 'r_score' in rfm_df.columns
        assert 'f_score' in rfm_df.columns
        assert 'm_score' in rfm_df.columns
        assert 'rfm_score' in rfm_df.columns
    
    def test_segment_customers(self, sample_transactions):
        """Test customer segmentation"""
        from services.segmentation_service import SegmentationService
        
        service = SegmentationService()
        rfm_df = service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = service.segment_customers(rfm_df, n_clusters=4)
        
        assert 'segment_id' in segmented_df.columns
        assert len(segment_mapping) == 4
        assert all(isinstance(k, int) for k in segment_mapping.keys())
    
    def test_get_segment_summary(self, sample_transactions):
        """Test segment summary generation"""
        from services.segmentation_service import SegmentationService
        
        service = SegmentationService()
        rfm_df = service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = service.segment_customers(rfm_df, n_clusters=4)
        summaries = service.get_segment_summary(segmented_df, segment_mapping)
        
        assert len(summaries) == 4
        
        for summary in summaries:
            assert 'segment_id' in summary
            assert 'segment_name' in summary
            assert 'customer_count' in summary
            assert 'total_revenue' in summary
            assert 'characteristics' in summary
    
    def test_get_segment_visualization_data(self, sample_transactions):
        """Test visualization data generation"""
        from services.segmentation_service import SegmentationService
        
        service = SegmentationService()
        rfm_df = service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = service.segment_customers(rfm_df, n_clusters=4)
        viz_data = service.get_segment_visualization_data(segmented_df, segment_mapping)
        
        assert 'labels' in viz_data
        assert 'values' in viz_data
        assert 'colors' in viz_data
        assert len(viz_data['labels']) == len(viz_data['values'])


# ============================================================================
# Affinity Service Tests
# ============================================================================

class TestAffinityService:
    """Tests for AffinityService class"""
    
    def test_create_basket_matrix(self, sample_transactions):
        """Test basket matrix creation"""
        from services.affinity_service import AffinityService
        
        service = AffinityService()
        basket = service.create_basket_matrix(sample_transactions)
        
        assert basket.shape[0] > 0  # customers
        assert basket.shape[1] > 0  # products
        assert basket.isin([0, 1]).all().all()  # binary values
    
    def test_find_frequent_itemsets(self, sample_transactions):
        """Test frequent itemset mining"""
        from services.affinity_service import AffinityService
        
        service = AffinityService()
        basket = service.create_basket_matrix(sample_transactions)
        itemsets = service.find_frequent_itemsets(basket, min_support=0.05)
        
        # May return empty DataFrame if no frequent itemsets found
        assert isinstance(itemsets, pd.DataFrame)
        
        if not itemsets.empty:
            assert 'support' in itemsets.columns
            assert 'itemsets' in itemsets.columns
    
    def test_generate_association_rules(self, sample_transactions):
        """Test association rule generation"""
        from services.affinity_service import AffinityService
        
        service = AffinityService()
        basket = service.create_basket_matrix(sample_transactions)
        itemsets = service.find_frequent_itemsets(basket, min_support=0.05)
        
        if not itemsets.empty:
            rules = service.generate_association_rules(
                itemsets, 
                min_confidence=0.3,
                min_lift=1.5
            )
            
            if not rules.empty:
                assert 'antecedents' in rules.columns
                assert 'consequents' in rules.columns
                assert 'lift' in rules.columns
                assert 'confidence' in rules.columns
    
    def test_build_affinity_network(self, sample_transactions):
        """Test affinity network generation"""
        from services.affinity_service import AffinityService
        
        service = AffinityService()
        basket = service.create_basket_matrix(sample_transactions)
        itemsets = service.find_frequent_itemsets(basket, min_support=0.05)
        rules = service.generate_association_rules(itemsets) if not itemsets.empty else pd.DataFrame()
        network = service.build_affinity_network(rules, sample_transactions)
        
        assert 'nodes' in network
        assert 'links' in network
        assert isinstance(network['nodes'], list)
        assert isinstance(network['links'], list)


# ============================================================================
# Sentiment Service Tests
# ============================================================================

class TestSentimentService:
    """Tests for SentimentService class"""
    
    def test_calculate_sentiment_scores(self, sample_transactions):
        """Test sentiment score calculation"""
        from services.sentiment_service import SentimentService
        
        service = SentimentService()
        sentiment_df = service.calculate_sentiment_scores(sample_transactions)
        
        assert 'sentiment_score' in sentiment_df.columns
        assert 'sentiment_label' in sentiment_df.columns
        assert sentiment_df['sentiment_score'].between(0, 100).all()
        assert set(sentiment_df['sentiment_label'].unique()).issubset(
            {'Positive', 'Neutral', 'Negative'}
        )
    
    def test_get_overview(self, sample_transactions):
        """Test sentiment overview"""
        from services.sentiment_service import SentimentService
        
        service = SentimentService()
        sentiment_df = service.calculate_sentiment_scores(sample_transactions)
        overview = service.get_overview(sentiment_df)
        
        assert 'overall_score' in overview
        assert 'average_rating' in overview
        assert 'total_reviews' in overview
        assert 'distribution' in overview
        assert 'percentages' in overview
        
        assert 0 <= overview['overall_score'] <= 100
        assert overview['total_reviews'] == len(sample_transactions)
    
    def test_get_by_category(self, sample_transactions):
        """Test sentiment by category"""
        from services.sentiment_service import SentimentService
        
        service = SentimentService()
        sentiment_df = service.calculate_sentiment_scores(sample_transactions)
        by_category = service.get_by_category(sentiment_df)
        
        assert isinstance(by_category, list)
        
        if by_category:
            category = by_category[0]
            assert 'category' in category
            assert 'sentiment_score' in category
            assert 'avg_rating' in category
    
    def test_extract_keywords(self, sample_transactions):
        """Test keyword extraction"""
        from services.sentiment_service import SentimentService
        
        service = SentimentService()
        keywords = service.extract_keywords(sample_transactions)
        
        assert 'positive_keywords' in keywords
        assert 'negative_keywords' in keywords
        assert isinstance(keywords['positive_keywords'], list)
        assert isinstance(keywords['negative_keywords'], list)


# ============================================================================
# Persona Service Tests
# ============================================================================

class TestPersonaService:
    """Tests for PersonaService class"""
    
    def test_generate_personas(self, sample_transactions):
        """Test persona generation"""
        from services.segmentation_service import SegmentationService
        from services.persona_service import PersonaService
        
        # First create segments
        seg_service = SegmentationService()
        rfm_df = seg_service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = seg_service.segment_customers(rfm_df, n_clusters=4)
        
        # Generate personas
        persona_service = PersonaService()
        personas = persona_service.generate_personas(
            segmented_df, 
            segment_mapping,
            sample_transactions
        )
        
        assert len(personas) == len(segment_mapping)
        
        for persona in personas:
            assert 'persona_id' in persona
            assert 'name' in persona
            assert 'role' in persona
            assert 'description' in persona
            assert 'demographics' in persona
            assert 'behavior' in persona
            assert 'preferences' in persona


# ============================================================================
# Recommendation Service Tests
# ============================================================================

class TestRecommendationService:
    """Tests for RecommendationService class"""
    
    def test_generate_recommendations(self, sample_transactions):
        """Test recommendation generation"""
        from services.segmentation_service import SegmentationService
        from services.affinity_service import AffinityService
        from services.sentiment_service import SentimentService
        from services.recommendation_service import RecommendationService
        
        # Generate all required data
        seg_service = SegmentationService()
        rfm_df = seg_service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = seg_service.segment_customers(rfm_df, n_clusters=4)
        segments = seg_service.get_segment_summary(segmented_df, segment_mapping)
        
        aff_service = AffinityService()
        basket = aff_service.create_basket_matrix(sample_transactions)
        itemsets = aff_service.find_frequent_itemsets(basket, min_support=0.05)
        rules = aff_service.generate_association_rules(itemsets) if not itemsets.empty else pd.DataFrame()
        bundles = aff_service.suggest_bundles(rules) if not rules.empty else []
        
        sent_service = SentimentService()
        sentiment_df = sent_service.calculate_sentiment_scores(sample_transactions)
        sentiment_overview = sent_service.get_overview(sentiment_df)
        
        # Generate recommendations
        rec_service = RecommendationService()
        rules_list = [
            {
                'antecedents': str(row['antecedents']),
                'consequents': str(row['consequents']),
                'support': float(row['support']),
                'confidence': float(row['confidence']),
                'lift': float(row['lift'])
            }
            for _, row in rules.iterrows()
        ] if not rules.empty else []
        
        recommendations = rec_service.generate_recommendations(
            segments, rules_list, sentiment_overview, bundles
        )
        
        assert isinstance(recommendations, list)
        
        if recommendations:
            rec = recommendations[0]
            assert 'id' in rec
            assert 'category' in rec
            assert 'title' in rec
            assert 'priority' in rec
            assert rec['priority'] in ['High', 'Medium', 'Low']
    
    def test_get_recommendation_summary(self):
        """Test recommendation summary"""
        from services.recommendation_service import RecommendationService
        
        service = RecommendationService()
        
        recommendations = [
            {'priority': 'High', 'category': 'Marketing'},
            {'priority': 'High', 'category': 'Merchandising'},
            {'priority': 'Medium', 'category': 'Marketing'},
            {'priority': 'Low', 'category': 'Product'},
        ]
        
        summary = service.get_recommendation_summary(recommendations)
        
        assert summary['total'] == 4
        assert summary['high_priority'] == 2
        assert summary['medium_priority'] == 1
        assert summary['low_priority'] == 1


# ============================================================================
# Integration Tests
# ============================================================================

class TestIntegration:
    """Integration tests for complete behavior analytics pipeline"""
    
    def test_full_pipeline(self, sample_shopping_trends):
        """Test complete behavior analytics pipeline"""
        from utils.data_mapper import DataMapper
        from services.segmentation_service import SegmentationService
        from services.affinity_service import AffinityService
        from services.sentiment_service import SentimentService
        from services.persona_service import PersonaService
        from services.recommendation_service import RecommendationService
        
        # 1. Transform data
        mapper = DataMapper()
        transformed = mapper.transform_shopping_trends(
            sample_shopping_trends,
            user_id='user_123',
            upload_id='upload_456'
        )
        
        transactions = transformed['transactions']
        
        # 2. Segmentation
        seg_service = SegmentationService()
        rfm_df = seg_service.compute_rfm_scores(transactions)
        segmented_df, segment_mapping = seg_service.segment_customers(rfm_df, n_clusters=4)
        segments = seg_service.get_segment_summary(segmented_df, segment_mapping)
        
        # 3. Affinity
        aff_service = AffinityService()
        basket = aff_service.create_basket_matrix(transactions)
        itemsets = aff_service.find_frequent_itemsets(basket, min_support=0.05)
        rules = aff_service.generate_association_rules(itemsets) if not itemsets.empty else pd.DataFrame()
        bundles = aff_service.suggest_bundles(rules) if not rules.empty else []
        
        # 4. Sentiment
        sent_service = SentimentService()
        sentiment_df = sent_service.calculate_sentiment_scores(transactions)
        sentiment_overview = sent_service.get_overview(sentiment_df)
        
        # 5. Personas
        persona_service = PersonaService()
        personas = persona_service.generate_personas(
            segmented_df, segment_mapping, sample_shopping_trends
        )
        
        # 6. Recommendations
        rec_service = RecommendationService()
        rules_list = [
            {
                'antecedents': str(row['antecedents']),
                'consequents': str(row['consequents']),
                'support': float(row['support']),
                'confidence': float(row['confidence']),
                'lift': float(row['lift'])
            }
            for _, row in rules.iterrows()
        ] if not rules.empty else []
        
        recommendations = rec_service.generate_recommendations(
            segments, rules_list, sentiment_overview, bundles
        )
        
        # Assertions
        assert len(segments) == 4
        assert len(personas) == 4
        assert isinstance(recommendations, list)
        assert sentiment_overview['total_reviews'] > 0


# ============================================================================
# Run Tests
# ============================================================================

if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
