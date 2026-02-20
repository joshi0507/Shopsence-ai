# -*- coding: utf-8 -*-
"""
Authentication Service - JWT-based Authentication

Handles user authentication, token generation, and validation.
"""

import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from functools import wraps
from flask import request, jsonify, current_app, g


class AuthService:
    """
    Authentication service for JWT-based auth.
    
    Provides token generation, validation, and refresh functionality.
    """
    
    def __init__(self, secret_key: str, access_token_expires: int = 900, refresh_token_expires: int = 604800):
        """
        Initialize authentication service.
        
        Args:
            secret_key: Secret key for JWT signing.
            access_token_expires: Access token expiration in seconds (default 15 min).
            refresh_token_expires: Refresh token expiration in seconds (default 7 days).
        """
        self.secret_key = secret_key
        self.access_token_expires = access_token_expires
        self.refresh_token_expires = refresh_token_expires
        self.algorithm = 'HS256'
    
    def generate_tokens(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate access and refresh tokens for a user.
        
        Args:
            user: User document.
        
        Returns:
            dict: Contains access_token, refresh_token, and expiration info.
        """
        access_token = self._create_token(
            user_id=str(user['_id']),
            username=user['username'],
            email=user['email'],
            role=user.get('role', 'user'),
            token_type='access',
            expires_in=self.access_token_expires
        )
        
        refresh_token = self._create_token(
            user_id=str(user['_id']),
            username=user['username'],
            email=user['email'],
            role=user.get('role', 'user'),
            token_type='refresh',
            expires_in=self.refresh_token_expires
        )
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'expires_in': self.access_token_expires,
            'user': {
                'id': str(user['_id']),
                'username': user['username'],
                'email': user['email'],
                'role': user.get('role', 'user'),
                'company_name': user.get('company_name')
            }
        }
    
    def _create_token(
        self,
        user_id: str,
        username: str,
        email: str,
        role: str,
        token_type: str,
        expires_in: int
    ) -> str:
        """
        Create a JWT token.
        
        Args:
            user_id: User ID.
            username: Username.
            email: Email.
            role: User role.
            token_type: Type of token (access or refresh).
            expires_in: Expiration time in seconds.
        
        Returns:
            str: Encoded JWT token.
        """
        now = datetime.utcnow()
        payload = {
            'user_id': user_id,
            'username': username,
            'email': email,
            'role': role,
            'token_type': token_type,
            'iat': now,
            'exp': now + timedelta(seconds=expires_in)
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str, token_type: str = 'access') -> Optional[Dict[str, Any]]:
        """
        Verify and decode a JWT token.
        
        Args:
            token: JWT token string.
            token_type: Expected token type (access or refresh).
        
        Returns:
            dict or None: Decoded token payload or None if invalid.
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Verify token type
            if payload.get('token_type') != token_type:
                return None
            
            # Check expiration (jwt.decode already verifies this, but double-check)
            if datetime.utcnow() > datetime.fromtimestamp(payload['exp']):
                return None
            
            return payload
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def refresh_access_token(self, refresh_token: str) -> Optional[Dict[str, Any]]:
        """
        Generate new access token using refresh token.
        
        Args:
            refresh_token: Valid refresh token.
        
        Returns:
            dict or None: New token pair or None if refresh token is invalid.
        """
        payload = self.verify_token(refresh_token, token_type='refresh')
        
        if not payload:
            return None
        
        # Create minimal user object for token generation
        user = {
            '_id': payload['user_id'],
            'username': payload['username'],
            'email': payload['email'],
            'role': payload.get('role', 'user')
        }
        
        return self.generate_tokens(user)
    
    def revoke_token(self, token: str) -> bool:
        """
        Revoke a token (add to blacklist).
        
        Note: For production, implement token blacklist in Redis/database.
        
        Args:
            token: Token to revoke.
        
        Returns:
            bool: True if successful.
        """
        # TODO: Implement token blacklist
        return True


def jwt_required(f):
    """
    Decorator to require JWT authentication for a route.
    
    Usage:
        @app.route('/protected')
        @jwt_required
        def protected_route():
            return jsonify({'user_id': g.current_user['user_id']})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'INVALID_TOKEN',
                        'message': 'Invalid authorization header format'
                    }
                }), 401
        
        if not token:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'TOKEN_MISSING',
                    'message': 'Authentication token required'
                }
            }), 401
        
        # Verify token
        auth_service = getattr(g, 'auth_service', None)
        if not auth_service:
            # Fallback: create service from app config
            auth_service = AuthService(
                secret_key=current_app.config['JWT_SECRET_KEY'],
                access_token_expires=current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 900),
                refresh_token_expires=current_app.config.get('JWT_REFRESH_TOKEN_EXPIRES', 604800)
            )
        
        payload = auth_service.verify_token(token, token_type='access')
        
        if not payload:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'TOKEN_INVALID',
                    'message': 'Invalid or expired token'
                }
            }), 401
        
        # Store user info in Flask's g object
        g.current_user = payload
        
        return f(*args, **kwargs)
    
    return decorated


def admin_required(f):
    """
    Decorator to require admin role for a route.
    
    Usage:
        @app.route('/admin/users')
        @admin_required
        def admin_route():
            return jsonify({'message': 'Admin access granted'})
    """
    @wraps(f)
    @jwt_required
    def decorated(*args, **kwargs):
        if g.current_user.get('role') != 'admin':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Admin access required'
                }
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated
