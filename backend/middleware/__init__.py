# ShopSense AI - Middleware Package
"""
Middleware package containing request/response middleware.
"""

from .auth_middleware import jwt_required, admin_required
from .error_handler import ErrorHandler
from .rate_limiter import setup_rate_limiter

__all__ = ['jwt_required', 'admin_required', 'ErrorHandler', 'setup_rate_limiter']
