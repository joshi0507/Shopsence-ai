# -*- coding: utf-8 -*-
"""
Behavior Analytics Routes

API endpoints for shopper behavior analysis including:
- Customer segmentation
- Product affinity
- Sentiment analysis
- Personas
- Behavioral recommendations

Example usage:
    GET /api/behavior/segments?upload_id=upload_123
    GET /api/behavior/affinity/network?upload_id=upload_123
    GET /api/behavior/sentiment/overview?upload_id=upload_123
    GET /api/behavior/personas?upload_id=upload_123
    GET /api/behavior/recommendations?upload_id=upload_123
"""

from flask import Blueprint, request, jsonify, current_app, g
from typing import Dict, Any, List
import logging

from services.segmentation_service import SegmentationService
from services.affinity_service import AffinityService
from services.sentiment_service import SentimentService
from services.persona_service import PersonaService
from services.recommendation_service import RecommendationService
from models.sales_data import SalesData
from routes.auth import jwt_required

behavior_bp = Blueprint('behavior', __name__)

logger = logging.getLogger(__name__)


def get_sales_model():
    """Get sales data model"""
    db = current_app.config['MONGO_DB']
    return SalesData(db)


@behavior_bp.route('/segments', methods=['GET'])
@jwt_required
def get_segments():
    """
    Get customer segments
    
    Query Params:
        upload_id (str, optional): Filter by specific upload
    
    Returns:
        JSON: Customer segments with RFM analysis
    """
    try:
        upload_id = request.args.get('upload_id')
        user_id = g.current_user['user_id']
        n_clusters = int(request.args.get('n_clusters', 4))
        
        sales_model = get_sales_model()
        
        # Get transactions
        transactions = sales_model.get_transactions(user_id, upload_id)
        
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
            rfm_df, n_clusters=n_clusters
        )
        summaries = segmentation_service.get_segment_summary(
            segmented_df, segment_mapping
        )
        
        # Get visualization data
        viz_data = segmentation_service.get_segment_visualization_data(
            segmented_df, segment_mapping
        )
        
        return jsonify({
            'success': True,
            'data': {
                'segments': summaries,
                'segment_mapping': segment_mapping,
                'visualization': viz_data,
                'total_customers': len(rfm_df)
            }
        })
        
    except Exception as e:
        logger.error(f'Segments error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Failed to get segments'
            }
        }), 500


