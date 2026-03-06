# -*- coding: utf-8 -*-
"""
Export Routes - Report Export Endpoints

Handles PDF and Excel report generation and download.
"""

from flask import Blueprint, request, jsonify, send_file, current_app, g
from io import BytesIO

from routes.auth import jwt_required
from models.sales_data import SalesData
from services.analytics_service import AnalyticsService
from services.forecast_service import ForecastService
from services.export_service import export_service

exports_bp = Blueprint('exports', __name__)


def get_sales_data_model():
    """Get sales data model."""
    db = current_app.config['MONGO_DB']
    return SalesData(db)


@exports_bp.route('/excel', methods=['POST'])
@jwt_required
def export_excel():
    """
    Export analytics data as Excel file.
    
    Request Body:
        upload_id (str, optional): Filter by specific upload
        include_charts (bool): Include chart data (default: True)
    
    Returns:
        File: Excel spreadsheet download
    """
    try:
        data = request.get_json() or {}
        upload_id = data.get('upload_id')
        include_charts = data.get('include_charts', True)
        
        sales_model = get_sales_data_model()
        analytics_service = AnalyticsService()
        forecast_service = ForecastService()
        
        # Get data
        product_df = sales_model.get_product_summary(g.current_user['user_id'], upload_id)
        daily_df = sales_model.get_daily_sales(g.current_user['user_id'], upload_id)
        
        if product_df.empty:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_DATA', 'message': 'No data available for export'}
            }), 400
        
        # Generate analysis
        product_analysis = analytics_service.analyze_product_performance(product_df)
        trend_analysis = analytics_service.analyze_trends(daily_df)
        recommendations = analytics_service.generate_recommendations(product_analysis)
        
        # Generate forecast
        forecast = forecast_service.forecast(daily_df, periods=30)
        
        # Prepare export data
        export_data = {
            'kpis': {
                'total_revenue': float(product_df['revenue'].sum()),
                'total_units': int(product_df['units_sold'].sum()),
                'total_products': len(product_df),
                'avg_order_value': float(product_df['revenue'].sum()) / int(product_df['units_sold'].sum()) if product_df['units_sold'].sum() > 0 else 0,
                'avg_price': float(product_df['price'].mean())
            },
            'charts': {
                'top_products': product_df.nlargest(10, 'units_sold').to_dict('records'),
                'time_series': daily_df.to_dict('records'),
                'forecast': forecast.get('predictions', [])
            },
            'analysis': {
                'product_analysis': product_analysis,
                'trend_analysis': trend_analysis,
                'recommendations': recommendations
            }
        }
        
        # Convert types for JSON serialization
        for product in export_data['charts']['top_products']:
            product['units_sold'] = int(product['units_sold'])
            product['price'] = float(product['price'])
            product['revenue'] = float(product['revenue'])
        
        for trend in export_data['charts']['time_series']:
            trend['date'] = str(trend['date'])
            trend['units_sold'] = int(trend['units_sold'])
            trend['revenue'] = float(trend['revenue'])
        
        # Generate Excel file
        excel_file = export_service.generate_excel_report(export_data, include_charts)
        
        # Send file - use timestamp instead of user ID for security
        from datetime import datetime
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        return send_file(
            BytesIO(excel_file),
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'shopsense_report_{timestamp}.xlsx'
        )
        
    except Exception as e:
        current_app.logger.error(f'Excel export error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to generate Excel report'}
        }), 500


@exports_bp.route('/csv', methods=['GET'])
@jwt_required
def export_csv():
    """
    Export raw sales data as CSV file.
    
    Query Params:
        upload_id (str, optional): Filter by specific upload
    
    Returns:
        File: CSV download
    """
    try:
        upload_id = request.args.get('upload_id')
        
        sales_model = get_sales_data_model()
        data = sales_model.find_by_upload_id(upload_id) if upload_id else sales_model.find_by_user(g.current_user['user_id'], limit=10000)
        
        if not data:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_DATA', 'message': 'No data available for export'}
            }), 400
        
        # Convert to list of dicts
        export_data = []
        for record in data:
            export_data.append({
                'product_name': record.get('product_name', ''),
                'date': str(record.get('date', '')),
                'units_sold': record.get('units_sold', 0),
                'price': record.get('price', 0),
                'revenue': record.get('revenue', 0),
                'category': record.get('category', 'Uncategorized')
            })
        
        # Generate CSV
        csv_file = export_service.generate_csv_export(export_data)
        
        # Use timestamp instead of user ID for security
        from datetime import datetime
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        return send_file(
            BytesIO(csv_file),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'shopsense_data_{timestamp}.csv'
        )
        
    except Exception as e:
        current_app.logger.error(f'CSV export error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to generate CSV export'}
        }), 500


@exports_bp.route('/products', methods=['GET'])
@jwt_required
def export_products():
    """
    Export product summary as CSV file.
    
    Query Params:
        upload_id (str, optional): Filter by specific upload
    
    Returns:
        File: CSV download
    """
    try:
        upload_id = request.args.get('upload_id')
        
        sales_model = get_sales_data_model()
        product_df = sales_model.get_product_summary(g.current_user['user_id'], upload_id)
        
        if product_df.empty:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_DATA', 'message': 'No data available for export'}
            }), 400
        
        # Convert to list of dicts
        export_data = product_df.to_dict('records')
        
        # Generate CSV
        csv_file = export_service.generate_csv_export(export_data)
        
        # Use timestamp instead of user ID for security
        from datetime import datetime
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        return send_file(
            BytesIO(csv_file),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'shopsense_products_{timestamp}.csv'
        )
        
    except Exception as e:
        current_app.logger.error(f'Products export error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to generate products export'}
        }), 500
