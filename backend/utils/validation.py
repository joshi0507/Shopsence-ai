# -*- coding: utf-8 -*-
"""
Input Validation and Sanitization Utilities

Provides secure input validation for:
- User inputs (username, email, password)
- File uploads
- Query parameters
- JSON payloads

Security Best Practices:
- Never trust user input
- Validate on server-side (client-side can be bypassed)
- Use allowlists, not denylists
- Sanitize before storing/displaying
"""

import re
import html
import os
from typing import Any, Dict, List, Optional, Tuple, Union
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


# =============================================================================
# Constants and Patterns
# =============================================================================

# Maximum lengths
MAX_USERNAME_LENGTH = 30
MAX_EMAIL_LENGTH = 254
MAX_PASSWORD_LENGTH = 128
MAX_FILENAME_LENGTH = 255
MAX_UPLOAD_SIZE_MB = 50

# Regex patterns
USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_]{3,30}$')
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
SAFE_STRING_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-_.,!?@#$%&*()+=:;\'\"<>\/\[\]{}|\\ ]*$')

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.csv'}
ALLOWED_MIME_TYPES = {
    'text/csv',
    'application/vnd.ms-excel',
    'text/plain'
}

# Dangerous characters for SQL/NoSQL injection prevention
DANGEROUS_CHARS = re.compile(r'[<>"\';\x00-\x1f\x7f]')


# =============================================================================
# String Validation
# =============================================================================

def validate_username(username: str) -> Tuple[bool, Optional[str]]:
    """
    Validate username format
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not username or not isinstance(username, str):
        return False, "Username is required"
    
    if len(username) < 3 or len(username) > MAX_USERNAME_LENGTH:
        return False, f"Username must be 3-{MAX_USERNAME_LENGTH} characters"
    
    if not USERNAME_PATTERN.match(username):
        return False, "Username can only contain letters, numbers, and underscores"
    
    return True, None


def validate_email(email: str) -> Tuple[bool, Optional[str]]:
    """
    Validate email format
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not email or not isinstance(email, str):
        return False, "Email is required"
    
    if len(email) > MAX_EMAIL_LENGTH:
        return False, f"Email must be less than {MAX_EMAIL_LENGTH} characters"
    
    if not EMAIL_PATTERN.match(email):
        return False, "Invalid email format"
    
    # Check for common typos
    domain = email.split('@')[-1].lower()
    common_domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
    if domain not in common_domains and '.' not in domain:
        return False, "Invalid email domain"
    
    return True, None


def validate_password(password: str, is_production: bool = True) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password or not isinstance(password, str):
        return False, "Password is required"
    
    min_length = 8 if is_production else 4
    if len(password) < min_length:
        return False, f"Password must be at least {min_length} characters"
    
    if len(password) > MAX_PASSWORD_LENGTH:
        return False, f"Password must be less than {MAX_PASSWORD_LENGTH} characters"
    
    if is_production:
        # Check for complexity
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password)
        
        if not (has_upper and has_lower and has_digit):
            return False, "Password must contain uppercase, lowercase, and numbers"
    
    return True, None


def sanitize_string(value: str, max_length: int = 1000) -> str:
    """
    Sanitize string by removing dangerous characters and escaping HTML
    
    Args:
        value: Input string
        max_length: Maximum allowed length
    
    Returns:
        Sanitized string
    """
    if not value or not isinstance(value, str):
        return ""
    
    # Truncate
    value = value[:max_length]
    
    # Remove null bytes and control characters
    value = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', value)
    
    # Escape HTML entities
    value = html.escape(value)
    
    # Remove dangerous characters
    value = DANGEROUS_CHARS.sub('', value)
    
    return value.strip()


