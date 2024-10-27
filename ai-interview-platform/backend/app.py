# app.py
from flask import Flask, jsonify

app = Flask(__name__)

# Add a route for the root URL
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Interview AI Platform API"})

if __name__ == '__main__':
    app.run(debug=True)
