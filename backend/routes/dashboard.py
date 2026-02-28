# -*- coding: utf-8 -*-
"""
Dashboard Routes - Complete Dashboard Data

Handles fetching all data needed for the dashboard in a single request.
"""

from flask import Blueprint, request, jsonify, current_app, g
import pandas as pd

from models.sales_data import SalesData
from models.upload import UploadSession
from services.analytics_service import AnalyticsService
from services.forecast_service import ForecastService
from routes.auth import jwt_required

dashboard_bp = Blueprint('dashboard', __name__)


def get_sales_data_model():
    """Get sales data model."""
    db = current_app.config['MONGO_DB']
    return SalesData(db)


def get_upload_model():
    """Get upload session model."""
    db = current_app.config['MONGO_DB']
    return UploadSession(db)


@dashboard_bp.route('', methods=['GET'])
@jwt_required
def get_dashboard_data():
    """
    Get complete dashboard data.
    
    Query Params:
        upload_id (str, optional): Filter by specific upload
    
    Returns:
        JSON: Complete dashboard data including KPIs, charts, and insights
    """
    try:
        upload_id = request.args.get('upload_id')
        
        sales_model = get_sales_data_model()
        upload_model = get_upload_model()
        analytics_service = AnalyticsService()
        forecast_service = ForecastService()
        
        # Get upload history
        uploads = upload_model.find_by_user(g.current_user['user_id'], limit=10)
        
        # Get product summary
        product_df = sales_model.get_product_summary(g.current_user['user_id'], upload_id)
        
        # Get daily sales
        daily_df = sales_model.get_daily_sales(g.current_user['user_id'], upload_id)
        
        if product_df.empty:
            return jsonify({
                'success': True,
                'data': {
                    'has_data': False,
                    'uploads': uploads,
                    'message': 'No data available. Upload a CSV file to get started.'
                }
            })
        
        # Generate analysis
        product_analysis = analytics_service.analyze_product_performance(product_df)
        trend_analysis = analytics_service.analyze_trends(daily_df)
        recommendations = analytics_service.generate_recommendations(product_analysis)
        
        # Generate forecast
        forecast = forecast_service.forecast(daily_df, periods=30)
        
        # Prepare chart data
        # Top products bar chart
        top_products = product_df.nlargest(10, 'units_sold').to_dict('records')
        for item in top_products:
            item['units_sold'] = int(item['units_sold'])
            item['price'] = float(item['price'])
            item['revenue'] = float(item['revenue'])
        
        # Low products bar chart
        low_products = product_df.nsmallest(10, 'units_sold').to_dict('records')
        for item in low_products:
            item['units_sold'] = int(item['units_sold'])
            item['price'] = float(item['price'])
            item['revenue'] = float(item['revenue'])
        
        # Price vs volume scatter
        price_volume = product_df.to_dict('records')
        for item in price_volume:
            item['units_sold'] = int(item['units_sold'])
            item['price'] = float(item['price'])
            item['revenue'] = float(item['revenue'])
        
        # Time series line chart
        daily_df['date'] = pd.to_datetime(daily_df['date']).dt.strftime('%Y-%m-%d')
        time_series = daily_df.to_dict('records')
        for item in time_series:
            item['units_sold'] = int(item['units_sold'])
            item['revenue'] = float(item['revenue'])
        
        # KPIs
        total_revenue = float(product_df['revenue'].sum())
        total_units = int(product_df['units_sold'].sum())
        total_products = len(product_df)
        total_customers = sales_model.get_total_customers(g.current_user['user_id'], upload_id)
        avg_order_value = total_revenue / total_units if total_units > 0 else 0
        
        return jsonify({
            'success': True,
            'data': {
                'has_data': True,
                'kpis': {
                    'total_revenue': round(total_revenue, 2),
                    'total_units': total_units,
                    'total_products': total_products,
                    'total_customers': total_customers,
                    'avg_order_value': round(avg_order_value, 2),
                    'avg_price': round(float(product_df['price'].mean()), 2)
                },
                'charts': {
                    'top_products': top_products,
                    'low_products': low_products,
                    'price_volume': price_volume,
                    'time_series': time_series,
                    'forecast': forecast.get('predictions', [])
                },
                'analysis': {
                    'product_analysis': product_analysis,
                    'trend_analysis': trend_analysis,
                    'recommendations': recommendations
                },
                'uploads': uploads
            }
        })
        
    except Exception as e:
        current_app.logger.error(f'Dashboard error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to get dashboard data'}
        }), 500


