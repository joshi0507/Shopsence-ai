# ShopSense AI - Security Configuration Tests
"""
Tests for security configuration.
"""

import pytest
import os


class TestSecurityConfig:
    """Test security configuration."""
    
    def test_missing_required_vars(self):
        """Test validation fails with missing required variables."""
        # Save original values
        original_secret = os.environ.get('SECRET_KEY')
        original_jwt = os.environ.get('JWT_SECRET_KEY')
        
        # Remove required variables
        os.environ.pop('SECRET_KEY', None)
        os.environ.pop('JWT_SECRET_KEY', None)
        
        # Clear cached config
        import security_config
        security_config._config = None
        
        with pytest.raises(EnvironmentError):
            from security_config import get_security_config
            get_security_config()
        
        # Restore original values
        if original_secret:
            os.environ['SECRET_KEY'] = original_secret
        if original_jwt:
            os.environ['JWT_SECRET_KEY'] = original_jwt
    
    def test_insecure_default_values(self):
        """Test validation fails with insecure default values."""
        # Set insecure values
        os.environ['SECRET_KEY'] = 'CHANGE_THIS_TO_A_SECURE_RANDOM_STRING'
        os.environ['JWT_SECRET_KEY'] = 'CHANGE_THIS_TO_ANOTHER_SECURE_RANDOM_STRING'
        
        # Clear cached config
        import security_config
        security_config._config = None
        
        with pytest.raises(EnvironmentError):
            from security_config import get_security_config
            get_security_config()
    
    def test_valid_config(self):
        """Test valid configuration loads successfully."""
        os.environ['SECRET_KEY'] = 'a' * 32  # 32 character secure key
        os.environ['JWT_SECRET_KEY'] = 'b' * 32
        os.environ['MONGO_URI'] = 'mongodb://localhost:27017/test'
        
        # Clear cached config
        import security_config
        security_config._config = None
        
        from security_config import get_security_config
        config = get_security_config()
        
        assert config is not None
        assert config.SECRET_KEY == 'a' * 32
    
    def test_production_security_validation(self):
        """Test production security settings validation."""
        os.environ['FLASK_ENV'] = 'production'
        os.environ['FLASK_DEBUG'] = 'True'  # Should be False in production
        os.environ['SECRET_KEY'] = 'a' * 32
        os.environ['JWT_SECRET_KEY'] = 'b' * 32
        os.environ['MONGO_URI'] = 'mongodb://localhost:27017/test'
        os.environ['SESSION_COOKIE_SECURE'] = 'False'
        
        # Clear cached config
        import security_config
        security_config._config = None
        
        with pytest.raises(EnvironmentError):
            from security_config import get_security_config
            get_security_config()
        
        # Reset to development
        os.environ['FLASK_ENV'] = 'development'
        os.environ['FLASK_DEBUG'] = 'False'
