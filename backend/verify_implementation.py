#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Quick verification script for Shopper Behavior Analytics module

Run with: python verify_implementation.py
"""

import sys
import pandas as pd
import numpy as np

def test_imports():
    """Test that all modules can be imported"""
    print("\n=== Testing Imports ===")

    try:
        from utils.data_mapper import DataMapper
        print("[OK] DataMapper imported")
    except Exception as e:
        print(f"[FAIL] DataMapper import failed: {e}")
        return False

    try:
        from services.segmentation_service import SegmentationService
        print("[OK] SegmentationService imported")
    except Exception as e:
        print(f"[FAIL] SegmentationService import failed: {e}")
        return False

    try:
        from services.affinity_service import AffinityService
        print("[OK] AffinityService imported")
    except Exception as e:
        print(f"[FAIL] AffinityService import failed: {e}")
        return False

    try:
        from services.sentiment_service import SentimentService
        print("[OK] SentimentService imported")
    except Exception as e:
        print(f"[FAIL] SentimentService import failed: {e}")
        return False

    try:
        from services.persona_service import PersonaService
        print("[OK] PersonaService imported")
    except Exception as e:
        print(f"[FAIL] PersonaService import failed: {e}")
        return False

    try:
        from services.recommendation_service import RecommendationService
        print("[OK] RecommendationService imported")
    except Exception as e:
        print(f"[FAIL] RecommendationService import failed: {e}")
        return False

    return True


def test_data_mapper():
    """Test data transformation"""
    print("\n=== Testing Data Mapper ===")
    
    from utils.data_mapper import DataMapper
    
    # Create sample data
    sample_data = {
        'Customer ID': [1, 2, 3, 4, 5],
        'Item Purchased': ['Blouse', 'Jeans', 'Blouse', 'Sneakers', 'Jeans'],
        'Category': ['Clothing', 'Clothing', 'Clothing', 'Footwear', 'Clothing'],
        'Purchase Amount (USD)': [50, 80, 55, 120, 85],
        'Review Rating': [4.5, 4.0, 5.0, 4.2, 3.8],
        'Gender': ['Female', 'Male', 'Female', 'Male', 'Male'],
        'Location': ['NY', 'CA', 'NY', 'TX', 'CA'],
    }
    
    df = pd.DataFrame(sample_data)
    
    try:
        mapper = DataMapper()
        result = mapper.transform_shopping_trends(
            df,
            user_id='user_test',
            upload_id='upload_test'
        )
        
        print(f"[OK] Transformed {len(df)} rows")
        print(f"    Transactions: {len(result['transactions'])}")
        print(f"    Customers: {len(result['customers'])}")
        print(f"    Products: {len(result['products'])}")

        return True
    except Exception as e:
        print(f"[FAIL] Data transformation failed: {e}")
        return False


def test_segmentation():
    """Test customer segmentation"""
    print("\n=== Testing Segmentation ===")
    
    from services.segmentation_service import SegmentationService
    
    # Create sample transactions
    np.random.seed(42)
    n = 100
    transactions = pd.DataFrame({
        'customer_id': [f'C{i}' for i in np.random.randint(1, 20, n)],
        'date': pd.date_range('2025-01-01', periods=n, freq='D'),
        'revenue': np.random.uniform(10, 500, n)
    })
    
    try:
        service = SegmentationService()
        rfm_df = service.compute_rfm_scores(transactions)
        segmented_df, segment_mapping = service.segment_customers(rfm_df, n_clusters=4)
        summaries = service.get_segment_summary(segmented_df, segment_mapping)
        
        print(f"✓ Segmented {len(rfm_df)} customers into {len(segment_mapping)} segments")
        for summary in summaries:
            print(f"  - {summary['segment_name']}: {summary['customer_count']} customers, ${summary['total_revenue']:.2f}")
        
        return True
    except Exception as e:
        print(f"✗ Segmentation failed: {e}")
        return False


def test_affinity():
    """Test product affinity"""
    print("\n=== Testing Affinity ===")
    
    from services.affinity_service import AffinityService
    
    # Create sample transactions
    np.random.seed(42)
    n = 200
    transactions = pd.DataFrame({
        'customer_id': [f'C{i}' for i in np.random.randint(1, 30, n)],
        'product_name': np.random.choice(['Blouse', 'Jeans', 'Handbag', 'Shoes'], n),
        'revenue': np.random.uniform(10, 200, n)
    })
    
    try:
        service = AffinityService()
        basket = service.create_basket_matrix(transactions)
        itemsets = service.find_frequent_itemsets(basket, min_support=0.05)
        
        print(f"✓ Found {len(itemsets)} frequent itemsets")
        
        if not itemsets.empty:
            rules = service.generate_association_rules(itemsets, min_confidence=0.3)
            print(f"✓ Generated {len(rules)} association rules")
        
        return True
    except Exception as e:
        print(f"✗ Affinity analysis failed: {e}")
        return False


def test_sentiment():
    """Test sentiment analysis"""
    print("\n=== Testing Sentiment ===")
    
    from services.sentiment_service import SentimentService
    
    # Create sample transactions
    np.random.seed(42)
    n = 100
    transactions = pd.DataFrame({
        'rating': np.random.uniform(1, 5, n),
        'category': np.random.choice(['Clothing', 'Footwear', 'Accessories'], n)
    })
    
    try:
        service = SentimentService()
        sentiment_df = service.calculate_sentiment_scores(transactions)
        overview = service.get_overview(sentiment_df)
        by_category = service.get_by_category(sentiment_df)
        
        print(f"✓ Analyzed {overview['total_reviews']} reviews")
        print(f"  - Overall Score: {overview['overall_score']:.1f}")
        print(f"  - Positive: {overview['percentages']['positive']:.1f}%")
        print(f"  - Neutral: {overview['percentages']['neutral']:.1f}%")
        print(f"  - Negative: {overview['percentages']['negative']:.1f}%")
        
        return True
    except Exception as e:
        print(f"✗ Sentiment analysis failed: {e}")
        return False


def test_personas():
    """Test persona generation"""
    print("\n=== Testing Personas ===")
    
    from services.segmentation_service import SegmentationService
    from services.persona_service import PersonaService
    
    # Create sample data
    np.random.seed(42)
    transactions = pd.DataFrame({
        'customer_id': [f'C{i}' for i in range(1, 20)],
        'date': pd.date_range('2025-01-01', periods=100, freq='D'),
        'revenue': np.random.uniform(10, 500, 100)
    })
    
    try:
        seg_service = SegmentationService()
        rfm_df = seg_service.compute_rfm_scores(transactions)
        segmented_df, segment_mapping = seg_service.segment_customers(rfm_df, n_clusters=4)
        
        persona_service = PersonaService()
        personas = persona_service.generate_personas(segmented_df, segment_mapping)
        
        print(f"✓ Generated {len(personas)} personas")
        for persona in personas[:3]:
            print(f"  - {persona['name']} ({persona['role']}): {persona['behavior']['total_customers']} customers")
        
        return True
    except Exception as e:
        print(f"✗ Persona generation failed: {e}")
        return False


def test_recommendations():
    """Test recommendation generation"""
    print("\n=== Testing Recommendations ===")
    
    from services.recommendation_service import RecommendationService
    
    # Sample data
    segments = [
        {'segment_name': 'Champions', 'customer_count': 50, 'total_revenue': 10000},
        {'segment_name': 'At Risk', 'customer_count': 30, 'total_revenue': 5000}
    ]
    
    affinity_rules = [
        {'antecedents': 'Blouse', 'consequents': 'Handbag', 'support': 0.1, 'confidence': 0.5, 'lift': 3.2}
    ]
    
    sentiment_data = {
        'overall_score': 75,
        'by_category': [{'category': 'Clothing', 'sentiment_score': 70}]
    }
    
    bundles = [
        {'bundle_name': 'Blouse + Handbag', 'products': ['Blouse', 'Handbag'], 'affinity_score': 3.2}
    ]
    
    try:
        service = RecommendationService()
        recommendations = service.generate_recommendations(
            segments, affinity_rules, sentiment_data, bundles
        )
        
        print(f"✓ Generated {len(recommendations)} recommendations")
        for rec in recommendations[:3]:
            print(f"  - [{rec['priority']}] {rec['title']}")
        
        return True
    except Exception as e:
        print(f"✗ Recommendation generation failed: {e}")
        return False


def main():
    """Run all verification tests"""
    print("=" * 60)
    print("ShopSense AI - Behavior Analytics Verification")
    print("=" * 60)
    
    results = {
        'Imports': test_imports(),
        'Data Mapper': test_data_mapper(),
        'Segmentation': test_segmentation(),
        'Affinity': test_affinity(),
        'Sentiment': test_sentiment(),
        'Personas': test_personas(),
        'Recommendations': test_recommendations(),
    }
    
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All verification tests passed!")
        print("The Shopper Behavior Analytics module is ready for use.")
        return 0
    else:
        print(f"\n⚠️ {total - passed} test(s) failed.")
        print("Please check the errors above and fix any issues.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
