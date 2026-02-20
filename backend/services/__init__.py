# ShopSense AI - Services Package
"""
Services package containing business logic and external integrations.
"""

from .auth_service import AuthService
from .analytics_service import AnalyticsService
from .forecast_service import ForecastService

__all__ = ['AuthService', 'AnalyticsService', 'ForecastService']
