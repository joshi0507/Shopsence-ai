# -*- coding: utf-8 -*-
"""
User Model - MongoDB User Collection

Handles user authentication, authorization, and profile management.
"""

from datetime import datetime
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from typing import Optional, Dict, Any


class User:
    """User model for MongoDB operations."""
    
    COLLECTION_NAME = 'users'
    
    # User roles
    ROLE_USER = 'user'
    ROLE_ADMIN = 'admin'
    ROLE_VIEWER = 'viewer'
    
    def __init__(self, db):
        """
        Initialize User model.
        
        Args:
            db: MongoDB database connection.
        """
        self.db = db
        self.collection = db[self.COLLECTION_NAME]
        
        # Create indexes
        self.collection.create_index('email', unique=True)
        self.collection.create_index('username', unique=True)
        self.collection.create_index('is_active')
    
    def create(
        self,
        username: str,
        email: str,
        password: str,
        company_name: Optional[str] = None,
        role: str = ROLE_USER
    ) -> Dict[str, Any]:
        """
        Create a new user.
        
        Args:
            username: Unique username.
            email: Unique email address.
            password: Plain text password (will be hashed).
            company_name: Optional company name.
            role: User role (user, admin, viewer).
        
        Returns:
            dict: Created user document (without password hash).
        
        Raises:
            ValueError: If username or email already exists.
        """
        # Check for existing user
        if self.collection.find_one({'$or': [{'email': email}, {'username': username}]}):
            raise ValueError('Username or email already exists')
        
        user = {
            'username': username.lower().strip(),
            'email': email.lower().strip(),
            'password_hash': generate_password_hash(password),
            'role': role,
            'company_name': company_name,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'last_login': None,
            'is_active': True,
            'is_verified': False,
            'preferences': {
                'theme': 'dark',
                'timezone': 'UTC',
                'date_format': 'YYYY-MM-DD',
                'currency': 'USD'
            }
        }
        
        result = self.collection.insert_one(user)
        user['_id'] = result.inserted_id
        
        return self._sanitize_user(user)
    
    def find_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Find user by ID.
        
        Args:
            user_id: User ObjectId as string.
        
        Returns:
            dict or None: User document or None if not found.
        """
        user = self.collection.find_one({'_id': ObjectId(user_id), 'is_active': True})
        if user:
            return self._sanitize_user(user)
        return None
    
    def find_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Find user by email.
        
        Args:
            email: User email address.
        
        Returns:
            dict or None: User document or None if not found.
        """
        user = self.collection.find_one({'email': email.lower().strip(), 'is_active': True})
        if user:
            return self._sanitize_user(user)
        return None
    
    def find_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """
        Find user by username.
        
        Args:
            username: Username.
        
        Returns:
            dict or None: User document or None if not found.
        """
        user = self.collection.find_one({'username': username.lower().strip(), 'is_active': True})
        if user:
            return self._sanitize_user(user)
        return None
    
    def authenticate(self, identifier: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate user by email/username and password.
        
        Args:
            identifier: Email or username.
            password: Plain text password.
        
        Returns:
            dict or None: User document if authenticated, None otherwise.
        """
        identifier = identifier.lower().strip()
        
        # Find by email or username
        user = self.collection.find_one({
            '$or': [
                {'email': identifier},
                {'username': identifier}
            ],
            'is_active': True
        })
        
        if not user:
            return None
        
        # Verify password
        if not check_password_hash(user['password_hash'], password):
            return None
        
        # Update last login
        self.collection.update_one(
            {'_id': user['_id']},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        
        return self._sanitize_user(user)
    
    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update user profile.
        
        Args:
            user_id: User ObjectId as string.
            updates: Dictionary of fields to update.
        
        Returns:
            dict or None: Updated user document or None if not found.
        """
        allowed_fields = ['company_name', 'preferences']
        filtered_updates = {k: v for k, v in updates.items() if k in allowed_fields}
        
        if not filtered_updates:
            return self.find_by_id(user_id)
        
        filtered_updates['updated_at'] = datetime.utcnow()
        
        self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': filtered_updates}
        )
        
        return self.find_by_id(user_id)
    
    def change_password(self, user_id: str, new_password: str) -> bool:
        """
        Change user password.
        
        Args:
            user_id: User ObjectId as string.
            new_password: New plain text password.
        
        Returns:
            bool: True if successful, False otherwise.
        """
        result = self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {
                '$set': {
                    'password_hash': generate_password_hash(new_password),
                    'updated_at': datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    def deactivate(self, user_id: str) -> bool:
        """
        Deactivate user account.
        
        Args:
            user_id: User ObjectId as string.
        
        Returns:
            bool: True if successful, False otherwise.
        """
        result = self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {
                '$set': {
                    'is_active': False,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    def verify_email(self, user_id: str) -> bool:
        """
        Mark user email as verified.
        
        Args:
            user_id: User ObjectId as string.
        
        Returns:
            bool: True if successful, False otherwise.
        """
        result = self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'is_verified': True, 'updated_at': datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    def _sanitize_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """
        Remove sensitive fields from user document.
        
        Args:
            user: User document.
        
        Returns:
            dict: Sanitized user document.
        """
        user.pop('password_hash', None)
        # Convert ObjectId to string for JSON serialization
        if '_id' in user and user['_id'] is not None:
            user['_id'] = str(user['_id'])
        return user
