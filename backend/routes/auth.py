# -*- coding: utf-8 -*-
"""
Authentication Routes - JWT-based Authentication

Handles user registration, login, logout, and token management.
"""

from flask import Blueprint, request, jsonify, current_app, g
from bson.errors import InvalidId
import re

from models.user import User
from services.auth_service import AuthService, jwt_required
from services.auth_service import jwt_required as jwt_required_decorator

auth_bp = Blueprint('auth', __name__)


def get_user_model():
    """Get user model from database connection."""
    from flask import current_app
    db = current_app.config['MONGO_DB']
    return User(db)


def get_auth_service():
    """Get authentication service."""
    return AuthService(
        secret_key=current_app.config['JWT_SECRET_KEY'],
        access_token_expires=current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 900),
        refresh_token_expires=current_app.config.get('JWT_REFRESH_TOKEN_EXPIRES', 604800)
    )


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password: str) -> tuple:
    """
    Validate password strength.
    
    Returns:
        tuple: (is_valid, error_message)
    """
    from flask import current_app
    is_dev = current_app.config.get('ENVIRONMENT') == 'development'
    
    # In development, be more lenient to speed up testing
    if is_dev:
        if len(password) < 4:
            return False, 'Password must be at least 4 characters long in development'
        return True, None

    # Production requirements
    if len(password) < 8:
        return False, 'Password must be at least 8 characters long'
    
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain at least one lowercase letter'
    
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    
    if not re.search(r'\d', password):
        return False, 'Password must contain at least one number'
    
    return True, None


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user.
    
    Request Body:
        username (str): Unique username
        email (str): Valid email address
        password (str): Password (min 8 chars, mixed case, numbers)
        company_name (str, optional): Company name
    
    Returns:
        JSON: User data with tokens
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': {'code': 'INVALID_REQUEST', 'message': 'Request body required'}
            }), 400
        
        # Extract and validate fields
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        company_name = data.get('company_name', '').strip()
        
        # Validation
        errors = []
        
        if not username:
            errors.append('Username is required')
        elif len(username) < 3:
            errors.append('Username must be at least 3 characters')
        
        if not email:
            errors.append('Email is required')
        elif not validate_email(email):
            errors.append('Invalid email format')
        
        if not password:
            errors.append('Password is required')
        else:
            is_valid, pwd_error = validate_password(password)
            if not is_valid:
                errors.append(pwd_error)
        
        if errors:
            return jsonify({
                'success': False,
                'error': {'code': 'VALIDATION_ERROR', 'message': '; '.join(errors)}
            }), 400
        
        # Create user
        user_model = get_user_model()
        user = user_model.create(
            username=username,
            email=email,
            password=password,
            company_name=company_name
        )
        
        # Generate tokens
        auth_service = get_auth_service()
        tokens = auth_service.generate_tokens(user)
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'data': tokens
        }), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': {'code': 'CONFLICT', 'message': str(e)}
        }), 409
    
    except Exception as e:
        current_app.logger.error(f'Registration error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Registration failed'}
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate user and return tokens.

    Request Body:
        identifier (str): Email or username
        password (str): Password

    Returns:
        JSON: User data with tokens
    """
    try:
        data = request.get_json()
        current_app.logger.info('Login attempt received')

        if not data:
            current_app.logger.warning('No JSON data received in login request')
            return jsonify({
                'success': False,
                'error': {'code': 'INVALID_REQUEST', 'message': 'Request body required'}
            }), 400

        identifier = data.get('identifier', '').strip()
        password = data.get('password', '')

        current_app.logger.debug(f'Login attempt for identifier: {identifier[:3]}***')

        if not identifier or not password:
            current_app.logger.warning('Missing credentials in login attempt')
            return jsonify({
                'success': False,
                'error': {'code': 'VALIDATION_ERROR', 'message': 'Email/username and password required'}
            }), 400

        # Authenticate
        user_model = get_user_model()
        user = user_model.authenticate(identifier, password)

        if not user:
            current_app.logger.warning(f'Failed login attempt for identifier: {identifier[:3]}***')
            return jsonify({
                'success': False,
                'error': {'code': 'INVALID_CREDENTIALS', 'message': 'Invalid email/username or password'}
            }), 401

        # Generate tokens
        auth_service = get_auth_service()
        tokens = auth_service.generate_tokens(user)

        current_app.logger.info(f'Login successful for user: {user.get("username")}')
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': tokens
        })

    except Exception as e:
        current_app.logger.error(f'Login error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': f'Login failed: {str(e)}'}
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required
def logout():
    """
    Revoke current user's tokens and logout.

    Request Body (optional):
        refresh_token (str): Refresh token to also revoke

    Returns:
        JSON: Success message
    """
    try:
        # Revoke access token
        auth_header = request.headers.get('Authorization')
        if auth_header:
            token = auth_header.split(' ')[1]
            auth_service = get_auth_service()
            auth_service.revoke_token(token)
            current_app.logger.info(f'Access token revoked: {token[:10]}...')

        # Also revoke refresh token if provided
        data = request.get_json() or {}
        refresh_token = data.get('refresh_token')
        if refresh_token:
            auth_service.revoke_token(refresh_token)
            current_app.logger.info(f'Refresh token revoked: {refresh_token[:10]}...')

        return jsonify({
            'success': True,
            'message': 'Logged out successfully'
        })
    except Exception as e:
        current_app.logger.error(f'Logout error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Logout failed'}
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """
    Refresh access token using refresh token.
    
    Request Body:
        refresh_token (str): Valid refresh token
    
    Returns:
        JSON: New token pair
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('refresh_token'):
            return jsonify({
                'success': False,
                'error': {'code': 'VALIDATION_ERROR', 'message': 'Refresh token required'}
            }), 400
        
        refresh_token = data['refresh_token']
        auth_service = get_auth_service()
        
        tokens = auth_service.refresh_access_token(refresh_token)
        
        if not tokens:
            return jsonify({
                'success': False,
                'error': {'code': 'INVALID_TOKEN', 'message': 'Invalid or expired refresh token'}
            }), 401
        
        return jsonify({
            'success': True,
            'data': tokens
        })
        
    except Exception as e:
        current_app.logger.error(f'Token refresh error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Token refresh failed'}
        }), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required
