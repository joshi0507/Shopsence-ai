# ShopSense AI - Upload Tests
"""
Tests for file upload endpoints.
"""

import pytest
import io


class TestFileUpload:
    """Test file upload functionality."""
    
    def test_upload_csv_success(self, client, db, test_user, auth_token, sample_csv_file):
        """Test successful CSV file upload."""
        with open(sample_csv_file, 'rb') as f:
            response = client.post(
                '/api/v1/uploads',
                data={'file': f},
                headers={'Authorization': f'Bearer {auth_token}'},
                content_type='multipart/form-data'
            )
        
        data = response.get_json()
        
        assert response.status_code == 201
        assert data['success'] is True
        assert 'upload_id' in data['data']
        assert 'rows_processed' in data['data']
    
    def test_upload_no_file(self, client, db, auth_token):
        """Test upload without file."""
        response = client.post(
            '/api/v1/uploads',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        data = response.get_json()
        
        assert response.status_code == 400
        assert data['success'] is False
        assert 'NO_FILE' in data['error']['code']
    
    def test_upload_invalid_extension(self, client, db, auth_token):
        """Test upload with invalid file extension."""
        data = io.BytesIO(b'not a csv file')
        data.name = 'test.txt'
        
        response = client.post(
            '/api/v1/uploads',
            data={'file': data},
            headers={'Authorization': f'Bearer {auth_token}'},
            content_type='multipart/form-data'
        )
        
        data = response.get_json()
        
        assert response.status_code == 400
        assert data['success'] is False
        assert 'INVALID_TYPE' in data['error']['code']
    
    def test_upload_unauthenticated(self, client, db, sample_csv_file):
        """Test upload without authentication."""
        with open(sample_csv_file, 'rb') as f:
            response = client.post(
                '/api/v1/uploads',
                data={'file': f},
                content_type='multipart/form-data'
            )
        
        assert response.status_code == 401
    
    def test_list_uploads(self, client, db, test_user, auth_token):
        """Test listing uploads."""
        response = client.get(
            '/api/v1/uploads',
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        data = response.get_json()
        
        assert response.status_code == 200
        assert data['success'] is True
        assert isinstance(data['data'], list)

    def test_manual_upload_success(self, client, db, test_user, auth_token):
        """Test successful manual data upload."""
        records = [
            {'product_name': 'Test Item 1', 'date': '2024-01-01', 'units_sold': 10, 'price': 99.99},
            {'product_name': 'Test Item 2', 'date': '2024-01-02', 'units_sold': 5, 'price': 49.99}
        ]
        response = client.post(
            '/api/v1/uploads/manual',
            json={'records': records},
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        
        data = response.get_json()
        
        assert response.status_code == 201
        assert data['success'] is True
        assert 'upload_id' in data['data']
        assert data['data']['rows_processed'] == 2


class TestUploadValidation:
    """Test upload validation."""
    
    def test_csv_missing_columns(self, client, db, auth_token, tmp_path):
        """Test CSV with missing required columns."""
        # Create CSV with missing columns
        csv_path = tmp_path / "invalid.csv"
        csv_path.write_text("product_name,date\nProduct A,2024-01-01")
        
        with open(csv_path, 'rb') as f:
            response = client.post(
                '/api/v1/uploads',
                data={'file': f},
                headers={'Authorization': f'Bearer {auth_token}'},
                content_type='multipart/form-data'
            )
        
        data = response.get_json()
        
        assert response.status_code == 400
        assert data['success'] is False
        assert 'VALIDATION_ERROR' in data['error']['code']
    
    def test_csv_empty_file(self, client, db, auth_token, tmp_path):
        """Test empty CSV file."""
        csv_path = tmp_path / "empty.csv"
        csv_path.write_text("")
        
        with open(csv_path, 'rb') as f:
            response = client.post(
                '/api/v1/uploads',
                data={'file': f},
                headers={'Authorization': f'Bearer {auth_token}'},
                content_type='multipart/form-data'
            )
        
        data = response.get_json()
        
        assert response.status_code == 400
        assert data['success'] is False
