import json
from pathlib import Path
from flask import Blueprint, jsonify

# --- Flask Blueprint Setup ---
submissions_bp = Blueprint('submissions_api', __name__)

# --- Configuration ---
BASE_DIR = Path(__file__).parent.parent
SUBMISSIONS_PATH = BASE_DIR / "data" / "submissions"

# --- Routes ---

@submissions_bp.route('/', methods=['GET'])
def get_aggregated_submissions():
    """
    GET all submissions, aggregated and grouped by subject and level.
    This is for the "Aggregate View" in a teacher dashboard.
    """
    grouped_submissions = {}
    try:
        # Ensure the submissions directory exists, creating it if necessary.
        SUBMISSIONS_PATH.mkdir(exist_ok=True)
        
        # Iterate over all .json files in the submissions directory
        for file_path in SUBMISSIONS_PATH.glob('*.json'):
            username = file_path.stem  # .stem gets the filename without the extension
            
            with open(file_path, 'r', encoding='utf-8') as f:
                # Each file contains a list of that student's submissions
                student_submissions = json.load(f)

            for submission in student_submissions:
                subject = submission.get('subject')
                level = submission.get('level')

                if not subject or not level:
                    continue # Skip malformed submission objects

                # Use setdefault for a clean way to initialize nested dictionaries/lists
                subject_group = grouped_submissions.setdefault(subject, {})
                level_list = subject_group.setdefault(level, [])
                
                # Create a new submission object that includes the username
                submission_with_user = submission.copy()
                submission_with_user['username'] = username
                level_list.append(submission_with_user)
        
        # Sort submissions within each level by timestamp (most recent first)
        for subject in grouped_submissions:
            for level in grouped_submissions[subject]:
                # ISO 8601 timestamps can be sorted lexicographically as strings.
                # reverse=True makes the sort descending (newest first).
                grouped_submissions[subject][level].sort(
                    key=lambda s: s.get('timestamp', ''), 
                    reverse=True
                )
        
        return jsonify(grouped_submissions), 200

    except Exception as e:
        print(f"Error fetching and aggregating submissions: {e}")
        return jsonify({"message": "Failed to fetch submissions."}), 500

@submissions_bp.route('/<string:username>', methods=['GET'])
def get_student_submissions(username):
    """
    GET all submissions for a specific student.
    This is for the "Student View".
    """
    student_file_path = SUBMISSIONS_PATH / f"{username}.json"

    try:
        with open(student_file_path, 'r', encoding='utf-8') as f:
            submissions = json.load(f)
        return jsonify(submissions), 200
        
    except FileNotFoundError:
        return jsonify({
            "message": f"Submissions for user '{username}' not found."
        }), 404
    except json.JSONDecodeError:
        print(f"Error: Malformed JSON in file for user {username}")
        return jsonify({"message": "Failed to parse student submission data."}), 500
    except Exception as e:
        print(f"Error fetching submissions for user {username}: {e}")
        return jsonify({"message": "Failed to fetch student submissions."}), 500