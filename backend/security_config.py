# -*- coding: utf-8 -*-
"""
ShopSense AI - Security Configuration Module

This module provides secure configuration management, environment validation,
and security utilities for the application.
"""

import os
import secrets
import logging
from typing import Optional, List
from dotenv import load_dotenv
from functools import wraps

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class SecurityConfig:
    """
    Centralized security configuration management.
    
    Validates required environment variables and provides secure defaults.
    """
    
    # Required environment variables
    REQUIRED_VARS = [
        'SECRET_KEY',
        'MONGO_URI',
        'JWT_SECRET_KEY',
    ]
    
    # Optional environment variables with defaults
    DEFAULTS = {
        'FLASK_ENV': 'development',
        'FLASK_DEBUG': 'False',
        'JWT_ACCESS_TOKEN_EXPIRES': '900',  # 15 minutes
        'JWT_REFRESH_TOKEN_EXPIRES': '604800',  # 7 days
        'MAX_UPLOAD_SIZE_MB': '50',
        'RATE_LIMIT_DEFAULT': '100 per minute',
        'RATE_LIMIT_AUTH': '5 per minute',
        'RATE_LIMIT_UPLOAD': '10 per hour',
        'LOG_LEVEL': 'INFO',
        'CORS_ORIGINS': 'http://localhost:5173,http://127.0.0.1:5173',
        'SESSION_COOKIE_SECURE': 'False',
        'SESSION_COOKIE_HTTPONLY': 'True',
        'SESSION_COOKIE_SAMESITE': 'Lax',
    }
    
    def __init__(self):
        """Initialize and validate security configuration."""
        self._validate_required_vars()
        self._load_config()
    
    def _validate_required_vars(self) -> None:
        """
        Validate that all required environment variables are set.
        
        Raises:
            EnvironmentError: If any required variable is missing or has default value.
        """
        missing_vars = []
        insecure_defaults = []
        
        for var in self.REQUIRED_VARS:
            value = os.getenv(var)
            
            if value is None:
                missing_vars.append(var)
            elif value.startswith('CHANGE_THIS') or value.startswith('REPLACE') or value.startswith('YOUR_'):
                insecure_defaults.append(var)
        
        if missing_vars:
            error_msg = (
                f"Missing required environment variables: {', '.join(missing_vars)}\n"
                f"Please copy .env.example to .env and configure all required variables."
            )
            logger.error(error_msg)
            raise EnvironmentError(error_msg)
        
        if insecure_defaults:
            error_msg = (
                f"Security Alert: Using insecure default values for: {', '.join(insecure_defaults)}\n"
                f"Please update your .env file with secure, randomly generated values."
            )
            logger.error(error_msg)
            raise EnvironmentError(error_msg)
    
    def _load_config(self) -> None:
        """Load configuration from environment variables."""
        # Application settings
        self.FLASK_ENV = os.getenv('FLASK_ENV', self.DEFAULTS['FLASK_ENV'])
        self.FLASK_DEBUG = os.getenv('FLASK_DEBUG', self.DEFAULTS['FLASK_DEBUG']).lower() == 'true'
        
        # Security keys
        self.SECRET_KEY = os.getenv('SECRET_KEY')
        self.JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
        
        # Database
        self.MONGO_URI = os.getenv('MONGO_URI')
        
        # Google Gemini AI
        self.GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
        
        # JWT settings
        self.JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', self.DEFAULTS['JWT_ACCESS_TOKEN_EXPIRES']))
        self.JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', self.DEFAULTS['JWT_REFRESH_TOKEN_EXPIRES']))
        
        # Upload settings
        self.MAX_UPLOAD_SIZE_MB = int(os.getenv('MAX_UPLOAD_SIZE_MB', self.DEFAULTS['MAX_UPLOAD_SIZE_MB']))
        self.UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', './uploads')
        self.ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'csv').split(','))
        
        # Rate limiting
        self.RATE_LIMIT_DEFAULT = os.getenv('RATE_LIMIT_DEFAULT', self.DEFAULTS['RATE_LIMIT_DEFAULT'])
        self.RATE_LIMIT_AUTH = os.getenv('RATE_LIMIT_AUTH', self.DEFAULTS['RATE_LIMIT_AUTH'])
        self.RATE_LIMIT_UPLOAD = os.getenv('RATE_LIMIT_UPLOAD', self.DEFAULTS['RATE_LIMIT_UPLOAD'])
        
        # CORS
        self.CORS_ORIGINS = self._parse_cors_origins(os.getenv('CORS_ORIGINS', self.DEFAULTS['CORS_ORIGINS']))
        
        # Session settings
        self.SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', self.DEFAULTS['SESSION_COOKIE_SECURE']).lower() == 'true'
        self.SESSION_COOKIE_HTTPONLY = os.getenv('SESSION_COOKIE_HTTPONLY', self.DEFAULTS['SESSION_COOKIE_HTTPONLY']).lower() == 'true'
        self.SESSION_COOKIE_SAMESITE = os.getenv('SESSION_COOKIE_SAMESITE', self.DEFAULTS['SESSION_COOKIE_SAMESITE'])
        
        # Logging
        self.LOG_LEVEL = os.getenv('LOG_LEVEL', self.DEFAULTS['LOG_LEVEL'])
        self.LOG_FILE = os.getenv('LOG_FILE', './logs/shopsense.log')
        
        # Validate production security settings
        if self.FLASK_ENV == 'production':
            self._validate_production_security()
    
    def _parse_cors_origins(self, cors_string: str) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in cors_string.split(',')]
    
    def _validate_production_security(self) -> None:
        """
        Validate security settings for production environment.
        
        Raises:
            EnvironmentError: If security settings are inadequate for production.
        """
        warnings = []
        
        if self.FLASK_DEBUG:
            warnings.append("FLASK_DEBUG should be False in production")
        
        if not self.SESSION_COOKIE_SECURE:
            warnings.append("SESSION_COOKIE_SECURE should be True in production")
        
        # Check SECRET_KEY strength
        if len(self.SECRET_KEY) < 32:
            warnings.append("SECRET_KEY should be at least 32 characters")
        
        if warnings:
            error_msg = (
                f"Production Security Warnings:\n" +
                "\n".join(f"  - {warning}" for warning in warnings) +
                "\n\nPlease fix these issues before deploying to production."
            )
            logger.error(error_msg)
            raise EnvironmentError(error_msg)
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.FLASK_ENV == 'production'
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.FLASK_ENV == 'development'
    
    def get_flask_config(self) -> dict:
        """
        Get Flask application configuration dictionary.
        
        Returns:
            dict: Flask configuration parameters.
        """
        return {
            'SECRET_KEY': self.SECRET_KEY,
            'ENVIRONMENT': self.FLASK_ENV,
            'DEBUG': self.FLASK_DEBUG,
            'MONGO_URI': self.MONGO_URI,
            'MAX_CONTENT_LENGTH': self.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
            'UPLOAD_FOLDER': self.UPLOAD_FOLDER,
            'JWT_SECRET_KEY': self.JWT_SECRET_KEY,
            'JWT_ACCESS_TOKEN_EXPIRES': self.JWT_ACCESS_TOKEN_EXPIRES,
            'JWT_REFRESH_TOKEN_EXPIRES': self.JWT_REFRESH_TOKEN_EXPIRES,
            'SESSION_COOKIE_SECURE': self.SESSION_COOKIE_SECURE,
            'SESSION_COOKIE_HTTPONLY': self.SESSION_COOKIE_HTTPONLY,
            'SESSION_COOKIE_SAMESITE': self.SESSION_COOKIE_SAMESITE,
        }
    
    def get_cors_config(self) -> dict:
        """
        Get CORS configuration dictionary.
        
        Returns:
            dict: CORS configuration parameters.
        """
        return {
            'resources': {r"/*": {"origins": self.CORS_ORIGINS}},
            'supports_credentials': True,
            'allow_headers': ["Content-Type", "Authorization"],
            'methods': ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        }
    
    def get_logging_config(self) -> dict:
        """
        Get logging configuration dictionary.
        
        Returns:
            dict: Logging configuration parameters.
        """
        return {
            'level': getattr(logging, self.LOG_LEVEL.upper(), logging.INFO),
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            'file': self.LOG_FILE,
        }


