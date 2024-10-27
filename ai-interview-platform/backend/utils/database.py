# Importing the required libraries
import os
from flask_pymongo import PyMongo
from urllib.parse import quote_plus

# Initialize PyMongo without the app
mongo = PyMongo()

def init_db(app):
    # Retrieve MongoDB credentials from environment variables
    mongo_username = os.environ.get('MONGO_USERNAME')
    mongo_password = os.environ.get('MONGO_PASSWORD')
    mongo_host = os.environ.get('MONGO_HOST', 'cluster0.vwrpw.mongodb.net')  # Your MongoDB Atlas host
    mongo_db = os.environ.get('MONGO_DB', 'AI_ATL')

    if not mongo_username or not mongo_password:
        raise EnvironmentError('MongoDB credentials are not set in environment variables.')

    # URL-encode the username and password
    encoded_username = quote_plus(mongo_username)
    encoded_password = quote_plus(mongo_password)

    # Construct the MongoDB Atlas URI
    mongo_uri = f"mongodb+srv://{encoded_username}:{encoded_password}@{mongo_host}/{mongo_db}?retryWrites=true&w=majority"

    # Set the MongoDB URI in the Flask app configuration
    app.config["MONGO_URI"] = mongo_uri

    # Initialize PyMongo with the Flask app
    mongo.init_app(app)