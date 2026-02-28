import os
import sys
from pymongo import MongoClient, ASCENDING, DESCENDING
from dotenv import load_dotenv

# Add backend to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

def run_migrations():
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    client = MongoClient(mongo_uri)
    db = client.get_database('shopsense_analytics')
    
    print(f"Running migrations on database: {db.name}")
    
    # 1. Users Indexes
    try:
        print("Cleaning up duplicate users...")
        # Find duplicate usernames
        pipeline = [
            {"$group": {"_id": "$username", "count": {"$sum": 1}, "ids": {"$push": "$_id"}}},
            {"$match": {"count": {"$gt": 1}}}
        ]
        duplicates = list(db.users.aggregate(pipeline))
        for dup in duplicates:
            print(f"Deleting {dup['count']-1} duplicates for username: {dup['_id']}")
            for doc_id in dup['ids'][1:]:
                db.users.delete_one({"_id": doc_id})

        # Find duplicate emails
        pipeline = [
            {"$group": {"_id": "$email", "count": {"$sum": 1}, "ids": {"$push": "$_id"}}},
            {"$match": {"count": {"$gt": 1}}}
        ]
        duplicates = list(db.users.aggregate(pipeline))
        for dup in duplicates:
            print(f"Deleting {dup['count']-1} duplicates for email: {dup['_id']}")
            for doc_id in dup['ids'][1:]:
                db.users.delete_one({"_id": doc_id})

        print("Creating indexes for 'users' collection...")
        db.users.create_index([("username", ASCENDING)], unique=True)
        db.users.create_index([("email", ASCENDING)], unique=True)
        db.users.create_index([("user_id", ASCENDING)], unique=True)
    except Exception as e:
        print(f"Error creating users indexes: {e}")
    
    # 2. Uploads Indexes
    try:
        print("Creating indexes for 'uploads' collection...")
        db.uploads.create_index([("upload_id", ASCENDING)], unique=True)
        db.uploads.create_index([("user_id", ASCENDING)])
        db.uploads.create_index([("created_at", DESCENDING)])
    except Exception as e:
        print(f"Error creating uploads indexes: {e}")
    
    # 3. Sales Data Indexes
    try:
        print("Creating indexes for 'sales_data' collection...")
        db.sales_data.create_index([("user_id", ASCENDING)])
        db.sales_data.create_index([("upload_id", ASCENDING)])
        db.sales_data.create_index([("date", ASCENDING)])
        db.sales_data.create_index([("product_name", ASCENDING)])
        db.sales_data.create_index([("user_id", ASCENDING), ("date", ASCENDING)])
    except Exception as e:
        print(f"Error creating sales_data indexes: {e}")
    
    # 4. Token Blacklist (TTL Index)
    try:
        print("Creating TTL index for 'blacklisted_tokens' collection...")
        db.blacklisted_tokens.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)
    except Exception as e:
        print(f"Error creating blacklisted_tokens index: {e}")
    
    print("Migrations completed successfully!")

if __name__ == "__main__":
    run_migrations()
