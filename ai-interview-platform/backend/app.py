# Importing the libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import datetime
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import warnings
warnings.filterwarnings('ignore')

# Load the .env file into the environment
load_dotenv()

from crews import interview_crew, feedback_crew
from prompts import video_prompt, video_transcript, final_prompt
from tools.process_video import process_video

# Import mongo and init_db from utils.database
from utils.database import mongo, init_db

app = Flask(__name__)
CORS(app)  # Enable CORS

# Ensure your API key is set as an environment variable
if not os.environ.get('GOOGLE_API_KEY'):
    raise EnvironmentError('GOOGLE_API_KEY environment variable not set.')

# Initialize the database
init_db(app)

# Add a route for the root URL
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Interview AI Platform API"})

# Allowed extensions for uploaded files
def allowed_file(filename):
    allowed_extensions = {'mp4', 'avi', 'mov'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions
           
# Endpoint to upload video
@app.route('/upload-video', methods=['POST'])
def upload_video():
    try:
        # Check if the request contains the file part
        if 'video_file' not in request.files:
            return jsonify({'error': 'No video_file part in the request'}), 400

        file = request.files['video_file']

        # Check if the user selected a file
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Validate the file type
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only mp4, avi, and mov files are allowed.'}), 400

        # Secure the filename and save the file
        filename = secure_filename(file.filename)
        upload_folder = 'uploads'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

        # Return the file path to the client
        return jsonify({'video_file_path': file_path})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Endpoint to process video
@app.route('/process-video', methods=['POST'])
def process_video_endpoint():
    try:
        data = request.get_json()

        # Extract inputs from the request data
        video_file_path = data.get('video_file_path')
        analysis_prompt = data.get('analysis_prompt', video_prompt)

        # Ensure video_file_path is provided
        if not video_file_path:
            return jsonify({'error': 'video_file_path is required'}), 400

        # Call the process_video function
        summary = process_video(video_file_path, analysis_prompt)
        
        # Log the video processing details
        mongo.db.video_processes.insert_one({
            'video_file_path': video_file_path,
            'analysis_prompt': analysis_prompt,
            'summary': summary,
            'timestamp': datetime.datetime.utcnow()
        })

        # Return the summary
        return jsonify({'summary': summary})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Define Endpoints
@app.route('/start-interview', methods=['POST'])
def start_interview():
    try:
        data = request.get_json()

        # Extract inputs from the request data
        inputs = {
            'interviewer_role': data.get('interviewer_role', 'Senior Data Scientist Interviewer'),
            'interview_length': data.get('interview_length', '3'),
            'interview_type': data.get('interview_type', 'technical, behavioral'),
            'role_focus': data.get('role_focus', 'data science and machine learning'),
            'interviewer_position': data.get('interviewer_position', 'Lead Data Scientist'),
            'expertise_areas': data.get('expertise_areas', 'machine learning, statistics, and data analysis'),
            'industry': data.get('industry', 'finance'),
            'role_level': data.get('role_level', 'mid-senior'),
            'role_title': data.get('role_title', 'Data Scientist'),
            'specialization': data.get('specialization', 'machine learning'),
            'timestamp': datetime.datetime.utcnow()
        }
        
        # Log inputs to MongoDB
        mongo.db.interviews.insert_one(inputs)

        # Call the crew's kickoff method with the inputs
        result_interview = interview_crew.kickoff(inputs=inputs)
        
        # Optionally, update the record with the result
        mongo.db.interviews.update_one(
            {'_id': inputs['_id']},
            {'$set': {'result': result_interview}}
        )

        # Return the result
        return jsonify({'result': result_interview})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-feedback', methods=['POST'])
def generate_feedback():
    try:
        data = request.get_json()

        # Extract inputs from the request data
        inputs = {
            'analysis_prompt': data.get('analysis_prompt', video_prompt),
            'final_prompt': data.get('final_prompt', final_prompt),
            'video_file_path': data.get('video_file_path', 'test_gemini.mp4'),
            'feedback_guidelines': data.get('feedback_guidelines', final_prompt),
            'interview_transcript': data.get('interview_transcript', video_transcript)
        }
        
        # Log inputs to MongoDB
        mongo.db.feedbacks.insert_one(inputs)

        # Call the crew's kickoff method with the inputs
        feedback_interview = feedback_crew.kickoff(inputs=inputs)
        
        # Optionally, update the record with the result
        mongo.db.feedbacks.update_one(
            {'_id': inputs['_id']},
            {'$set': {'result': feedback_interview}}
        )

        # Return the result
        return jsonify({'result': feedback_interview})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Test MongoDB connection
@app.route('/test-mongo', methods=['GET'])
def test_mongo():
    try:
        mongo.db.test_collection.insert_one({'message': 'MongoDB connection successful'})
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
