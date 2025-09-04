import os
import json
import csv
import bcrypt
from pathlib import Path
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

# --- Helper Function (equivalent to buildInitialProgress) ---
# NOTE: The logic for this function needs to be ported from your 'utils/progressHelper.js'
# It should scan the 'data/questions' directory and build the initial progress structure.
# Here is a plausible implementation.
def build_initial_progress():
    """
    Scans the questions directory to build the initial progress structure for a new user.
    """
    questions_base_path = Path(__file__).parent.parent / "data" / "questions"
    progress = {}
    if not questions_base_path.exists():
        return progress

    for subject_path in questions_base_path.iterdir():
        if subject_path.is_dir():
            subject_name = subject_path.name
            progress[subject_name] = {}
            # Sort levels numerically, e.g., level1, level2, level10
            level_paths = sorted(
                (p for p in subject_path.iterdir() if p.is_dir()),
                key=lambda p: int(p.name.replace("level", ""))
            )
            for i, level_path in enumerate(level_paths):
                level_name = level_path.name
                # Unlock the first level, lock the rest
                progress[subject_name][level_name] = "unlocked" if i == 0 else "locked"
    return progress

# --- Flask Blueprint Setup ---
# This is the equivalent of 'express.Router()'
admin_bp = Blueprint('admin_api', __name__)

# --- Configuration ---
# Using pathlib for modern, OS-agnostic path handling
BASE_DIR = Path(__file__).parent.parent # Assumes this file is in a 'routes' subfolder
USERS_FILE_PATH = BASE_DIR / "data" / "users.json"
QUESTIONS_BASE_PATH = BASE_DIR / "data" / "questions"
UPLOAD_FOLDER = BASE_DIR / "uploads"

# Ensure the upload folder exists
UPLOAD_FOLDER.mkdir(exist_ok=True)

# --- Routes ---

@admin_bp.route('/create-subject', methods=['POST'])
def create_subject():
    """
    Creates the directory structure for a new subject and updates all existing
    student users with the new subject progress.
    """
    data = request.get_json()
    if not data:
        return jsonify({"message": "Request must be JSON"}), 400

    subject_name = data.get('subjectName')
    num_levels = data.get('numLevels')

    if not subject_name or not isinstance(num_levels, int) or num_levels < 1:
        return jsonify({"message": "Valid subject name and number of levels are required."}), 400

    try:
        # 1. Create the folder structure
        for i in range(1, num_levels + 1):
            level_path = QUESTIONS_BASE_PATH / subject_name / f"level{i}"
            level_path.mkdir(parents=True, exist_ok=True)
            (level_path / "questions.json").write_text("[]", encoding="utf-8")

        # 2. Update all existing users with the new subject
        with open(USERS_FILE_PATH, 'r+', encoding='utf-8') as f:
            users_json = json.load(f)
            for user in users_json.get("users", []):
                if user.get("role") == "student":
                    if "progress" not in user:
                        user["progress"] = {}
                    user["progress"][subject_name] = {}
                    for i in range(1, num_levels + 1):
                        status = "unlocked" if i == 1 else "locked"
                        user["progress"][subject_name][f"level{i}"] = status
            
            f.seek(0) # Rewind file to the beginning
            json.dump(users_json, f, indent=2)
            f.truncate() # Remove trailing data if the new content is smaller

        return jsonify({"message": f"Subject '{subject_name}' created and all users updated."}), 201

    except Exception as e:
        print(f"Error creating subject: {e}")
        return jsonify({"message": "Failed to create subject."}), 500


@admin_bp.route('/upload-users', methods=['POST'])
def upload_users():
    """
    Uploads a CSV file to bulk-create new student users.
    """
    if 'file' not in request.files:
        return jsonify({"message": "No file part in the request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No file selected for uploading"}), 400

    filename = secure_filename(file.filename)
    filepath = UPLOAD_FOLDER / filename
    
    try:
        file.save(filepath)

        with open(USERS_FILE_PATH, 'r+', encoding='utf-8') as f:
            users_json = json.load(f)
            existing_usernames = {u['username'] for u in users_json.get("users", [])}
            initial_progress = build_initial_progress()
            
            new_users_from_csv = []
            with open(filepath, mode='r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    new_users_from_csv.append(row)

            created_count = 0
            skipped_count = 0
            for user_data in new_users_from_csv:
                username = user_data.get('username')
                password = user_data.get('password')

                if not username or not password or username in existing_usernames:
                    skipped_count += 1
                    continue
                
                # Hash the password
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                
                new_user = {
                    "username": username,
                    "password": hashed_password.decode('utf-8'), # Store as string
                    "role": "student",
                    "progress": initial_progress
                }
                users_json["users"].append(new_user)
                existing_usernames.add(username)
                created_count += 1

            # Write updated data back to the file
            f.seek(0)
            json.dump(users_json, f, indent=2)
            f.truncate()

        return jsonify({
            "message": f"Upload complete. Created {created_count} new users. Skipped {skipped_count} users."
        }), 201

    except Exception as e:
        print(f"Error during user upload: {e}")
        return jsonify({"message": "An error occurred during user upload."}), 500
    finally:
        # Ensure the temporary uploaded file is deleted
        if filepath.exists():
            filepath.unlink()

@admin_bp.route('/upload-questions', methods=['POST'])
def upload_questions():
    """
    Uploads a CSV file to bulk-create new questions.
    """
    if 'file' not in request.files:
        return jsonify({"message": "No file part in the request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No file selected for uploading"}), 400

    filename = secure_filename(file.filename)
    filepath = UPLOAD_FOLDER / filename

    try:
        file.save(filepath)

        rows = []
        with open(filepath, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            rows = list(reader) # Read all rows into memory

        added_count = 0
        skipped_count = 0

        for row in rows:
            subject = row.get('subject')
            level = row.get('level')
            q_id = row.get('id')
            title = row.get('title')
            description = row.get('description')

            if not all([subject, level, q_id, title, description]):
                skipped_count += 1
                continue

            q_file_path = QUESTIONS_BASE_PATH / subject / f"level{level}" / "questions.json"
            
            # Ensure parent directory exists
            q_file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Read existing questions, default to empty list if file doesn't exist
            try:
                with open(q_file_path, 'r', encoding='utf-8') as f:
                    questions = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                questions = []

            # Check for duplicate question ID
            if any(q['id'] == q_id for q in questions):
                skipped_count += 1
                continue

            # Construct test_cases array from flat columns
            new_test_cases = []
            for i in range(1, 6): # Enforce 5 test case limit
                code = row.get(f'tc{i}_code')
                expected = row.get(f'tc{i}_expected')
                
                # Only add if both code and expected output are present
                if code and expected:
                    desc = row.get(f'tc{i}_desc', f'Test Case {i}')
                    new_test_cases.append({
                        "description": desc,
                        "code_to_run": code,
                        "expected_output": expected
                    })

            questions.append({
                "id": q_id,
                "title": title,
                "description": description,
                "template": "def function_name(param):\n    # Your code here\n    pass",
                "test_cases": new_test_cases
            })

            # Write updated questions list back to file
            with open(q_file_path, 'w', encoding='utf-8') as f:
                json.dump(questions, f, indent=2)
            
            added_count += 1
        
        return jsonify({
            "message": f"Upload complete. Added {added_count} new questions. Skipped {skipped_count} questions."
        }), 201

    except Exception as e:
        print(f"Error processing questions CSV: {e}")
        return jsonify({"message": "An error occurred during question upload."}), 500
    finally:
        if filepath.exists():
            filepath.unlink()