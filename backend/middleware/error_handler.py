# -*- coding: utf-8 -*-
"""
Error Handler Middleware - Centralized Error Handling

Provides consistent error responses across the application.
"""

from flask import jsonify, current_app
import traceback


class ErrorHandler:
    """
    Centralized error handling for the application.
    
    Registers error handlers for common HTTP errors and exceptions.
    """
    
    @staticmethod
    def register(app):
        """
        Register error handlers with Flask app.
        
        Args:
            app: Flask application instance.
        """
        
        @app.errorhandler(400)
        def bad_request(error):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'BAD_REQUEST',
                    'message': str(error.description) if hasattr(error, 'description') else 'Bad request'
                }
            }), 400
        
        @app.errorhandler(401)
        def unauthorized(error):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'UNAUTHORIZED',
                    'message': 'Authentication required'
                }
            }), 401
        
        @app.errorhandler(403)
        def forbidden(error):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Access denied'
                }
            }), 403
        
        @app.errorhandler(404)
        def not_found(error):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NOT_FOUND',
                    'message': 'Resource not found'
                }
            }), 404
        
        @app.errorhandler(405)
        def method_not_allowed(error):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'METHOD_NOT_ALLOWED',
                    'message': 'Method not allowed'
                }
            }), 405
        
        @app.errorhandler(429)
        def rate_limit_exceeded(error):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'RATE_LIMIT_EXCEEDED',
                    'message': 'Too many requests. Please try again later.'
                }
            }), 429
        
        @app.errorhandler(500)
        def internal_error(error):
            current_app.logger.error(f'Internal error: {str(error)}')
            current_app.logger.error(traceback.format_exc())
            
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INTERNAL_ERROR',
                    'message': 'An internal error occurred'
                }
            }), 500
        
        @app.errorhandler(503)
        def service_unavailable(error):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'SERVICE_UNAVAILABLE',
                    'message': 'Service temporarily unavailable'
                }
            }), 503
