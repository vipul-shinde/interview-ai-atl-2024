# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from mongodb import get_collection  # Import from mongodb.py

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Define a route to accept user data
@app.route("/upload", methods=["POST"])
def upload_data():
    data = request.json
    (print(data))
    # Validate that data contains required fields
    required_fields = ["name", "role", "resume", "interview_duration", "interview_type"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    # Insert data into MongoDB
    users_collection = get_collection("Users")
    users_collection.insert_one(data)

    return jsonify({"message": "Data uploaded successfully!"}), 201

if __name__ == '__main__':
    app.run(debug=True)
