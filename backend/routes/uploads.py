# -*- coding: utf-8 -*-
"""
Upload Routes - File Upload and Processing

Handles CSV file uploads, validation, and data processing.
"""

import os
import pandas as pd
from flask import Blueprint, request, jsonify, current_app, g
from werkzeug.utils import secure_filename
from datetime import datetime

from models.upload import UploadSession
from models.sales_data import SalesData
from services.analytics_service import AnalyticsService
from routes.auth import jwt_required

uploads_bp = Blueprint('uploads', __name__, url_prefix='/api/uploads')


def get_upload_model():
    """Get upload session model."""
    db = current_app.config['MONGO_DB']
    return UploadSession(db)


def get_sales_data_model():
    """Get sales data model."""
    db = current_app.config['MONGO_DB']
    return SalesData(db)


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    allowed_extensions = current_app.config.get('ALLOWED_EXTENSIONS', {'csv'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


def validate_csv_structure(df: pd.DataFrame) -> tuple:
    """
    Validate CSV structure.
    
    Returns:
        tuple: (is_valid, error_message)
    """
    required_columns = ['product_name', 'date', 'units_sold', 'price']
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        return False, f"Missing required columns: {', '.join(missing_columns)}"
    
    # Check for empty dataframe
    if df.empty:
        return False, "CSV file is empty"
    
    # Check data types
    if not pd.api.types.is_numeric_dtype(df['units_sold']):
        return False, "units_sold must be numeric"
    
    if not pd.api.types.is_numeric_dtype(df['price']):
        return False, "price must be numeric"
    
    return True, None


@uploads_bp.route('', methods=['POST'])
@jwt_required
def upload_file():
    """
    Upload and process a CSV file.
    
    Form Data:
        file: CSV file
    
    Returns:
        JSON: Upload session with processing status
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_FILE', 'message': 'No file provided'}
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': {'code': 'EMPTY_FILENAME', 'message': 'No file selected'}
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': {'code': 'INVALID_TYPE', 'message': 'Only CSV files are allowed'}
            }), 400
        
        # Create upload session
        upload_model = get_upload_model()
        upload_session = upload_model.create(
            user_id=g.current_user['user_id'],
            filename=secure_filename(file.filename),
            file_type='csv',
            file_size=len(file.read())
        )
        
        # Reset file pointer
        file.seek(0)
        
        # Read and validate CSV
        try:
            df = pd.read_csv(file)
        except Exception as e:
            upload_model.update_status(
                upload_session['upload_id'],
                UploadSession.STATUS_FAILED,
                error_message=f'Failed to read CSV: {str(e)}'
            )
            return jsonify({
                'success': False,
                'error': {'code': 'PARSE_ERROR', 'message': f'Failed to read CSV: {str(e)}'}
            }), 400
        
        # Validate structure
        is_valid, error_message = validate_csv_structure(df)
        if not is_valid:
            upload_model.update_status(
                upload_session['upload_id'],
                UploadSession.STATUS_FAILED,
                error_message=error_message
            )
            return jsonify({
                'success': False,
                'error': {'code': 'VALIDATION_ERROR', 'message': error_message}
            }), 400
        
        # Clean data
        df = df.dropna(subset=['product_name', 'date', 'units_sold', 'price'])
        df['units_sold'] = pd.to_numeric(df['units_sold'], errors='coerce').fillna(0).astype(int)
        df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0)
        
        if df.empty:
            upload_model.update_status(
                upload_session['upload_id'],
                UploadSession.STATUS_FAILED,
                error_message='No valid data rows after cleaning'
            )
            return jsonify({
                'success': False,
                'error': {'code': 'NO_DATA', 'message': 'No valid data rows after cleaning'}
            }), 400
        
        # Store sales data
        sales_model = get_sales_data_model()
        data_records = df.to_dict('records')
        inserted_count = sales_model.insert_many(
            user_id=g.current_user['user_id'],
            upload_id=upload_session['upload_id'],
            data=data_records
        )
        
        # Generate initial analytics and chart data
        analytics_service = AnalyticsService()
        product_df = sales_model.get_product_summary(g.current_user['user_id'], upload_session['upload_id'])
        daily_df = sales_model.get_daily_sales(g.current_user['user_id'], upload_session['upload_id'])
        
        analysis = analytics_service.analyze_product_performance(product_df)
        recommendations = analytics_service.generate_recommendations(analysis)
        
        # Generate chart data
        chart_data = analytics_service._generate_chart_data(product_df)
        
        # Merge analysis with chart data
        analysis_with_charts = {**analysis, **chart_data}
        
        # Update session with chart data
        upload_model.update_row_count(upload_session['upload_id'], len(df))
        upload_model.update_status(
            upload_session['upload_id'],
            UploadSession.STATUS_COMPLETED,
            results={
                'rows_processed': inserted_count,
                'products': df['product_name'].nunique(),
                'date_range': {
                    'start': df['date'].min(),
                    'end': df['date'].max()
                },
                **chart_data  # Include chart data in results
            }
        )
        
        return jsonify({
            'success': True,
            'message': 'File uploaded and processed successfully',
            'data': {
                'upload_id': upload_session['upload_id'],
                'filename': upload_session['filename'],
                'rows_processed': inserted_count,
                'products_count': df['product_name'].nunique(),
                'analysis': analysis_with_charts,
                'recommendations': recommendations
            }
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Upload error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Upload failed'}
        }), 500


@uploads_bp.route('', methods=['GET'])
@jwt_required
def list_uploads():
    """
    List user's upload sessions.
    
    Query Params:
        limit (int): Maximum results (default 50)
        status (str): Filter by status (optional)
    
    Returns:
        JSON: List of upload sessions
    """
    try:
        limit = min(int(request.args.get('limit', 50)), 100)
        status = request.args.get('status')
        
        upload_model = get_upload_model()
        
        if status:
            # Filter by status
            uploads = upload_model.find_by_user(g.current_user['user_id'], limit)
            uploads = [u for u in uploads if u.get('status') == status]
        else:
            uploads = upload_model.find_by_user(g.current_user['user_id'], limit)
        
        return jsonify({
            'success': True,
            'data': uploads
        })
        
    except Exception as e:
        current_app.logger.error(f'List uploads error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to list uploads'}
        }), 500


@uploads_bp.route('/<upload_id>', methods=['GET'])
@jwt_required
def get_upload(upload_id: str):
    """
    Get upload session details.
    
    Args:
        upload_id: Upload session identifier
    
    Returns:
        JSON: Upload session with results
    """
    try:
        upload_model = get_upload_model()
        upload = upload_model.find_by_upload_id(upload_id)
        
        if not upload:
            return jsonify({
                'success': False,
                'error': {'code': 'NOT_FOUND', 'message': 'Upload not found'}
            }), 404
        
        # Verify ownership
        if str(upload['user_id']) != g.current_user['user_id']:
            return jsonify({
                'success': False,
                'error': {'code': 'FORBIDDEN', 'message': 'Access denied'}
            }), 403
        
        return jsonify({
            'success': True,
            'data': upload
        })
        
    except Exception as e:
        current_app.logger.error(f'Get upload error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to get upload'}
        }), 500


@uploads_bp.route('/<upload_id>', methods=['DELETE'])
@jwt_required
def delete_upload(upload_id: str):
    """
    Delete an upload session and associated data.
    
    Args:
        upload_id: Upload session identifier
    
    Returns:
        JSON: Success message
    """
    try:
        upload_model = get_upload_model()
        sales_model = get_sales_data_model()
        
        upload = upload_model.find_by_upload_id(upload_id)
        
        if not upload:
            return jsonify({
                'success': False,
                'error': {'code': 'NOT_FOUND', 'message': 'Upload not found'}
            }), 404
        
        # Verify ownership
        if str(upload['user_id']) != g.current_user['user_id']:
            return jsonify({
                'success': False,
                'error': {'code': 'FORBIDDEN', 'message': 'Access denied'}
            }), 403
        
        # Delete sales data first
        sales_model.delete_by_upload_id(upload_id)
        
        # Delete upload session
        upload_model.delete(upload_id)
        
        return jsonify({
            'success': True,
            'message': 'Upload deleted successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f'Delete upload error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to delete upload'}
        }), 500


@uploads_bp.route('/<upload_id>/data', methods=['GET'])
@jwt_required
def get_upload_data(upload_id: str):
    """
    Get sales data for an upload.
    
    Args:
        upload_id: Upload session identifier
    
    Returns:
        JSON: Sales data
    """
    try:
        sales_model = get_sales_data_model()
        upload_model = get_upload_model()
        
        # Verify upload exists and user has access
        upload = upload_model.find_by_upload_id(upload_id)
        if not upload or str(upload['user_id']) != g.current_user['user_id']:
            return jsonify({
                'success': False,
                'error': {'code': 'NOT_FOUND', 'message': 'Upload not found'}
            }), 404
        
        # Get data
        data = sales_model.find_by_upload_id(upload_id)
        
        return jsonify({
            'success': True,
            'data': data
        })
        
    except Exception as e:
        current_app.logger.error(f'Get upload data error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to get data'}
        }), 500