@dashboard_bp.route('/kpis', methods=['GET'])
@jwt_required
def get_kpis():
    """
    Get KPI cards data.
    
    Query Params:
        upload_id (str, optional): Filter by specific upload
    
    Returns:
        JSON: KPI metrics
    """
    try:
        upload_id = request.args.get('upload_id')
        
        sales_model = get_sales_data_model()
        product_df = sales_model.get_product_summary(g.current_user['user_id'], upload_id)
        
        if product_df.empty:
            return jsonify({
                'success': True,
                'data': {
                    'total_revenue': 0,
                    'total_units': 0,
                    'total_products': 0,
                    'total_customers': 0,
                    'avg_order_value': 0,
                    'avg_price': 0
                }
            })
        
        total_revenue = float(product_df['revenue'].sum())
        total_units = int(product_df['units_sold'].sum())
        total_products = len(product_df)
        total_customers = sales_model.get_total_customers(g.current_user['user_id'], upload_id)
        avg_order_value = total_revenue / total_units if total_units > 0 else 0
        avg_price = float(product_df['price'].mean())
        
        return jsonify({
            'success': True,
            'data': {
                'total_revenue': round(total_revenue, 2),
                'total_units': total_units,
                'total_products': total_products,
                'total_customers': total_customers,
                'avg_order_value': round(avg_order_value, 2),
                'avg_price': round(avg_price, 2)
            }
        })
        
    except Exception as e:
        current_app.logger.error(f'KPIs error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to get KPIs'}
        }), 500


@dashboard_bp.route('/charts', methods=['GET'])
@jwt_required
def get_charts():
    """
    Get chart data for dashboard.
    
    Query Params:
        upload_id (str, optional): Filter by specific upload
    
    Returns:
        JSON: Chart datasets
    """
    try:
        upload_id = request.args.get('upload_id')
        
        sales_model = get_sales_data_model()
        product_df = sales_model.get_product_summary(g.current_user['user_id'], upload_id)
        daily_df = sales_model.get_daily_sales(g.current_user['user_id'], upload_id)
        
        if product_df.empty:
            return jsonify({
                'success': True,
                'data': {}
            })
        
        # Top products
        top_products = product_df.nlargest(10, 'units_sold').to_dict('records')
        for item in top_products:
            item['units_sold'] = int(item['units_sold'])
            item['price'] = float(item['price'])
            item['revenue'] = float(item['revenue'])
        
        # Low products
        low_products = product_df.nsmallest(10, 'units_sold').to_dict('records')
        for item in low_products:
            item['units_sold'] = int(item['units_sold'])
            item['price'] = float(item['price'])
            item['revenue'] = float(item['revenue'])
        
        # Time series
        daily_df['date'] = pd.to_datetime(daily_df['date']).dt.strftime('%Y-%m-%d')
        time_series = daily_df.to_dict('records')
        for item in time_series:
            item['units_sold'] = int(item['units_sold'])
            item['revenue'] = float(item['revenue'])
        
        return jsonify({
            'success': True,
            'data': {
                'top_products': top_products,
                'low_products': low_products,
                'time_series': time_series
            }
        })
        
    except Exception as e:
        current_app.logger.error(f'Charts error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to get chart data'}
        }), 500