def validate_safe_string(value: str, field_name: str = "Input") -> Tuple[bool, Optional[str]]:
    """
    Validate that string contains only safe characters
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not value or not isinstance(value, str):
        return False, f"{field_name} is required"
    
    if len(value) > 500:
        return False, f"{field_name} is too long"
    
    if not SAFE_STRING_PATTERN.match(value):
        return False, f"{field_name} contains invalid characters"
    
    return True, None


# =============================================================================
# Number Validation
# =============================================================================

def validate_positive_integer(value: Any, field_name: str = "Value", 
                             max_value: int = 1000000) -> Tuple[bool, Optional[int], Optional[str]]:
    """
    Validate and convert to positive integer
    
    Returns:
        Tuple of (is_valid, sanitized_value, error_message)
    """
    try:
        int_value = int(value)
        
        if int_value <= 0:
            return False, None, f"{field_name} must be positive"
        
        if int_value > max_value:
            return False, None, f"{field_name} exceeds maximum value ({max_value})"
        
        return True, int_value, None
    
    except (ValueError, TypeError):
        return False, None, f"{field_name} must be a number"


def validate_float(value: Any, field_name: str = "Value",
                  min_value: float = 0.0, max_value: float = 1000000.0) -> Tuple[bool, Optional[float], Optional[str]]:
    """
    Validate and convert to float within range
    
    Returns:
        Tuple of (is_valid, sanitized_value, error_message)
    """
    try:
        float_value = float(value)
        
        if float_value < min_value:
            return False, None, f"{field_name} must be at least {min_value}"
        
        if float_value > max_value:
            return False, None, f"{field_name} must be at most {max_value}"
        
        return True, float_value, None
    
    except (ValueError, TypeError):
        return False, None, f"{field_name} must be a number"


# =============================================================================
# File Validation
# =============================================================================

def validate_filename(filename: str) -> Tuple[bool, Optional[str]]:
    """
    Validate filename for security
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not filename:
        return False, "Filename is required"
    
    if len(filename) > MAX_FILENAME_LENGTH:
        return False, f"Filename too long (max {MAX_FILENAME_LENGTH} characters)"
    
    # Check for path traversal
    if '..' in filename or '/' in filename or '\\' in filename:
        return False, "Invalid filename"
    
    # Check extension
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
    
    return True, None


def validate_file_size(file_size_bytes: int, max_mb: int = MAX_UPLOAD_SIZE_MB) -> Tuple[bool, Optional[str]]:
    """
    Validate file size
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    max_bytes = max_mb * 1024 * 1024
    
    if file_size_bytes <= 0:
        return False, "File size must be positive"
    
    if file_size_bytes > max_bytes:
        return False, f"File too large. Maximum size: {max_mb}MB"
    
    return True, None


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename by removing dangerous characters
    
    Returns:
        Sanitized filename
    """
    # Remove path components
    filename = os.path.basename(filename)
    
    # Remove dangerous characters
    filename = re.sub(r'[^\w\s\-_.]', '', filename)
    
    # Remove multiple dots
    filename = re.sub(r'\.{2,}', '.', filename)
    
    # Limit length
    if len(filename) > MAX_FILENAME_LENGTH:
        name, ext = os.path.splitext(filename)
        filename = name[:MAX_FILENAME_LENGTH - len(ext)] + ext
    
    return filename


# =============================================================================
# Query Parameter Validation
# =============================================================================

def validate_pagination_params(page: Any, limit: Any) -> Tuple[bool, Dict[str, int], Optional[str]]:
    """
    Validate pagination parameters
    
    Returns:
        Tuple of (is_valid, sanitized_params, error_message)
    """
    result = {'page': 1, 'limit': 50}
    
    # Validate page
    page_valid, page_val, page_err = validate_positive_integer(page, "Page", max_value=10000)
    if not page_valid:
        return False, result, page_err
    result['page'] = page_val
    
    # Validate limit
    limit_valid, limit_val, limit_err = validate_positive_integer(limit, "Limit", max_value=100)
    if not limit_valid:
        return False, result, limit_err
    result['limit'] = limit_val
    
    return True, result, None


def validate_sort_params(sort_by: Optional[str], order: Optional[str], 
                        allowed_fields: List[str]) -> Tuple[bool, Dict[str, str], Optional[str]]:
    """
    Validate sort parameters
    
    Returns:
        Tuple of (is_valid, sanitized_params, error_message)
    """
    result = {'sort_by': 'created_at', 'order': 'desc'}
    
    if sort_by:
        if sort_by not in allowed_fields:
            return False, result, f"Cannot sort by '{sort_by}'. Allowed fields: {', '.join(allowed_fields)}"
        result['sort_by'] = sanitize_string(sort_by, max_length=50)
    
    if order:
        order_lower = order.lower()
        if order_lower not in ['asc', 'desc']:
            return False, result, "Order must be 'asc' or 'desc'"
        result['order'] = order_lower
    
    return True, result, None


# =============================================================================
# JSON Payload Validation
# =============================================================================