def validate_environment(func):
    """
    Decorator to validate environment before executing a function.
    
    Usage:
        @validate_environment
        def create_app():
            ...
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            config = SecurityConfig()
            logger.info(f"Environment validated successfully ({config.FLASK_ENV})")
        except EnvironmentError as e:
            logger.critical(f"Environment validation failed: {e}")
            raise
        return func(*args, **kwargs)
    return wrapper


def generate_secure_key(length: int = 32) -> str:
    """
    Generate a cryptographically secure random key.
    
    Args:
        length: Length of the key in bytes (default 32).
    
    Returns:
        str: Hex-encoded secure random key.
    """
    return secrets.token_hex(length)


def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename to prevent directory traversal attacks.
    
    Args:
        filename: Original filename.
    
    Returns:
        str: Sanitized filename.
    """
    from werkzeug.utils import secure_filename
    return secure_filename(filename)


def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
    """
    Validate that a file has an allowed extension.
    
    Args:
        filename: Name of the file to validate.
        allowed_extensions: Set of allowed extensions.
    
    Returns:
        bool: True if extension is allowed, False otherwise.
    """
    if '.' not in filename:
        return False
    
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in allowed_extensions


# Create global config instance (lazy initialization)
_config: Optional[SecurityConfig] = None


def get_security_config() -> SecurityConfig:
    """
    Get or create the global security configuration instance.
    
    Returns:
        SecurityConfig: Global configuration instance.
    """
    global _config
    if _config is None:
        _config = SecurityConfig()
    return _config


# Convenience functions
def is_production() -> bool:
    """Check if running in production."""
    return get_security_config().is_production


def is_development() -> bool:
    """Check if running in development."""
    return get_security_config().is_development


def get_secret_key() -> str:
    """Get the application secret key."""
    return get_security_config().SECRET_KEY


def get_jwt_secret() -> str:
    """Get the JWT secret key."""
    return get_security_config().JWT_SECRET_KEY
