import json
import bcrypt
from pathlib import Path
from flask import Blueprint, request, jsonify

# --- Flask Blueprint Setup ---
# This is the equivalent of 'express.Router()'
auth_bp = Blueprint('auth_api', __name__)

# --- Configuration ---
BASE_DIR = Path(__file__).parent.parent # Assumes this file is in a 'routes' subfolder
USERS_FILE_PATH = BASE_DIR / "data" / "users.json"

# --- Routes ---

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticates a user based on username and password.
    """
    data = request.get_json()
    if not data:
        return jsonify({"message": "Request must be JSON"}), 400
        
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required.'}), 400

    try:
        # Read and parse the users JSON file
        with open(USERS_FILE_PATH, 'r', encoding='utf-8') as f:
            users_data = json.load(f)
        
        users_list = users_data.get("users", [])

        # Find the user by username. 'next' is an efficient way to find the first match.
        user = next((u for u in users_list if u['username'] == username), None)

        if not user:
            # Use a generic message for security (don't reveal if username exists)
            return jsonify({'message': 'Invalid credentials.'}), 401
        
        # Check the password using bcrypt. Passwords must be encoded to bytes.
        is_match = bcrypt.checkpw(
            password.encode('utf-8'), 
            user['password'].encode('utf-8')
        )

        if not is_match:
            return jsonify({'message': 'Invalid credentials.'}), 401

        # Login successful, now prepare the user object to send back.
        # Create a copy and remove the password hash for security.
        user_to_return = user.copy()
        del user_to_return['password']
        
        return jsonify({'message': 'Login successful!', 'user': user_to_return}), 200

    except FileNotFoundError:
        print(f"Error: The users file was not found at {USERS_FILE_PATH}")
        return jsonify({'message': 'Server configuration error.'}), 500
    except Exception as e:
        print(f'Login error: {e}')
        return jsonify({'message': 'Server error during login.'}), 500