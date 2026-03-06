# ShopSense AI - Test Fixtures
"""
Pytest fixtures for testing.
"""

import pytest
import os
import numpy as np
from datetime import datetime, timedelta

# Set test environment before importing app
os.environ['FLASK_ENV'] = 'testing'
# Use the same Atlas URI but a different database for tests
if not os.environ.get('MONGO_URI'):
    from dotenv import load_dotenv
    load_dotenv()

os.environ['SECRET_KEY'] = 'test-secret-key-for-testing-only'
os.environ['JWT_SECRET_KEY'] = 'test-jwt-secret-key-for-testing-only'


@pytest.fixture(scope='session')
def app():
    """Create application for testing."""
    from app import create_app
    
    app = create_app('testing')
    app.config.update({
        'TESTING': True,
        'WTF_CSRF_ENABLED': False,
        'JWT_ACCESS_TOKEN_EXPIRES': 300,  # 5 minutes for tests
        'MONGO_DB_NAME': 'shopsense_test'
    })
    
    yield app


@pytest.fixture(scope='function')
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture(scope='function')
def db(app):
    """Create test database connection."""
    db = app.config['MONGO_DB']
    
    # Clean up before test
    collections = db.list_collection_names()
    for collection in collections:
        if not collection.startswith('system.'):
            db[collection].delete_many({})
    
    yield db
    
    # Clean up after test
    collections = db.list_collection_names()
    for collection in collections:
        if not collection.startswith('system.'):
            db[collection].delete_many({})


@pytest.fixture
def test_user(db):
    """Create a test user."""
    from models.user import User
    
    user_model = User(db)
    user = user_model.create(
        username='testuser',
        email='test@example.com',
        password='Test123!@#',
        company_name='Test Company'
    )
    
    return user


@pytest.fixture
def auth_token(client, test_user):
    """Get authentication token for test user."""
    response = client.post('/api/v1/auth/login', json={
        'identifier': 'test@example.com',
        'password': 'Test123!@#'
    })
    
    data = response.get_json()
    return data['data']['access_token']


@pytest.fixture
def sample_sales_data():
    """Generate sample sales data for testing."""
    import pandas as pd
    
    dates = pd.date_range(start='2024-01-01', periods=90, freq='D')
    products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
    
    data = []
    for date in dates:
        for product in products:
            data.append({
                'product_name': product,
                'date': date.strftime('%Y-%m-%d'),
                'units_sold': np.random.randint(10, 100),
                'price': round(np.random.uniform(10, 100), 2)
            })
    
    return pd.DataFrame(data)


@pytest.fixture
def sample_csv_file(sample_sales_data, tmp_path):
    """Create a temporary CSV file with sample data."""
    csv_path = tmp_path / "test_sales.csv"
    sample_sales_data.to_csv(csv_path, index=False)
    return csv_path