def get_current_user():
    """
    Get current authenticated user.
    
    Returns:
        JSON: User profile data
    """
    try:
        user_id = g.current_user.get('user_id')
        
        user_model = get_user_model()
        user = user_model.find_by_id(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': {'code': 'USER_NOT_FOUND', 'message': 'User not found'}
            }), 404
        
        return jsonify({
            'success': True,
            'data': user
        })
        
    except Exception as e:
        current_app.logger.error(f'Get user error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to get user'}
        }), 500


@auth_bp.route('/me', methods=['PUT'])
@jwt_required
def update_profile():
    """
    Update user profile.
    
    Request Body:
        company_name (str, optional): Company name
        preferences (dict, optional): User preferences
    
    Returns:
        JSON: Updated user data
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': {'code': 'INVALID_REQUEST', 'message': 'Request body required'}
            }), 400
        
        user_model = get_user_model()
        user = user_model.update_profile(g.current_user['user_id'], data)
        
        if not user:
            return jsonify({
                'success': False,
                'error': {'code': 'USER_NOT_FOUND', 'message': 'User not found'}
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Profile updated',
            'data': user
        })
        
    except Exception as e:
        current_app.logger.error(f'Update profile error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to update profile'}
        }), 500


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required
def change_password():
    """
    Change user password.
    
    Request Body:
        current_password (str): Current password
        new_password (str): New password
    
    Returns:
        JSON: Success message
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': {'code': 'INVALID_REQUEST', 'message': 'Request body required'}
            }), 400
        
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        
        if not current_password or not new_password:
            return jsonify({
                'success': False,
                'error': {'code': 'VALIDATION_ERROR', 'message': 'Current and new password required'}
            }), 400
        
        # Validate new password
        is_valid, pwd_error = validate_password(new_password)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': {'code': 'VALIDATION_ERROR', 'message': pwd_error}
            }), 400
        
        # Verify current password first
        user_model = get_user_model()
        user = user_model.authenticate(g.current_user['email'], current_password)
        
        if not user:
            return jsonify({
                'success': False,
                'error': {'code': 'INVALID_PASSWORD', 'message': 'Current password is incorrect'}
            }), 401
        
        # Change password
        success = user_model.change_password(g.current_user['user_id'], new_password)
        
        if not success:
            return jsonify({
                'success': False,
                'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to change password'}
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f'Change password error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to change password'}
        }), 500


@auth_bp.route('/me', methods=['DELETE'])
@jwt_required
def delete_account():
    """
    Permanently delete the current user account.
    """
    try:
        user_id = g.current_user['user_id']
        user_model = get_user_model()
        
        # In a real app, you might want to also delete their data collections here
        # For now, we'll just delete the user record
        success = user_model.delete(user_id)
        
        if not success:
            return jsonify({
                'success': False,
                'error': {'code': 'NOT_FOUND', 'message': 'User not found'}
            }), 404
            
        return jsonify({
            'success': True,
            'message': 'Account deleted successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f'Delete account error: {str(e)}')
        return jsonify({
            'success': False,
            'error': {'code': 'INTERNAL_ERROR', 'message': 'Failed to delete account'}
        }), 500
