import json
from pathlib import Path
from flask import Blueprint, request, jsonify

# --- Flask Blueprint Setup ---
questions_bp = Blueprint('questions_api', __name__)

# --- Configuration ---
BASE_DIR = Path(__file__).parent.parent
QUESTIONS_BASE_PATH = BASE_DIR / "data" / "questions"

# --- Routes ---

@questions_bp.route('/', methods=['GET'])
def get_all_subjects_and_levels():
    """
    GET all available subjects and their levels from the directory structure.
    """
    try:
        structure = {}
        # Ensure the base directory exists before iterating
        if not QUESTIONS_BASE_PATH.exists():
            return jsonify({}), 200 # Return empty if base path not found

        for subject_path in QUESTIONS_BASE_PATH.iterdir():
            if subject_path.is_dir():
                subject_name = subject_path.name
                
                # Get all subdirectories that start with 'level'
                level_paths = [
                    p for p in subject_path.iterdir() 
                    if p.is_dir() and p.name.startswith('level')
                ]
                
                # Sort the levels naturally (e.g., level1, level2, level10)
                level_paths.sort(key=lambda p: int(p.name.replace('level', '')))
                
                structure[subject_name] = [p.name for p in level_paths]
        
        return jsonify(structure), 200

    except Exception as e:
        print(f"Error fetching question structure: {e}")
        return jsonify({"message": "Failed to fetch question structure."}), 500

import random

@questions_bp.route('/<string:subject>/<int:level>', methods=['GET'])
def get_questions_for_level(subject, level):
    """
    GET questions for a specific subject and level.
    For Level 1: return all test-case questions.
    For Level 2 & 3: return exactly ONE random question.
    """
    file_path = QUESTIONS_BASE_PATH / subject / f"level{level}" / "questions.json"

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)

        if level == 1:
            # Return all for test-case based
            return jsonify(questions), 200
        else:
            # Return one random question for similarity-based
            if not questions:
                return jsonify({"message": "No questions available"}), 404
            question = random.choice(questions)
            return jsonify(question), 200

    except FileNotFoundError:
        return jsonify({"message": "Questions not found."}), 404
    except Exception as e:
        print(f"Error reading questions for {subject}/level{level}: {e}")
        return jsonify({"message": "An error occurred while fetching questions."}), 500


@questions_bp.route('/', methods=['POST'])
def add_new_question():
    """
    POST to upload a new question to a specific subject/level JSON file.
    """
    data = request.get_json()
    if not data:
        return jsonify({"message": "Request must be JSON"}), 400

    subject = data.get('subject')
    level = data.get('level')
    new_question = data.get('newQuestion') # Keeping camelCase to match JS client

    if not all([subject, level, new_question, new_question.get('id')]):
        return jsonify({
            "message": "Subject, level, and question data with an ID are required."
        }), 400

    file_path = QUESTIONS_BASE_PATH / subject / f"level{level}" / "questions.json"

    try:
        # Ensure the parent directory exists
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        questions = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                questions = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            # File doesn't exist or is empty/corrupt, start with an empty list
            pass
        
        # Check if a question with the same ID already exists
        if any(q.get('id') == new_question.get('id') for q in questions):
            return jsonify({
                "message": f"Question with ID '{new_question['id']}' already exists."
            }), 409 # 409 Conflict is the appropriate status code

        questions.append(new_question)
        
        # Write the updated list back to the file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2)

        return jsonify({"message": "Question added successfully."}), 201

    except Exception as e:
        print(f"Error uploading question: {e}")
        return jsonify({"message": "Failed to upload question."}), 500