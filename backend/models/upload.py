# -*- coding: utf-8 -*-
"""
Upload Session Model - MongoDB Upload Sessions Collection

Handles tracking of file uploads and their processing status.
"""

from datetime import datetime
from bson.objectid import ObjectId
from typing import Optional, Dict, Any, List


class UploadSession:
    """Upload session model for MongoDB operations."""
    
    COLLECTION_NAME = 'upload_sessions'
    
    # Upload statuses
    STATUS_PENDING = 'pending'
    STATUS_PROCESSING = 'processing'
    STATUS_COMPLETED = 'completed'
    STATUS_FAILED = 'failed'
    
    # File types
    TYPE_CSV = 'csv'
    TYPE_EXCEL = 'excel'
    TYPE_API = 'api'
    TYPE_MANUAL = 'manual'
    
    def __init__(self, db):
        """
        Initialize UploadSession model.
        
        Args:
            db: MongoDB database connection.
        """
        self.db = db
        self.collection = db[self.COLLECTION_NAME]
        
        # Create indexes
        self.collection.create_index('upload_id', unique=True)
        self.collection.create_index('user_id')
        self.collection.create_index('status')
        self.collection.create_index('created_at')
    
    def create(
        self,
        user_id: str,
        filename: str,
        file_type: str = TYPE_CSV,
        file_size: int = 0,
        row_count: int = 0
    ) -> Dict[str, Any]:
        """
        Create a new upload session.
        
        Args:
            user_id: User ObjectId as string.
            filename: Original filename.
            file_type: Type of file (csv, excel, api, manual).
            file_size: File size in bytes.
            row_count: Number of rows (if known).
        
        Returns:
            dict: Created upload session document.
        """
        import uuid
        
        upload_id = str(uuid.uuid4())
        
        session = {
            'upload_id': upload_id,
            'user_id': ObjectId(user_id),
            'filename': filename,
            'file_type': file_type,
            'file_size': file_size,
            'row_count': row_count,
            'status': self.STATUS_PENDING,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'completed_at': None,
            'error_message': None,
            'results': None
        }
        
        result = self.collection.insert_one(session)
        session['_id'] = result.inserted_id
        
        return session
    
    def find_by_id(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Find upload session by MongoDB ID.
        
        Args:
            session_id: Session ObjectId as string.
        
        Returns:
            dict or None: Session document or None if not found.
        """
        return self.collection.find_one({'_id': ObjectId(session_id)})
    
    def find_by_upload_id(self, upload_id: str) -> Optional[Dict[str, Any]]:
        """
        Find upload session by upload_id.
        
        Args:
            upload_id: Unique upload identifier.
        
        Returns:
            dict or None: Session document or None if not found.
        """
        return self.collection.find_one({'upload_id': upload_id})
    
    def find_by_user(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Find all upload sessions for a user.
        
        Args:
            user_id: User ObjectId as string.
            limit: Maximum number of results.
        
        Returns:
            list: List of session documents.
        """
        cursor = self.collection.find(
            {'user_id': ObjectId(user_id)}
        ).sort('created_at', -1).limit(limit)
        
        return list(cursor)
    
    def update_status(
        self,
        upload_id: str,
        status: str,
        error_message: Optional[str] = None,
        results: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Update upload session status.
        
        Args:
            upload_id: Unique upload identifier.
            status: New status.
            error_message: Error message if failed.
            results: Processing results if completed.
        
        Returns:
            bool: True if successful, False otherwise.
        """
        update_data = {
            'status': status,
            'updated_at': datetime.utcnow()
        }
        
        if error_message:
            update_data['error_message'] = error_message
        
        if results:
            update_data['results'] = results
        
        if status in [self.STATUS_COMPLETED, self.STATUS_FAILED]:
            update_data['completed_at'] = datetime.utcnow()
        
        result = self.collection.update_one(
            {'upload_id': upload_id},
            {'$set': update_data}
        )
        
        return result.modified_count > 0
    
    def update_row_count(self, upload_id: str, row_count: int) -> bool:
        """
        Update the row count for an upload.
        
        Args:
            upload_id: Unique upload identifier.
            row_count: Number of rows.
        
        Returns:
            bool: True if successful, False otherwise.
        """
        result = self.collection.update_one(
            {'upload_id': upload_id},
            {
                '$set': {
                    'row_count': row_count,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    def delete(self, upload_id: str) -> bool:
        """
        Delete an upload session.
        
        Args:
            upload_id: Unique upload identifier.
        
        Returns:
            bool: True if successful, False otherwise.
        """
        result = self.collection.delete_one({'upload_id': upload_id})
        return result.deleted_count > 0
    
    def get_stats_by_user(self, user_id: str) -> Dict[str, Any]:
        """
        Get upload statistics for a user.
        
        Args:
            user_id: User ObjectId as string.
        
        Returns:
            dict: Upload statistics.
        """
        pipeline = [
            {'$match': {'user_id': ObjectId(user_id)}},
            {
                '$group': {
                    '_id': '$status',
                    'count': {'$sum': 1},
                    'total_rows': {'$sum': '$row_count'}
                }
            }
        ]
        
        results = list(self.collection.aggregate(pipeline))
        
        stats = {
            'total_uploads': sum(r['count'] for r in results),
            'total_rows_processed': sum(r['total_rows'] for r in results),
            'by_status': {r['_id']: r['count'] for r in results}
        }
        
        return stats
