# -*- coding: utf-8 -*-
"""
Validators - Input Validation Utilities

Provides validation functions for user input.
"""

import pandas as pd
from typing import Tuple, Set
from werkzeug.datastructures import FileStorage


def validate_csv_format(df: pd.DataFrame) -> Tuple[bool, str]:
    """
    Validate CSV DataFrame structure.
    
    Args:
        df: Pandas DataFrame.
    
    Returns:
        tuple: (is_valid, error_message)
    """
    required_columns = ['product_name', 'date', 'units_sold', 'price']
    
    # Check for required columns
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        return False, f"Missing required columns: {', '.join(missing_columns)}"
    
    # Check for empty dataframe
    if df.empty:
        return False, "CSV file is empty"
    
    # Check for null values in required columns
    null_counts = df[required_columns].isnull().sum()
    if null_counts.any():
        null_fields = null_counts[null_counts > 0].index.tolist()
        return False, f"Null values found in: {', '.join(null_fields)}"
    
    # Validate data types
    try:
        pd.to_numeric(df['units_sold'], errors='raise')
    except (ValueError, TypeError):
        return False, "units_sold must be numeric"
    
    try:
        pd.to_numeric(df['price'], errors='raise')
    except (ValueError, TypeError):
        return False, "price must be numeric"
    
    try:
        pd.to_datetime(df['date'], errors='raise')
    except (ValueError, TypeError):
        return False, "date must be a valid date format"
    
    # Check for negative values
    if (df['units_sold'] < 0).any():
        return False, "units_sold cannot be negative"
    
    if (df['price'] < 0).any():
        return False, "price cannot be negative"
    
    return True, None


def validate_file_upload(
    file: FileStorage,
    allowed_extensions: Set[str] = None,
    max_size_mb: int = 50
) -> Tuple[bool, str]:
    """
    Validate file upload.
    
    Args:
        file: Werkzeug FileStorage object.
        allowed_extensions: Set of allowed file extensions.
        max_size_mb: Maximum file size in megabytes.
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if allowed_extensions is None:
        allowed_extensions = {'csv'}
    
    # Check if file exists
    if not file or file.filename == '':
        return False, "No file provided"
    
    # Check file extension
    if '.' not in file.filename:
        return False, "File must have an extension"
    
    ext = file.filename.rsplit('.', 1)[1].lower()
    if ext not in allowed_extensions:
        return False, f"File type '{ext}' not allowed. Allowed types: {', '.join(allowed_extensions)}"
    
    # Check file size
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset pointer
    
    max_size_bytes = max_size_mb * 1024 * 1024
    if file_size > max_size_bytes:
        return False, f"File size ({file_size / 1024 / 1024:.2f}MB) exceeds maximum ({max_size_mb}MB)"
    
    return True, None
