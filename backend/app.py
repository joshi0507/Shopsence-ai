# -*- coding: utf-8 -*-
"""
ShopSense AI - Main Application Entry Point

A professional, AI-powered business analytics platform.
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import timedelta

from flask import Flask, g
from flask_cors import CORS
from flask_socketio import SocketIO
from pymongo import MongoClient
from flask_limiter import Limiter
from flask_talisman import Talisman
import sys
# Ensure the backend directory is in the path for consistent imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Import configuration and security
from security_config import SecurityConfig, get_security_config
from config import config as config_class

# Import blueprints
from routes.auth import auth_bp
from routes.uploads import uploads_bp
from routes.analytics import analytics_bp
from routes.dashboard import dashboard_bp
from routes.exports import exports_bp
from routes.behavior import behavior_bp

# Import middleware
from middleware.error_handler import ErrorHandler
from middleware.rate_limiter import setup_rate_limiter

# Import services
from services.auth_service import AuthService


def create_app(config_name: str = None):
    """
    Application factory for creating Flask app instances.
    
    Args:
        config_name: Configuration name ('development', 'production', or None for auto).
    
    Returns:
        Flask: Configured application instance.
    """
    # Initialize app
    app = Flask(__name__)
    
    # Load security configuration
    try:
        security_config = get_security_config()
    except EnvironmentError as e:
        # Log error but continue for development
        print(f"⚠️  Security Config Warning: {e}")
        security_config = None
    
    # Load configuration
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    # Get config class with proper fallback
    config_obj = config_class.get(config_name) or config_class['development']
    app.config.from_object(config_obj)
    
    # Override with security config if available
    if security_config:
        for key, value in security_config.get_flask_config().items():
            app.config[key] = value
    
    # Setup logging
    setup_logging(app)
    
    # Initialize database
    init_database(app)
    
    # Setup CORS
    setup_cors(app)
    
    # Setup rate limiting
    setup_rate_limiting(app)
    
    # Setup security headers (production only)
    if os.getenv('FLASK_ENV') == 'production':
        setup_security_headers(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Register error handlers
    ErrorHandler.register(app)
    
    # Setup SocketIO
    socketio = SocketIO(
        app,
        cors_allowed_origins=app.config.get('CORS_ORIGINS', ['http://localhost:5173']),
        async_mode='eventlet'
    )
    
    # Setup real-time features
    setup_realtime_features(app, socketio)
    
    # Register CLI commands
    register_cli_commands(app)
    
    app.logger.info(f"ShopSense AI initialized ({config_name} mode)")
    
    return app


def setup_logging(app: Flask):
    """
    Configure application logging.
    
    Args:
        app: Flask application instance.
    """
    # Create logs directory
    os.makedirs('logs', exist_ok=True)
    
    # File handler
    file_handler = RotatingFileHandler(
        'logs/shopsense.log',
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))
    
    # App logger
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(logging.INFO)
    
    app.logger.info('ShopSense AI logging initialized')


def init_database(app: Flask):
    """
    Initialize MongoDB connection.
    
    Args:
        app: Flask application instance.
    """
    mongo_uri = app.config.get('MONGO_URI', 'mongodb://localhost:27017/shopsense_analytics')
    
    try:
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,
            socketTimeoutMS=45000
        )
        
        # Test connection
        client.admin.command('ping')
        
        # Get database name from config or use default
        db_name = app.config.get('MONGO_DB_NAME', 'shopsense_analytics')
        db = client[db_name]
        app.config['MONGO_DB'] = db
        app.config['MONGO_CLIENT'] = client
        
        # Create TTL index for blacklisted tokens (expires automatically)
        db['blacklisted_tokens'].create_index('expires_at', expireAfterSeconds=0)
        
        app.logger.info(f'MongoDB connected to database: {db_name}')

    except Exception as e:
        app.logger.error(f'MongoDB connection failed: {str(e)}')
        # Don't raise - allow app to start for development


def setup_cors(app: Flask):
    """
    Configure CORS.
    
    Args:
        app: Flask application instance.
    """
    cors_origins = app.config.get('CORS_ORIGINS', ['http://localhost:5173', 'http://127.0.0.1:5173'])
    
    CORS(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    
    app.logger.info(f'CORS configured for: {cors_origins}')


def setup_rate_limiting(app: Flask):
    """
    Configure rate limiting.
    
    Args:
        app: Flask application instance.
    """
    limiter = setup_rate_limiter(app)
    
    # Store limiter in app config for route-specific limits
    app.config['RATE_LIMITER'] = limiter
    
    app.logger.info('Rate limiting configured')


def setup_security_headers(app: Flask):
    """
    Configure security headers for production.
    
    Args:
        app: Flask application instance.
    """
    Talisman(
        app,
        force_https=True,
        strict_transport_security=True,
        strict_transport_security_max_age=31536000,
        content_security_policy={
            'default-src': "'self'",
            'script-src': ["'self'", "'unsafe-inline'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", 'data:', 'https:'],
            'font-src': ["'self'", 'https:', 'data:'],
        }
    )
    
    app.logger.info('Security headers configured')


def register_blueprints(app: Flask):
    """
    Register Flask blueprints.

    Args:
        app: Flask application instance.
    """
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(uploads_bp, url_prefix='/api/v1/uploads')
    app.register_blueprint(analytics_bp, url_prefix='/api/v1/analytics')
    app.register_blueprint(dashboard_bp, url_prefix='/api/v1/dashboard')
    app.register_blueprint(exports_bp, url_prefix='/api/v1/exports')
    app.register_blueprint(behavior_bp, url_prefix='/api/v1/behavior')

    @app.route('/api/v1/health')
    def health_check():
        """Health check endpoint for monitoring."""
        return {'status': 'healthy', 'version': '1.0.0', 'environment': app.config.get('ENVIRONMENT')}

    app.logger.info('API blueprints registered')


def setup_realtime_features(app: Flask, socketio: SocketIO):
    """
    Setup real-time features with SocketIO.
    
    Args:
        app: Flask application instance.
        socketio: SocketIO instance.
    """
    @socketio.on('connect')
    def handle_connect():
        from flask_socketio import emit
        emit('connected', {'message': 'Connected to ShopSense AI'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        app.logger.info('Client disconnected')
    
    app.logger.info('Real-time features configured')


def register_cli_commands(app: Flask):
    """
    Register CLI commands.
    
    Args:
        app: Flask application instance.
    """
    @app.cli.command('create-admin')
    def create_admin():
        """Create an admin user."""
        from models.user import User
        
        username = input('Username: ')
        email = input('Email: ')
        password = input('Password: ')
        
        db = app.config['MONGO_DB']
        user_model = User(db)
        
        try:
            user = user_model.create(
                username=username,
                email=email,
                password=password,
                role='admin'
            )
            print(f'Admin user created: {user["username"]}')
        except ValueError as e:
            print(f'❌ Error: {e}')
    
    @app.cli.command('db:info')
    def db_info():
        """Show database information."""
        db = app.config.get('MONGO_DB')
        
        if not db:
            print('❌ Database not connected')
            return
        
        collections = db.list_collection_names()
        print(f'Connected to MongoDB')
        print(f'Collections: {", ".join(collections) or "None"}')


# Create app instance for WSGI
app = create_app()


if __name__ == '__main__':
    # Get configuration
    is_production = os.getenv('FLASK_ENV') == 'production'
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    
    if is_production:
        # Production: Use gunicorn (run with: gunicorn app:app)
        print(f"Starting ShopSense AI in production mode on {host}:{port}")
        app.run(host=host, port=port, threaded=True)
    else:
        # Development: Use Flask dev server
        print(f"Starting ShopSense AI in development mode on {host}:{port}")
        app.run(
            host=host,
            port=port,
            debug=True,
            threaded=True,
            use_reloader=True
        )
