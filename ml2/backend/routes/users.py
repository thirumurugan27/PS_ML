# backend/routes/users.py
import json
import bcrypt
from flask import Blueprint, request, jsonify
from pathlib import Path
from utils.progressHelper import build_initial_progress  # <-- IMPORT

users_bp = Blueprint("users_bp", __name__)

# --- Paths ---
BASE_DIR = Path(__file__).resolve().parent.parent
users_file_path = BASE_DIR / "data" / "users.json"
salt_rounds = 10


# --- Helper function to read/write JSON ---
def load_users():
    try:
        with open(users_file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"users": []}


def save_users(data):
    with open(users_file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


# --- GET all users (for admin view) ---
@users_bp.route("/", methods=["GET"])
def get_users():
    try:
        data = load_users()
        users = [
            {k: v for k, v in u.items() if k != "password"} for u in data["users"]
        ]
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"message": "Failed to fetch users."}), 500


# --- POST to create a new user (for admin) ---
@users_bp.route("/create", methods=["POST"])
def create_user():
    body = request.get_json()
    username = body.get("username")
    password = body.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password are required."}), 400

    try:
        data = load_users()

        # Check if user already exists
        if any(u["username"] == username for u in data["users"]):
            return jsonify({"message": "Username already exists."}), 409

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(salt_rounds))

        # --- MODIFIED PART: Build full progress object ---
        initial_progress = build_initial_progress()

        new_user = {
            "username": username,
            "password": hashed_password.decode("utf-8"),
            "role": "student",
            "progress": initial_progress,
        }
        # --- END MODIFIED PART ---

        data["users"].append(new_user)
        save_users(data)

        user_to_return = {k: v for k, v in new_user.items() if k != "password"}
        return jsonify({"message": "User created successfully!", "user": user_to_return}), 201

    except Exception as e:
        print("Error creating user:", e)
        return jsonify({"message": "Server error during user creation."}), 500
