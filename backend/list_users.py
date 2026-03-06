from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))
db = client.get_database('shopsense_analytics')
for u in db.users.find({}, {'username': 1, 'email': 1}):
    print(u)
