from flask import Flask, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize the Flask app
app = Flask(__name__)

# Set up MongoDB connection
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["AI_ATL"]
collection = db["Users"]

# Define a route to accept user data
@app.route("/upload", methods=["POST"])
def upload_data():
    data = request.json

    # Validate that data contains required fields
    required_fields = ["name", "role", "resume", "interview_duration", "interview_type"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    # Insert data into MongoDB
    collection.insert_one(data)

    return jsonify({"message": "Data uploaded successfully!"}), 201

if __name__ == "__main__":
    app.run(debug=True)