def validate_json_payload(payload: Any, schema: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate JSON payload against schema
    
    Schema format:
    {
        'field_name': {
            'type': str|int|float|bool|list|dict,
            'required': bool,
            'min_length': int (for strings),
            'max_length': int (for strings),
            'min_value': number (for numbers),
            'max_value': number (for numbers),
            'pattern': regex (for strings),
            'choices': list (allowed values)
        }
    }
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not isinstance(payload, dict):
        return False, "Payload must be a JSON object"
    
    for field, rules in schema.items():
        value = payload.get(field)
        
        # Check required
        if rules.get('required', False) and value is None:
            return False, f"Field '{field}' is required"
        
        # Skip validation if optional and not provided
        if value is None:
            continue
        
        # Type check
        expected_type = rules.get('type')
        if expected_type and not isinstance(value, expected_type):
            return False, f"Field '{field}' must be of type {expected_type.__name__}"
        
        # String validations
        if isinstance(value, str):
            if 'min_length' in rules and len(value) < rules['min_length']:
                return False, f"Field '{field}' must be at least {rules['min_length']} characters"
            if 'max_length' in rules and len(value) > rules['max_length']:
                return False, f"Field '{field}' must be at most {rules['max_length']} characters"
            if 'pattern' in rules and not re.match(rules['pattern'], value):
                return False, f"Field '{field}' has invalid format"
        
        # Number validations
        if isinstance(value, (int, float)):
            if 'min_value' in rules and value < rules['min_value']:
                return False, f"Field '{field}' must be at least {rules['min_value']}"
            if 'max_value' in rules and value > rules['max_value']:
                return False, f"Field '{field}' must be at most {rules['max_value']}"
        
        # Choices validation
        if 'choices' in rules and value not in rules['choices']:
            return False, f"Field '{field}' must be one of: {', '.join(map(str, rules['choices']))}"
    
    return True, None


# =============================================================================
# Date/Time Validation
# =============================================================================

def validate_date(date_string: str, format: str = '%Y-%m-%d') -> Tuple[bool, Optional[datetime], Optional[str]]:
    """
    Validate and parse date string
    
    Returns:
        Tuple of (is_valid, datetime_object, error_message)
    """
    if not date_string:
        return False, None, "Date is required"
    
    try:
        date_obj = datetime.strptime(date_string, format)
        
        # Check for reasonable date range
        if date_obj.year < 1900 or date_obj.year > 2100:
            return False, None, "Date out of valid range"
        
        return True, date_obj, None
    
    except ValueError:
        return False, None, f"Invalid date format. Expected: {format}"


# =============================================================================
# Comprehensive Request Validation
# =============================================================================

class InputValidator:
    """
    Comprehensive input validation for API requests
    
    Usage:
        validator = InputValidator(request)
        is_valid, error = validator.validate()
        if is_valid:
            data = validator.get_sanitized_data()
    """
    
    def __init__(self, data: Dict[str, Any]):
        self.data = data or {}
        self.errors: List[str] = []
        self.sanitized: Dict[str, Any] = {}
    
    def validate_required(self, *fields: str) -> 'InputValidator':
        """Validate required fields exist"""
        for field in fields:
            if field not in self.data or self.data[field] is None:
                self.errors.append(f"Field '{field}' is required")
            else:
                self.sanitized[field] = self.data[field]
        return self
    
    def validate_email(self, field: str = 'email') -> 'InputValidator':
        """Validate email field"""
        if field in self.data:
            is_valid, error = validate_email(self.data[field])
            if not is_valid:
                self.errors.append(f"Email: {error}")
            else:
                self.sanitized[field] = self.data[field].lower().strip()
        return self
    
    def validate_username(self, field: str = 'username') -> 'InputValidator':
        """Validate username field"""
        if field in self.data:
            is_valid, error = validate_username(self.data[field])
            if not is_valid:
                self.errors.append(f"Username: {error}")
            else:
                self.sanitized[field] = self.data[field].strip()
        return self
    
    def validate_password(self, field: str = 'password', is_production: bool = True) -> 'InputValidator':
        """Validate password field"""
        if field in self.data:
            is_valid, error = validate_password(self.data[field], is_production)
            if not is_valid:
                self.errors.append(f"Password: {error}")
            # Never store sanitized password
        return self
    
    def validate_positive_int(self, field: str, default: int = 1, max_value: int = 1000000) -> 'InputValidator':
        """Validate positive integer field"""
        if field in self.data:
            is_valid, value, error = validate_positive_integer(
                self.data[field], field, max_value
            )
            if not is_valid:
                self.errors.append(error)
            else:
                self.sanitized[field] = value
        else:
            self.sanitized[field] = default
        return self
    
    def validate_string(self, field: str, max_length: int = 500) -> 'InputValidator':
        """Validate and sanitize string field"""
        if field in self.data:
            self.sanitized[field] = sanitize_string(self.data[field], max_length)
        return self
    
    def is_valid(self) -> bool:
        """Check if validation passed"""
        return len(self.errors) == 0
    
    def get_errors(self) -> List[str]:
        """Get list of validation errors"""
        return self.errors
    
    def get_sanitized_data(self) -> Dict[str, Any]:
        """Get sanitized data"""
        return self.sanitized
    
    def get_error_message(self) -> str:
        """Get combined error message"""
        return "; ".join(self.errors)
