# app/websocket/__init__.py
from flask_socketio import SocketIO

socketio = SocketIO()

# Import events after socketio initialization
from . import events