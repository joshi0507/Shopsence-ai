# ShopSense AI - Authentication Tests
"""
Tests for authentication endpoints.
"""

import pytest
import json


class TestAuthRegistration:
    """Test user registration."""
    
    def test_register_success(self, client, db):
        """Test successful user registration."""
        response = client.post('/api/auth/register', json={
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'company_name': 'Test Corp'
        })
        
        data = response.get_json()
        
        assert response.status_code == 201
        assert data['success'] is True
        assert 'access_token' in data['data']
        assert 'refresh_token' in data['data']
        assert data['data']['user']['username'] == 'newuser'
    
    def test_register_duplicate_email(self, client, db, test_user):
        """Test registration with duplicate email."""
        response = client.post('/api/auth/register', json={
            'username': 'anotheruser',
            'email': 'test@example.com',  # Already exists
            'password': 'SecurePass123!'
        })
        
        data = response.get_json()
        
        assert response.status_code == 409
        assert data['success'] is False
    
    def test_register_weak_password(self, client, db):
        """Test registration with weak password."""
        response = client.post('/api/auth/register', json={
            'username': 'weakuser',
            'email': 'weak@example.com',
            'password': 'weak'  # Too short
        })
        
        data = response.get_json()
        
        assert response.status_code == 400
        assert data['success'] is False
        assert 'VALIDATION_ERROR' in data['error']['code']
    
    def test_register_invalid_email(self, client, db):
        """Test registration with invalid email."""
        response = client.post('/api/auth/register', json={
            'username': 'bademail',
            'email': 'not-an-email',
            'password': 'SecurePass123!'
        })
        
        data = response.get_json()
        
        assert response.status_code == 400
        assert data['success'] is False


class TestAuthLogin:
    """Test user login."""
    
    def test_login_success(self, client, db, test_user):
        """Test successful login."""
        response = client.post('/api/auth/login', json={
            'identifier': 'test@example.com',
            'password': 'Test123!@#'
        })
        
        data = response.get_json()
        
        assert response.status_code == 200
        assert data['success'] is True
        assert 'access_token' in data['data']
        assert 'refresh_token' in data['data']
    
    def test_login_wrong_password(self, client, db, test_user):
        """Test login with wrong password."""
        response = client.post('/api/auth/login', json={
            'identifier': 'test@example.com',
            'password': 'WrongPassword123!'
        })
        
        data = response.get_json()
        
        assert response.status_code == 401
        assert data['success'] is False
        assert 'INVALID_CREDENTIALS' in data['error']['code']
    
    def test_login_nonexistent_user(self, client, db):
        """Test login with non-existent user."""
        response = client.post('/api/auth/login', json={
            'identifier': 'nonexistent@example.com',
            'password': 'SomePassword123!'
        })
        
        data = response.get_json()
        
        assert response.status_code == 401
        assert data['success'] is False


class TestAuthProtected:
    """Test protected endpoints with JWT."""
    
    def test_get_current_user_authenticated(self, client, db, test_user, auth_token):
        """Test getting current user with valid token."""
        response = client.get(
            '/api/auth/me',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        data = response.get_json()
        
        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['username'] == 'testuser'
    
    def test_get_current_user_unauthenticated(self, client, db):
        """Test getting current user without token."""
        response = client.get('/api/auth/me')
        
        data = response.get_json()
        
        assert response.status_code == 401
        assert data['success'] is False
        assert 'TOKEN_MISSING' in data['error']['code']
    
    def test_get_current_user_invalid_token(self, client, db):
        """Test getting current user with invalid token."""
        response = client.get(
            '/api/auth/me',
            headers={'Authorization': 'Bearer invalid-token'}
        )
        
        data = response.get_json()
        
        assert response.status_code == 401
        assert data['success'] is False
        assert 'TOKEN_INVALID' in data['error']['code']
