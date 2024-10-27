# mongodb.py
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the MongoDB URI from environment variables
uri = os.getenv("MONGO_URI")

# Initialize MongoDB client
client = MongoClient(uri)

# Access the specific database
db = client["AI_ATL"]

# Helper functions to access collections
def get_users_collection():
    return db["Users"]

def get_responses_collection():
    return db["Responses"]

def get_feedback_collection():
    return db["Feedback"]
