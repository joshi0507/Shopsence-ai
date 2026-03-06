# -*- coding: utf-8 -*-
"""
Comprehensive Test Suite for Behavior Analytics

This module contains unit tests, integration tests, and end-to-end tests
for the Shopper Behavior Analytics module including:
- Customer Segmentation (RFM + K-Means)
- Product Affinity (Apriori Algorithm)
- Sentiment Analysis
- Persona Generation
- Recommendations
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from unittest.mock import Mock, MagicMock, patch
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.data_mapper import DataMapper
from services.segmentation_service import SegmentationService
from services.affinity_service import AffinityService
from services.sentiment_service import SentimentService
from services.persona_service import PersonaService
from services.recommendation_service import RecommendationService


# =============================================================================
# Test Fixtures
# =============================================================================

@pytest.fixture
def sample_transactions():
    """Create sample transaction data for testing"""
    np.random.seed(42)
    n_rows = 100
    
    dates = [datetime.now() - timedelta(days=np.random.randint(0, 365)) for _ in range(n_rows)]
    
    return pd.DataFrame({
        'transaction_id': [f'TXN{i:04d}' for i in range(n_rows)],
        'customer_id': [f'CUST{np.random.randint(1, 20):03d}' for _ in range(n_rows)],
        'product_name': np.random.choice(['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones'], n_rows),
        'category': np.random.choice(['Electronics', 'Accessories', 'Peripherals'], n_rows),
        'quantity': np.random.randint(1, 5, n_rows),
        'unit_price': np.random.uniform(10, 1000, n_rows),
        'total_amount': np.random.uniform(10, 2000, n_rows),
        'discount': np.random.uniform(0, 0.3, n_rows),
        'rating': np.random.randint(1, 6, n_rows),
        'review': np.random.choice([
            'Great product!', 'Excellent quality', 'Good value', 
            'Average', 'Could be better', 'Disappointed', None
        ], n_rows),
        'transaction_date': dates,
        'payment_method': np.random.choice(['Credit Card', 'Debit Card', 'PayPal'], n_rows),
        'shipping_method': np.random.choice(['Standard', 'Express', 'Next Day'], n_rows)
    })


@pytest.fixture
def sample_customers():
    """Create sample customer data for testing"""
    return pd.DataFrame({
        'customer_id': [f'CUST{i:03d}' for i in range(1, 21)],
        'age': np.random.randint(18, 70, 20),
        'gender': np.random.choice(['M', 'F', 'Other'], 20),
        'location': np.random.choice(['New York', 'Los Angeles', 'Chicago', 'Houston'], 20),
        'occupation': np.random.choice(['Engineer', 'Teacher', 'Doctor', 'Student'], 20),
        'income': np.random.randint(30000, 150000, 20)
    })


@pytest.fixture
def data_mapper():
    """Create DataMapper instance"""
    return DataMapper()


@pytest.fixture
def segmentation_service():
    """Create SegmentationService instance"""
    return SegmentationService()


@pytest.fixture
def affinity_service():
    """Create AffinityService instance"""
    return AffinityService()


@pytest.fixture
def sentiment_service():
    """Create SentimentService instance"""
    return SentimentService()


@pytest.fixture
def persona_service():
    """Create PersonaService instance"""
    return PersonaService()


@pytest.fixture
def recommendation_service():
    """Create RecommendationService instance"""
    return RecommendationService()


# =============================================================================
# TestDataMapper Tests
# =============================================================================

class TestDataMapper:
    """Test DataMapper transformation functionality"""
    
    def test_transform_shopping_trends(self, data_mapper, sample_transactions):
        """Test transformation of shopping trends data"""
        result = data_mapper.transform_shopping_trends(sample_transactions)
        
        assert result is not None
        assert 'transaction_id' in result.columns
        assert 'customer_id' in result.columns
        assert 'transaction_date' in result.columns
        assert 'total_amount' in result.columns
    
    def test_transform_shopping_trends_empty(self, data_mapper):
        """Test transformation with empty dataframe"""
        empty_df = pd.DataFrame()
        result = data_mapper.transform_shopping_trends(empty_df)
        
        assert result is not None
        assert len(result) == 0
    
    def test_transform_shopping_trends_missing_columns(self, data_mapper):
        """Test transformation with missing required columns"""
        incomplete_df = pd.DataFrame({
            'customer_id': ['CUST001'],
            'product_name': ['Laptop']
        })
        
        result = data_mapper.transform_shopping_trends(incomplete_df)
        
        assert result is not None
        assert 'transaction_id' in result.columns
    
    def test_validate_dataframe(self, data_mapper, sample_transactions):
        """Test dataframe validation"""
        is_valid, errors = data_mapper.validate_dataframe(
            sample_transactions,
            required_columns=['customer_id', 'product_name', 'total_amount']
        )
        
        assert is_valid is True
        assert len(errors) == 0


# =============================================================================
# TestSegmentationService Tests
# =============================================================================

class TestSegmentationService:
    """Test SegmentationService functionality"""
    
    def test_compute_rfm_scores(self, segmentation_service, sample_transactions):
        """Test RFM score computation"""
        rfm_df = segmentation_service.compute_rfm_scores(sample_transactions)
        
        assert rfm_df is not None
        assert len(rfm_df) > 0
        assert 'recency' in rfm_df.columns
        assert 'frequency' in rfm_df.columns
        assert 'monetary' in rfm_df.columns
    
    def test_segment_customers(self, segmentation_service, sample_transactions):
        """Test customer segmentation"""
        rfm_df = segmentation_service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(
            rfm_df, n_clusters=4
        )
        
        assert segmented_df is not None
        assert len(segmented_df) > 0
        assert 'segment_id' in segmented_df.columns
        assert isinstance(segment_mapping, dict)
        assert len(segment_mapping) == 4
    
    def test_get_segment_summary(self, segmentation_service, sample_transactions):
        """Test segment summary generation"""
        rfm_df = segmentation_service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(rfm_df)
        summaries = segmentation_service.get_segment_summary(segmented_df, segment_mapping)
        
        assert summaries is not None
        assert isinstance(summaries, list)
        assert len(summaries) > 0
        
        for summary in summaries:
            assert 'segment_id' in summary
            assert 'segment_name' in summary
            assert 'customer_count' in summary
    
    def test_get_segment_visualization_data(self, segmentation_service, sample_transactions):
        """Test segment visualization data"""
        rfm_df = segmentation_service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(rfm_df)
        viz_data = segmentation_service.get_segment_visualization_data(
            segmented_df, segment_mapping
        )
        
        assert viz_data is not None
        assert 'nodes' in viz_data or 'segments' in viz_data
    
    def test_segment_customers_invalid_clusters(self, segmentation_service, sample_transactions):
        """Test segmentation with invalid cluster count"""
        rfm_df = segmentation_service.compute_rfm_scores(sample_transactions)
        
        # Test with too few clusters
        segmented_df, segment_mapping = segmentation_service.segment_customers(
            rfm_df, n_clusters=1
        )
        
        assert segmented_df is not None
    
    def test_compute_rfm_empty_transactions(self, segmentation_service):
        """Test RFM computation with empty transactions"""
        empty_df = pd.DataFrame()
        rfm_df = segmentation_service.compute_rfm_scores(empty_df)
        
        assert rfm_df is not None
        assert len(rfm_df) == 0


# =============================================================================
# TestAffinityService Tests
# =============================================================================

class TestAffinityService:
    """Test AffinityService functionality"""
    
    def test_create_basket_matrix(self, affinity_service, sample_transactions):
        """Test basket matrix creation"""
        basket = affinity_service.create_basket_matrix(sample_transactions)
        
        assert basket is not None
        assert len(basket) > 0
    
    def test_find_frequent_itemsets(self, affinity_service, sample_transactions):
        """Test frequent itemset mining"""
        basket = affinity_service.create_basket_matrix(sample_transactions)
        itemsets = affinity_service.find_frequent_itemsets(basket, min_support=0.05)
        
        assert itemsets is not None
        assert len(itemsets) >= 0
    
    def test_generate_association_rules(self, affinity_service, sample_transactions):
        """Test association rule generation"""
        basket = affinity_service.create_basket_matrix(sample_transactions)
        itemsets = affinity_service.find_frequent_itemsets(basket, min_support=0.05)
        
        if len(itemsets) > 0:
            rules = affinity_service.generate_association_rules(
                itemsets, min_confidence=0.3, min_lift=1.5
            )
            
            assert rules is not None
    
    def test_suggest_bundles(self, affinity_service, sample_transactions):
        """Test bundle suggestion"""
        basket = affinity_service.create_basket_matrix(sample_transactions)
        itemsets = affinity_service.find_frequent_itemsets(basket, min_support=0.05)
        rules = affinity_service.generate_association_rules(itemsets)
        bundles = affinity_service.suggest_bundles(rules)
        
        assert bundles is not None
        assert isinstance(bundles, list)
    
    def test_build_affinity_network(self, affinity_service, sample_transactions):
        """Test affinity network building"""
        basket = affinity_service.create_basket_matrix(sample_transactions)
        itemsets = affinity_service.find_frequent_itemsets(basket, min_support=0.05)
        rules = affinity_service.generate_association_rules(itemsets)
        network = affinity_service.build_affinity_network(rules, sample_transactions)
        
        assert network is not None
        assert 'nodes' in network or 'links' in network
    
    def test_frozenset_to_string(self, affinity_service):
        """Test frozenset to string conversion"""
        test_set = frozenset(['item1', 'item2'])
        result = affinity_service._frozerset_to_string(test_set)
        
        assert isinstance(result, str)
        assert 'item1' in result or 'item2' in result
    
    def test_create_basket_matrix_empty(self, affinity_service):
        """Test basket matrix with empty transactions"""
        empty_df = pd.DataFrame()
        basket = affinity_service.create_basket_matrix(empty_df)
        
        assert basket is not None


# =============================================================================
# TestSentimentService Tests
# =============================================================================

class TestSentimentService:
    """Test SentimentService functionality"""
    
    def test_calculate_sentiment_scores(self, sentiment_service, sample_transactions):
        """Test sentiment score calculation"""
        sentiment_df = sentiment_service.calculate_sentiment_scores(sample_transactions)
        
        assert sentiment_df is not None
        assert len(sentiment_df) > 0
        assert 'sentiment_score' in sentiment_df.columns
    
    def test_get_overview(self, sentiment_service, sample_transactions):
        """Test sentiment overview"""
        sentiment_df = sentiment_service.calculate_sentiment_scores(sample_transactions)
        overview = sentiment_service.get_overview(sentiment_df)
        
        assert overview is not None
        assert 'overall_score' in overview
        assert 'distribution' in overview
    
    def test_get_by_category(self, sentiment_service, sample_transactions):
        """Test sentiment by category"""
        sentiment_df = sentiment_service.calculate_sentiment_scores(sample_transactions)
        by_category = sentiment_service.get_by_category(sentiment_df)
        
        assert by_category is not None
        assert isinstance(by_category, list) or isinstance(by_category, dict)
    
    def test_extract_keywords(self, sentiment_service, sample_transactions):
        """Test keyword extraction"""
        keywords = sentiment_service.extract_keywords(sample_transactions)
        
        assert keywords is not None
        assert 'positive' in keywords or 'negative' in keywords
    
    def test_get_sentiment_gauge_data(self, sentiment_service, sample_transactions):
        """Test sentiment gauge data"""
        sentiment_df = sentiment_service.calculate_sentiment_scores(sample_transactions)
        gauge_data = sentiment_service.get_sentiment_gauge_data(sentiment_df)
        
        assert gauge_data is not None
    
    def test_calculate_sentiment_empty(self, sentiment_service):
        """Test sentiment calculation with empty data"""
        empty_df = pd.DataFrame()
        sentiment_df = sentiment_service.calculate_sentiment_scores(empty_df)
        
        assert sentiment_df is not None
        assert len(sentiment_df) == 0
    
    def test_rating_to_sentiment(self, sentiment_service):
        """Test rating to sentiment conversion"""
        # Test various rating values
        assert sentiment_service._rating_to_sentiment(5) >= 0.8
        assert sentiment_service._rating_to_sentiment(1) <= 0.2
        assert sentiment_service._rating_to_sentiment(3) >= 0.4
    
    def test_extract_keywords_from_reviews(self, sentiment_service, sample_transactions):
        """Test keyword extraction from reviews"""
        # Filter transactions with reviews
        with_reviews = sample_transactions[sample_transactions['review'].notna()]
        
        if len(with_reviews) > 0:
            keywords = sentiment_service.extract_keywords(with_reviews)
            assert keywords is not None


# =============================================================================
# TestPersonaService Tests
# =============================================================================

class TestPersonaService:
    """Test PersonaService functionality"""
    
    def test_generate_personas(self, persona_service, sample_transactions, sample_customers):
        """Test persona generation"""
        segmentation_service = SegmentationService()
        rfm_df = segmentation_service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(rfm_df)
        
        personas = persona_service.generate_personas(
            segmented_df, segment_mapping, sample_customers
        )
        
        assert personas is not None
        assert isinstance(personas, list)
        assert len(personas) > 0
        
        for persona in personas:
            assert 'name' in persona or 'segment_id' in persona
            assert 'description' in persona
    
    def test_generate_personas_no_customers(self, persona_service, sample_transactions):
        """Test persona generation without customer demographics"""
        segmentation_service = SegmentationService()
        rfm_df = segmentation_service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(rfm_df)
        
        # Pass empty customers dataframe
        empty_customers = pd.DataFrame()
        personas = persona_service.generate_personas(
            segmented_df, segment_mapping, empty_customers
        )
        
        assert personas is not None
        assert isinstance(personas, list)


# =============================================================================
# TestRecommendationService Tests
# =============================================================================

class TestRecommendationService:
    """Test RecommendationService functionality"""
    
    def test_generate_recommendations(self, recommendation_service, sample_transactions):
        """Test recommendation generation"""
        # Prepare input data
        segmentation_service = SegmentationService()
        affinity_service = AffinityService()
        sentiment_service = SentimentService()
        
        rfm_df = segmentation_service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(rfm_df)
        segments = segmentation_service.get_segment_summary(segmented_df, segment_mapping)
        
        basket = affinity_service.create_basket_matrix(sample_transactions)
        itemsets = affinity_service.find_frequent_itemsets(basket)
        rules = affinity_service.generate_association_rules(itemsets)
        
        rules_list = [
            {
                'antecedents': str(rule['antecedents']),
                'consequents': str(rule['consequents']),
                'support': float(rule['support']),
                'confidence': float(rule['confidence']),
                'lift': float(rule['lift'])
            }
            for _, rule in rules.iterrows()
        ] if len(rules) > 0 else []
        
        sentiment_df = sentiment_service.calculate_sentiment_scores(sample_transactions)
        sentiment_overview = sentiment_service.get_overview(sentiment_df)
        sentiment_data = {
            'overall_score': sentiment_overview['overall_score'],
            'by_category': [],
            'distribution': sentiment_overview['distribution']
        }
        
        bundles = affinity_service.suggest_bundles(rules)
        
        # Generate recommendations
        recommendations = recommendation_service.generate_recommendations(
            segments, rules_list, sentiment_data, bundles
        )
        
        assert recommendations is not None
        assert isinstance(recommendations, list)
        
        if len(recommendations) > 0:
            rec = recommendations[0]
            assert 'title' in rec or 'description' in rec
            assert 'category' in rec
            assert 'priority' in rec
    
    def test_get_recommendation_summary(self, recommendation_service):
        """Test recommendation summary"""
        sample_recs = [
            {'category': 'Merchandising', 'priority': 'High'},
            {'category': 'Marketing', 'priority': 'Medium'},
            {'category': 'Merchandising', 'priority': 'Low'}
        ]
        
        summary = recommendation_service.get_recommendation_summary(sample_recs)
        
        assert summary is not None
        assert 'total' in summary
        assert 'by_category' in summary or 'by_priority' in summary


# =============================================================================
# TestIntegration Tests
# =============================================================================

class TestIntegration:
    """Integration tests for behavior analytics pipeline"""
    
    def test_full_segmentation_pipeline(self, sample_transactions):
        """Test complete segmentation pipeline"""
        segmentation_service = SegmentationService()
        
        # Compute RFM
        rfm_df = segmentation_service.compute_rfm_scores(sample_transactions)
        assert len(rfm_df) > 0
        
        # Segment customers
        segmented_df, segment_mapping = segmentation_service.segment_customers(rfm_df)
        assert len(segmented_df) > 0
        
        # Get summary
        summaries = segmentation_service.get_segment_summary(segmented_df, segment_mapping)
        assert len(summaries) > 0
    
    def test_full_affinity_pipeline(self, sample_transactions):
        """Test complete affinity pipeline"""
        affinity_service = AffinityService()
        
        # Create basket
        basket = affinity_service.create_basket_matrix(sample_transactions)
        assert basket is not None
        
        # Find itemsets
        itemsets = affinity_service.find_frequent_itemsets(basket)
        assert itemsets is not None
        
        # Generate rules
        rules = affinity_service.generate_association_rules(itemsets)
        assert rules is not None
        
        # Suggest bundles
        bundles = affinity_service.suggest_bundles(rules)
        assert isinstance(bundles, list)
    
    def test_full_sentiment_pipeline(self, sample_transactions):
        """Test complete sentiment pipeline"""
        sentiment_service = SentimentService()
        
        # Calculate scores
        sentiment_df = sentiment_service.calculate_sentiment_scores(sample_transactions)
        assert len(sentiment_df) > 0
        
        # Get overview
        overview = sentiment_service.get_overview(sentiment_df)
        assert 'overall_score' in overview
        
        # Get by category
        by_category = sentiment_service.get_by_category(sentiment_df)
        assert by_category is not None
    
    def test_full_behavior_analytics_pipeline(self, sample_transactions, sample_customers):
        """Test complete behavior analytics pipeline"""
        # Initialize all services
        segmentation_service = SegmentationService()
        affinity_service = AffinityService()
        sentiment_service = SentimentService()
        persona_service = PersonaService()
        recommendation_service = RecommendationService()
        
        # Segmentation
        rfm_df = segmentation_service.compute_rfm_scores(sample_transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(rfm_df)
        segments = segmentation_service.get_segment_summary(segmented_df, segment_mapping)
        
        # Affinity
        basket = affinity_service.create_basket_matrix(sample_transactions)
        itemsets = affinity_service.find_frequent_itemsets(basket)
        rules = affinity_service.generate_association_rules(itemsets)
        bundles = affinity_service.suggest_bundles(rules)
        
        # Sentiment
        sentiment_df = sentiment_service.calculate_sentiment_scores(sample_transactions)
        sentiment_overview = sentiment_service.get_overview(sentiment_df)
        sentiment_data = {
            'overall_score': sentiment_overview['overall_score'],
            'by_category': [],
            'distribution': sentiment_overview['distribution']
        }
        
        # Personas
        personas = persona_service.generate_personas(
            segmented_df, segment_mapping, sample_customers
        )
        
        # Recommendations
        rules_list = [
            {
                'antecedents': str(rule['antecedents']),
                'consequents': str(rule['consequents']),
                'support': float(rule['support']),
                'confidence': float(rule['confidence']),
                'lift': float(rule['lift'])
            }
            for _, rule in rules.iterrows()
        ] if len(rules) > 0 else []
        
        recommendations = recommendation_service.generate_recommendations(
            segments, rules_list, sentiment_data, bundles
        )
        
        # Verify all outputs
        assert len(segments) > 0
        assert isinstance(bundles, list)
        assert 'overall_score' in sentiment_overview
        assert len(personas) > 0
        assert isinstance(recommendations, list)


# =============================================================================
# Test Edge Cases and Error Handling
# =============================================================================

class TestEdgeCases:
    """Test edge cases and error handling"""
    
    def test_single_transaction(self, sample_transactions):
        """Test with single transaction"""
        single_txn = sample_transactions.head(1)
        
        segmentation_service = SegmentationService()
        rfm_df = segmentation_service.compute_rfm_scores(single_txn)
        
        assert rfm_df is not None
    
    def test_all_same_customer(self, sample_transactions):
        """Test with all transactions from same customer"""
        same_customer = sample_transactions.copy()
        same_customer['customer_id'] = 'CUST001'
        
        segmentation_service = SegmentationService()
        rfm_df = segmentation_service.compute_rfm_scores(same_customer)
        
        assert rfm_df is not None
    
    def test_no_reviews(self, sample_transactions):
        """Test with no reviews"""
        no_reviews = sample_transactions.copy()
        no_reviews['review'] = None
        
        sentiment_service = SentimentService()
        sentiment_df = sentiment_service.calculate_sentiment_scores(no_reviews)
        
        assert sentiment_df is not None
    
    def test_extreme_discounts(self, sample_transactions):
        """Test with extreme discount values"""
        extreme = sample_transactions.copy()
        extreme['discount'] = extreme['discount'].clip(0, 1)
        
        segmentation_service = SegmentationService()
        rfm_df = segmentation_service.compute_rfm_scores(extreme)
        
        assert rfm_df is not None
    
    def test_missing_optional_columns(self, sample_transactions):
        """Test with missing optional columns"""
        minimal = sample_transactions[['customer_id', 'product_name', 'total_amount', 'transaction_date']]
        
        segmentation_service = SegmentationService()
        rfm_df = segmentation_service.compute_rfm_scores(minimal)
        
        assert rfm_df is not None


# =============================================================================
# Run Tests
# =============================================================================

if __name__ == '__main__':
    pytest.main([
        __file__,
        '-v',
        '--tb=short',
        '--maxfail=5',
        '-x'
    ])