@behavior_bp.route('/segments/<int:segment_id>/customers', methods=['GET'])
@jwt_required
def get_segment_customers(segment_id: int):
    """
    Get customers in a specific segment
    
    Path Params:
        segment_id (int): Segment identifier
    
    Query Params:
        upload_id (str, optional): Filter by upload
        page (int): Page number (default: 1)
        limit (int): Results per page (default: 50)
    
    Returns:
        JSON: Paginated list of customers in segment
    """
    try:
        upload_id = request.args.get('upload_id')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        user_id = g.current_user['user_id']
        sales_model = get_sales_model()
        
        # Get transactions and compute segments
        transactions = sales_model.get_transactions(user_id, upload_id)
        
        if transactions.empty:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_DATA', 'message': 'No data'}
            }), 400
        
        segmentation_service = SegmentationService()
        rfm_df = segmentation_service.compute_rfm_scores(transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(
            rfm_df, n_clusters=4
        )
        
        # Get customers in segment
        customers, total = segmentation_service.get_segment_customers(
            segmented_df, segment_id, page, limit
        )
        
        return jsonify({
            'success': True,
            'data': {
                'customers': customers,
                'segment_name': segment_mapping.get(segment_id, f'Segment {segment_id}'),
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': total,
                    'total_pages': (total + limit - 1) // limit
                }
            }
        })
        
    except Exception as e:
        logger.error(f'Segment customers error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500


@behavior_bp.route('/affinity/network', methods=['GET'])
@jwt_required
def get_affinity_network():
    """
    Get product affinity network
    
    Query Params:
        upload_id (str, optional): Filter by upload
        top_n (int): Number of top rules (default: 50)
    
    Returns:
        JSON: Network data with nodes and links
    """
    try:
        upload_id = request.args.get('upload_id')
        top_n = int(request.args.get('top_n', 50))
        
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
        itemsets = affinity_service.find_frequent_itemsets(basket, min_support=0.05)
        rules = affinity_service.generate_association_rules(
            itemsets, min_confidence=0.3, min_lift=1.5
        )
        network = affinity_service.build_affinity_network(
            rules, transactions, top_n=top_n
        )
        
        return jsonify({
            'success': True,
            'data': network
        })
        
    except Exception as e:
        logger.error(f'Affinity network error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500


@behavior_bp.route('/affinity/rules', methods=['GET'])
@jwt_required
def get_affinity_rules():
    """
    Get association rules
    
    Query Params:
        upload_id (str, optional): Filter by upload
        min_lift (float): Minimum lift (default: 1.5)
        min_confidence (float): Minimum confidence (default: 0.3)
    
    Returns:
        JSON: List of association rules
    """
    try:
        upload_id = request.args.get('upload_id')
        min_lift = float(request.args.get('min_lift', 1.5))
        min_confidence = float(request.args.get('min_confidence', 0.3))
        
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
        itemsets = affinity_service.find_frequent_itemsets(basket, min_support=0.05)
        rules = affinity_service.generate_association_rules(
            itemsets, min_confidence=min_confidence, min_lift=min_lift
        )
        
        # Convert frozensets to strings for JSON
        rules_list = []
        for _, rule in rules.iterrows():
            rules_list.append({
                'antecedents': affinity_service._frozerset_to_string(rule['antecedents']),
                'consequents': affinity_service._frozerset_to_string(rule['consequents']),
                'support': float(rule['support']),
                'confidence': float(rule['confidence']),
                'lift': float(rule['lift']),
                'transactions': int(rule['support'] * len(transactions))
            })
        
        return jsonify({
            'success': True,
            'data': {
                'rules': rules_list,
                'total_rules': len(rules_list)
            }
        })
        
    except Exception as e:
        logger.error(f'Affinity rules error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500


@behavior_bp.route('/affinity/bundles', methods=['GET'])
@jwt_required
def get_affinity_bundles():
    """
    Get suggested product bundles
    
    Query Params:
        upload_id (str, optional): Filter by upload
        min_lift (float): Minimum lift (default: 2.0)
    
    Returns:
        JSON: List of suggested bundles
    """
    try:
        upload_id = request.args.get('upload_id')
        min_lift = float(request.args.get('min_lift', 2.0))
        
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
        itemsets = affinity_service.find_frequent_itemsets(basket, min_support=0.05)
        rules = affinity_service.generate_association_rules(
            itemsets, min_confidence=0.3, min_lift=min_lift
        )
        bundles = affinity_service.suggest_bundles(rules, min_lift=min_lift)
        
        return jsonify({
            'success': True,
            'data': {
                'bundles': bundles,
                'total_bundles': len(bundles)
            }
        })
        
    except Exception as e:
        logger.error(f'Bundles error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500


@behavior_bp.route('/sentiment/overview', methods=['GET'])
@jwt_required
def get_sentiment_overview():
    """
    Get sentiment overview
    
    Query Params:
        upload_id (str, optional): Filter by upload
    
    Returns:
        JSON: Sentiment overview with scores and distribution
    """
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
        sentiment_df = sentiment_service.calculate_sentiment_scores(transactions)
        overview = sentiment_service.get_overview(sentiment_df)
        gauge_data = sentiment_service.get_sentiment_gauge_data(sentiment_df)
        
        return jsonify({
            'success': True,
            'data': {
                'overview': overview,
                'gauge': gauge_data
            }
        })
        
    except Exception as e:
        logger.error(f'Sentiment overview error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500


@behavior_bp.route('/sentiment/by-category', methods=['GET'])
@jwt_required
def get_sentiment_by_category():
    """
    Get sentiment by category
    
    Query Params:
        upload_id (str, optional): Filter by upload
    
    Returns:
        JSON: Sentiment breakdown by category
    """
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
        sentiment_df = sentiment_service.calculate_sentiment_scores(transactions)
        by_category = sentiment_service.get_by_category(sentiment_df)
        
        return jsonify({
            'success': True,
            'data': {
                'categories': by_category
            }
        })
        
    except Exception as e:
        logger.error(f'Sentiment by category error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500


@behavior_bp.route('/sentiment/keywords', methods=['GET'])
@jwt_required
def get_sentiment_keywords():
    """
    Get sentiment keywords
    
    Query Params:
        upload_id (str, optional): Filter by upload
    
    Returns:
        JSON: Positive and negative keywords
    """
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
        
        # Extract keywords
        sentiment_service = SentimentService()
        keywords = sentiment_service.extract_keywords(transactions)
        
        return jsonify({
            'success': True,
            'data': keywords
        })
        
    except Exception as e:
        logger.error(f'Sentiment keywords error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500


@behavior_bp.route('/personas', methods=['GET'])
@jwt_required
def get_personas():
    """
    Get customer personas
    
    Query Params:
        upload_id (str, optional): Filter by upload
    
    Returns:
        JSON: List of data-driven personas
    """
    try:
        upload_id = request.args.get('upload_id')
        
        user_id = g.current_user['user_id']
        sales_model = get_sales_model()
        
        # Get transactions
        transactions = sales_model.get_transactions(user_id, upload_id)
        
        if transactions.empty:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_DATA', 'message': 'No data'}
            }), 400
        
        # Get customers for demographics
        customers = sales_model.get_customers(user_id, upload_id)
        
        # Compute segmentation
        segmentation_service = SegmentationService()
        rfm_df = segmentation_service.compute_rfm_scores(transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(
            rfm_df, n_clusters=4
        )
        
        # Generate personas
        persona_service = PersonaService()
        personas = persona_service.generate_personas(
            segmented_df, segment_mapping, customers
        )
        
        return jsonify({
            'success': True,
            'data': {
                'personas': personas,
                'total_personas': len(personas)
            }
        })
        
    except Exception as e:
        logger.error(f'Personas error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500


@behavior_bp.route('/recommendations', methods=['GET'])
@jwt_required
def get_recommendations():
    """
    Get behavioral recommendations
    
    Query Params:
        upload_id (str, optional): Filter by upload
        category (str, optional): Filter by category (Merchandising/Marketing/Product)
        priority (str, optional): Filter by priority (High/Medium/Low)
    
    Returns:
        JSON: List of actionable recommendations
    """
    try:
        upload_id = request.args.get('upload_id')
        category_filter = request.args.get('category')
        priority_filter = request.args.get('priority')
        
        user_id = g.current_user['user_id']
        sales_model = get_sales_model()
        transactions = sales_model.get_transactions(user_id, upload_id)
        
        if transactions.empty:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_DATA', 'message': 'No data'}
            }), 400
        
        # Compute all analytics
        segmentation_service = SegmentationService()
        affinity_service = AffinityService()
        sentiment_service = SentimentService()
        recommendation_service = RecommendationService()
        
        # Segmentation
        rfm_df = segmentation_service.compute_rfm_scores(transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(
            rfm_df, n_clusters=4
        )
        segments = segmentation_service.get_segment_summary(
            segmented_df, segment_mapping
        )
        
        # Affinity
        basket = affinity_service.create_basket_matrix(transactions)
        itemsets = affinity_service.find_frequent_itemsets(basket, min_support=0.05)
        rules = affinity_service.generate_association_rules(
            itemsets, min_confidence=0.3, min_lift=1.5
        )
        bundles = affinity_service.suggest_bundles(rules)
        
        # Sentiment
        sentiment_df = sentiment_service.calculate_sentiment_scores(transactions)
        sentiment_overview = sentiment_service.get_overview(sentiment_df)
        by_category = sentiment_service.get_by_category(sentiment_df)
        
        sentiment_data = {
            'overall_score': sentiment_overview['overall_score'],
            'by_category': by_category,
            'distribution': sentiment_overview['distribution'],
            'percentages': sentiment_overview['percentages']
        }
        
        # Generate recommendations
        rules_list = []
        for _, rule in rules.iterrows():
            rules_list.append({
                'antecedents': rule['antecedents'],
                'consequents': rule['consequents'],
                'support': float(rule['support']),
                'confidence': float(rule['confidence']),
                'lift': float(rule['lift'])
            })
        
        recommendations = recommendation_service.generate_recommendations(
            segments, rules_list, sentiment_data, bundles
        )
        
        # Apply filters
        if category_filter:
            recommendations = [
                r for r in recommendations if r['category'] == category_filter
            ]
        if priority_filter:
            recommendations = [
                r for r in recommendations if r['priority'] == priority_filter
            ]
        
        # Get summary
        summary = recommendation_service.get_recommendation_summary(recommendations)
        
        return jsonify({
            'success': True,
            'data': {
                'recommendations': recommendations,
                'summary': summary
            }
        })
        
    except Exception as e:
        logger.error(f'Recommendations error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500


@behavior_bp.route('/insights/summary', methods=['GET'])
@jwt_required
def get_behavioral_insights_summary():
    """
    Get comprehensive behavioral insights summary
    
    Query Params:
        upload_id (str, optional): Filter by upload
    
    Returns:
        JSON: Combined insights from all behavior analytics
    """
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
        
        # Compute all analytics
        segmentation_service = SegmentationService()
        affinity_service = AffinityService()
        sentiment_service = SentimentService()
        persona_service = PersonaService()
        recommendation_service = RecommendationService()
        
        # Segmentation
        rfm_df = segmentation_service.compute_rfm_scores(transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(
            rfm_df, n_clusters=4
        )
        segments = segmentation_service.get_segment_summary(
            segmented_df, segment_mapping
        )
        
        # Affinity
        basket = affinity_service.create_basket_matrix(transactions)
        itemsets = affinity_service.find_frequent_itemsets(basket, min_support=0.05)
        rules = affinity_service.generate_association_rules(
            itemsets, min_confidence=0.3, min_lift=1.5
        )
        bundles = affinity_service.suggest_bundles(rules)
        
        # Sentiment
        sentiment_df = sentiment_service.calculate_sentiment_scores(transactions)
        sentiment_overview = sentiment_service.get_overview(sentiment_df)
        
        # Personas
        customers = sales_model.get_customers(user_id, upload_id)
        personas = persona_service.generate_personas(
            segmented_df, segment_mapping, customers
        )
        
        # Recommendations
        rules_list = [
            {
                'antecedents': rule['antecedents'],
                'consequents': rule['consequents'],
                'support': float(rule['support']),
                'confidence': float(rule['confidence']),
                'lift': float(rule['lift'])
            }
            for _, rule in rules.iterrows()
        ]
        
        sentiment_data = {
            'overall_score': sentiment_overview['overall_score'],
            'by_category': sentiment_service.get_by_category(sentiment_df),
            'distribution': sentiment_overview['distribution']
        }
        
        recommendations = recommendation_service.generate_recommendations(
            segments, rules_list, sentiment_data, bundles
        )
        
        return jsonify({
            'success': True,
            'data': {
                'segments': {
                    'list': segments,
                    'mapping': segment_mapping,
                    'total': len(segments)
                },
                'affinity': {
                    'rules_count': len(rules),
                    'bundles': bundles[:5]
                },
                'sentiment': sentiment_overview,
                'personas': personas[:4],  # Top 4 personas
                'recommendations': recommendations[:5],  # Top 5 recommendations
                'summary': {
                    'total_customers': len(rfm_df),
                    'total_products': transactions['product_name'].nunique(),
                    'total_transactions': len(transactions)
                }
            }
        })
        
    except Exception as e:
        logger.error(f'Insights summary error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed'}
        }), 500
@behavior_bp.route('/tips', methods=['GET'])
@jwt_required
def get_tips():
    """
    Get behavioral tips (subset of recommendations)
    """
    try:
        upload_id = request.args.get('upload_id')
        user_id = g.current_user['user_id']
        sales_model = get_sales_model()
        transactions = sales_model.get_transactions(user_id, upload_id)
        
        if transactions.empty:
            return jsonify({
                'success': True,
                'data': []
            })
            
        # For tips, we compute the recommendations and return them
        segmentation_service = SegmentationService()
        affinity_service = AffinityService()
        sentiment_service = SentimentService()
        recommendation_service = RecommendationService()
        
        # Segmentation
        rfm_df = segmentation_service.compute_rfm_scores(transactions)
        segmented_df, segment_mapping = segmentation_service.segment_customers(rfm_df)
        segments = segmentation_service.get_segment_summary(segmented_df, segment_mapping)
        
        # Affinity
        basket = affinity_service.create_basket_matrix(transactions)
        itemsets = affinity_service.find_frequent_itemsets(basket)
        rules = affinity_service.generate_association_rules(itemsets)
        bundles = affinity_service.suggest_bundles(rules)
        
        # Sentiment
        sentiment_df = sentiment_service.calculate_sentiment_scores(transactions)
        sentiment_overview = sentiment_service.get_overview(sentiment_df)
        
        sentiment_data = {
            'overall_score': sentiment_overview['overall_score'],
            'by_category': sentiment_service.get_by_category(sentiment_df),
            'distribution': sentiment_overview['distribution'],
            'percentages': sentiment_overview['percentages']
        }
        
        # Format rules for recommender
        rules_list = []
        for _, rule in rules.iterrows():
            rules_list.append({
                'antecedents': rule['antecedents'],
                'consequents': rule['consequents'],
                'support': float(rule['support']),
                'confidence': float(rule['confidence']),
                'lift': float(rule['lift'])
            })
            
        recommendations = recommendation_service.generate_recommendations(
            segments, rules_list, sentiment_data, bundles
        )
        
        # Add some 'Tip' specific metadata if needed, or just return as is
        # The frontend Tips component will handle the display
        
        return jsonify({
            'success': True,
            'data': recommendations
        })
        
    except Exception as e:
        logger.error(f'Tips error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to get tips'}
        }), 500
