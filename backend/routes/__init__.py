# ShopSense AI - Backend Routes Package
"""
Routes package containing all API endpoint blueprints.
"""

from .auth import auth_bp
from .uploads import uploads_bp
from .analytics import analytics_bp
from .dashboard import dashboard_bp

__all__ = ['auth_bp', 'uploads_bp', 'analytics_bp', 'dashboard_bp']
