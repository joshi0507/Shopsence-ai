import os
from dotenv import load_dotenv

load_dotenv()


def _get_required_secret():
    """Get required secret key or raise error if not set."""
    secret_key = os.getenv('SECRET_KEY')
    if not secret_key:
        raise ValueError("SECRET_KEY environment variable is required. Please set it in your .env file.")
    if secret_key in ('dev-secret-key-change-in-production', 'CHANGE_THIS', 'YOUR_SECRET_KEY'):
        raise ValueError("SECRET_KEY must be changed from the default value. Generate a secure random key.")
    return secret_key


class Config:
    SECRET_KEY = _get_required_secret()
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/shopsense_analytics')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    
    # Environment settings
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    ENVIRONMENT = os.getenv('FLASK_ENV', 'development')
    
    # Production settings
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')


class ProductionConfig(Config):
    DEBUG = False
    
    def __init__(self):
        super().__init__()
        # Additional production validations
        if len(self.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters in production")


class DevelopmentConfig(Config):
    DEBUG = True


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
