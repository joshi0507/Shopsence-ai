# -*- coding: utf-8 -*-
"""
Analytics Routes - Business Intelligence & Insights

Handles analytics queries, insights generation, and forecasting.
"""

from flask import Blueprint, request, jsonify, current_app, g
from datetime import datetime, timedelta

from models.sales_data import SalesData
from models.upload import UploadSession
from services.analytics_service import AnalyticsService
from services.forecast_service import ForecastService
from gemini_service import gemini_service
from routes.auth import jwt_required

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')


def get_sales_data_model():
    """Get sales data model."""
    db = current_app.config['MONGO_DB']
    return SalesData(db)


def get_upload_model():
    """Get upload session model."""
    db = current_app.config['MONGO_DB']
    return UploadSession(db)


@analytics_bp.route('/summary', methods=['GET'])
@jwt_required
def get_summary():
    """
    Get analytics summary for user's data.
    
    Query Params:
        upload_id (str, optional): Filter by specific upload
        start_date (str, optional): Start date (YYYY-MM-DD)
        end_date (str, optional): End date (YYYY-MM-DD)
    
    Returns:
        JSON: Analytics summary
    """
    try:
        upload_id = request.args.get('upload_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        sales_model = get_sales_data_model()
        analytics_service = AnalyticsService()
        
        # Get product summary
        product_df = sales_model.get_product_summary(g.current_user['user_id'], upload_id)
        
        # Get daily sales
        daily_df = sales_model.get_daily_sales(g.current_user['user_id'], upload_id)
        
        # Apply date filter if provided
        if start_date or end_date:
            daily_df['date'] = pd.to_datetime(daily_df['date'])
            if start_date:
                daily_df = daily_df[daily_df['date'] >= pd.to_datetime(start_date)]
            if end_date:
                daily_df = daily_df[daily_df['date'] <= pd.to_datetime(end_date)]
        
        # Generate analysis
        product_analysis = analytics_service.analyze_product_performance(product_df)
        trend_analysis = analytics_service.analyze_trends(daily_df)
        recommendations = analytics_service.generate_recommendations(product_analysis)
        
        return jsonify({
            'success': True,
            'data': {
                'product_analysis': product_analysis,
                'trend_analysis': trend_analysis,
                'recommendations': recommendations
            }
        })
        
    except Exception as e:
        current_app.logger.error(f'Summary error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to get summary'}
        }), 500


@analytics_bp.route('/products', methods=['GET'])
@jwt_required
def get_product_performance():
    """
    Get product performance data.
    
    Query Params:
        upload_id (str, optional): Filter by specific upload
        limit (int): Maximum results (default 100)
    
    Returns:
        JSON: Product performance data
    """
    try:
        upload_id = request.args.get('upload_id')
        limit = min(int(request.args.get('limit', 100)), 1000)
        
        sales_model = get_sales_data_model()
        product_df = sales_model.get_product_summary(g.current_user['user_id'], upload_id)
        
        # Convert to list of dicts
        products = product_df.head(limit).to_dict('records')
        
        # Convert types for JSON serialization
        for product in products:
            product['units_sold'] = int(product['units_sold'])
            product['price'] = float(product['price'])
            product['revenue'] = float(product['revenue'])
        
        return jsonify({
            'success': True,
            'data': {
                'products': products,
                'total_products': len(products)
            }
        })
        
    except Exception as e:
        current_app.logger.error(f'Product performance error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to get product data'}
        }), 500


@analytics_bp.route('/trends', methods=['GET'])
@jwt_required
def get_trends():
    """
    Get sales trends over time.
    
    Query Params:
        upload_id (str, optional): Filter by specific upload
        start_date (str, optional): Start date (YYYY-MM-DD)
        end_date (str, optional): End date (YYYY-MM-DD)
    
    Returns:
        JSON: Time series data
    """
    try:
        upload_id = request.args.get('upload_id')
        
        sales_model = get_sales_data_model()
        daily_df = sales_model.get_daily_sales(g.current_user['user_id'], upload_id)
        
        # Convert to list of dicts
        daily_df['date'] = pd.to_datetime(daily_df['date']).dt.strftime('%Y-%m-%d')
        trends = daily_df.to_dict('records')
        
        # Convert types
        for row in trends:
            row['units_sold'] = int(row['units_sold'])
            row['revenue'] = float(row['revenue'])
        
        return jsonify({
            'success': True,
            'data': {
                'trends': trends,
                'data_points': len(trends)
            }
        })
        
    except Exception as e:
        current_app.logger.error(f'Trends error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to get trends'}
        }), 500


@analytics_bp.route('/forecast', methods=['GET'])
@jwt_required
def get_forecast():
    """
    Get sales forecast.
    
    Query Params:
        upload_id (str, optional): Filter by specific upload
        periods (int): Days to forecast (default 30)
    
    Returns:
        JSON: Forecast data
    """
    try:
        upload_id = request.args.get('upload_id')
        periods = min(int(request.args.get('periods', 30)), 90)
        
        sales_model = get_sales_data_model()
        forecast_service = ForecastService()
        
        # Get daily sales
        daily_df = sales_model.get_daily_sales(g.current_user['user_id'], upload_id)
        
        if daily_df.empty:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_DATA', 'message': 'Insufficient data for forecasting'}
            }), 400
        
        # Generate forecast
        forecast = forecast_service.forecast(daily_df, periods=periods)
        
        if 'error' in forecast:
            return jsonify({
                'success': False,
                'error': {'code': 'FORECAST_ERROR', 'message': forecast['error']}
            }), 400
        
        return jsonify({
            'success': True,
            'data': forecast
        })
        
    except Exception as e:
        current_app.logger.error(f'Forecast error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to generate forecast'}
        }), 500


@analytics_bp.route('/insights', methods=['POST'])
@jwt_required
def get_ai_insights():
    """
    Get AI-powered business insights.
    
    Request Body:
        upload_id (str, optional): Filter by specific upload
    
    Returns:
        JSON: AI-generated insights
    """
    try:
        data = request.get_json() or {}
        upload_id = data.get('upload_id')
        
        sales_model = get_sales_data_model()
        analytics_service = AnalyticsService()
        
        # Get data
        product_df = sales_model.get_product_summary(g.current_user['user_id'], upload_id)
        daily_df = sales_model.get_daily_sales(g.current_user['user_id'], upload_id)
        
        if product_df.empty:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_DATA', 'message': 'No data available for insights'}
            }), 400
        
        # Generate analysis
        analysis = analytics_service.analyze_product_performance(product_df)
        trends = analytics_service.analyze_trends(daily_df)
        
        # Prepare data for Gemini
        analytics_data = {
            'product_analysis': analysis,
            'trend_analysis': trends,
            'data_summary': {
                'total_products': len(product_df),
                'total_revenue': float(product_df['revenue'].sum()),
                'date_range': {
                    'start': str(daily_df['date'].min()) if not daily_df.empty else None,
                    'end': str(daily_df['date'].max()) if not daily_df.empty else None
                }
            }
        }
        
        # Get AI insights
        insights = gemini_service.generate_business_insights(analytics_data)
        
        return jsonify({
            'success': True,
            'data': insights
        })
        
    except Exception as e:
        current_app.logger.error(f'AI insights error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to generate insights'}
        }), 500
