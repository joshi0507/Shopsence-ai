# -*- coding: utf-8 -*-
"""
Rate Limiter Middleware - Request Rate Limiting

Protects API endpoints from abuse using rate limiting.
"""

from flask import request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


def setup_rate_limiter(app):
    """
    Setup rate limiting for the application.
    
    Args:
        app: Flask application instance.
    
    Returns:
        Limiter: Configured limiter instance.
    """
    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=[app.config.get('RATE_LIMIT_DEFAULT', '100 per minute')],
        storage_uri="memory://",
        strategy="fixed-window"
    )
    
    return limiter


def get_rate_limit_config():
    """
    Get rate limit configuration for different endpoints.
    
    Returns:
        dict: Rate limit configurations.
    """
    return {
        'default': '100 per minute',
        'auth': '5 per minute',
        'upload': '10 per hour',
        'api': '100 per minute',
        'admin': '50 per minute'
    }
