# -*- coding: utf-8 -*-
"""
Helpers - Helper Functions

Provides utility functions used across the application.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from flask import jsonify


def generate_upload_id() -> str:
    """
    Generate a unique upload ID.
    
    Returns:
        str: UUID string.
    """
    return str(uuid.uuid4())


def format_response(
    success: bool,
    data: Optional[Any] = None,
    message: Optional[str] = None,
    error: Optional[Dict[str, str]] = None,
    meta: Optional[Dict[str, Any]] = None,
    status_code: int = 200
):
    """
    Format a standardized API response.
    
    Args:
        success: Whether the request was successful.
        data: Response data.
        message: Success message.
        error: Error details.
        meta: Additional metadata.
        status_code: HTTP status code.
    
    Returns:
        tuple: (response_json, status_code)
    """
    response = {
        'success': success,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if data is not None:
        response['data'] = data
    
    if message:
        response['message'] = message
    
    if error:
        response['error'] = error
    
    if meta:
        response['meta'] = meta
    
    return jsonify(response), status_code


def parse_date(date_string: str, formats: list = None) -> Optional[datetime]:
    """
    Parse date string with multiple format support.
    
    Args:
        date_string: Date string to parse.
        formats: List of date formats to try.
    
    Returns:
        datetime or None: Parsed datetime or None if parsing fails.
    """
    if formats is None:
        formats = [
            '%Y-%m-%d',
            '%Y/%m/%d',
            '%d-%m-%Y',
            '%d/%m/%Y',
            '%m-%d-%Y',
            '%m/%d/%Y',
            '%Y-%m-%d %H:%M:%S',
            '%Y/%m/%d %H:%M:%S'
        ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_string, fmt)
        except ValueError:
            continue
    
    return None


def sanitize_string(value: str, max_length: int = 1000) -> str:
    """
    Sanitize string input.
    
    Args:
        value: String to sanitize.
        max_length: Maximum allowed length.
    
    Returns:
        str: Sanitized string.
    """
    if not value:
        return ''
    
    # Strip whitespace
    value = value.strip()
    
    # Truncate if too long
    if len(value) > max_length:
        value = value[:max_length]
    
    return value
