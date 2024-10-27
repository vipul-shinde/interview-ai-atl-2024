# mongodb.py
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize MongoDB client
uri = os.getenv("MONGO_URI")
client = MongoClient(uri)
db = client["AI_ATL"]

# Helper function to access a specific collection
def get_collection(collection_name):
    return db[collection_name]

# # mongodb.py
# import os
# from pymongo import MongoClient
# from dotenv import load_dotenv

# # Load environment variables from .env file
# load_dotenv()

# # Get the MongoDB URI from environment variables
# uri = os.getenv("MONGO_URI")

# # Initialize MongoDB client
# client = MongoClient(uri)

# # Access the specific database
# db = client["AI_ATL"]

# # Helper functions to access collections
# def get_users_collection():
#     return db["Users"]

# def get_responses_collection():
#     return db["Responses"]

# def get_feedback_collection():
#     return db["Feedback"]

# # Set up MongoDB connection
# mongo_uri = os.getenv("MONGO_URI")
# client = MongoClient(mongo_uri)
# db = client["AI_ATL"]
# collection = db["Users"]

# # Define a route to accept user data
# @app.route("/upload", methods=["POST"])
# def upload_data():
#     data = request.json

#     # Validate that data contains required fields
#     required_fields = ["name", "role", "resume", "interview_duration", "interview_type"]
#     for field in required_fields:
#         if field not in data:
#             return jsonify({"error": f"{field} is required"}), 400

#     # Insert data into MongoDB
#     collection.insert_one(data)

#     return jsonify({"message": "Data uploaded successfully!"}), 201

