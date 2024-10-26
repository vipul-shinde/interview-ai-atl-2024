from flask_socketio import emit
from flask import request
from . import socketio

class StreamState:
    is_active = False

stream_state = StreamState()

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    emit('connection_success', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    stream_state.is_active = False

@socketio.on('start_stream')
def handle_start_stream():
    """Start audio stream"""
    stream_state.is_active = True
    emit('stream_started', {'message': 'Audio stream started'})

@socketio.on('stop_stream')
def handle_stop_stream():
    """Stop audio stream"""
    stream_state.is_active = False
    emit('stream_stopped', {'message': 'Audio stream stopped'})

@socketio.on('audio_data')
def handle_audio_data(data):
    """Handle incoming audio data"""
    if stream_state.is_active:
        # Placeholder for realtime API processing
        # processed_result = realtime_api.process(data)
        processed_result = {"text": "Placeholder transcription"}
        emit('transcription', processed_result)