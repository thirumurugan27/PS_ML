# routes/evaluate.py

import json
import asyncio
from pathlib import Path
from datetime import datetime
from flask import Blueprint, request, jsonify
from typing import Dict, Tuple

# --- Jupyter Kernel dependencies ---
from jupyter_client.manager import KernelManager, KernelClient

import google.generativeai as genai
import os

GEMINI_API_KEY="AIzaSyCnI1h12n7DxEXXIAKdIp0g6eJEXXehVkc"

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Initialize model once (reuse globally)
genai_model = genai.GenerativeModel("gemini-1.5-flash")


# --- Flask Blueprint Setup ---
evaluation_bp = Blueprint('evaluation_api', __name__)

# --- Configuration & Constants ---
BASE_DIR = Path(__file__).parent.parent
USERS_FILE_PATH = BASE_DIR / "data" / "users.json"
SUBMISSIONS_PATH = BASE_DIR / "data" / "submissions"
QUESTIONS_BASE_PATH = BASE_DIR / "data" / "questions"
USER_GENERATED_PATH = BASE_DIR / "data" / "user_generated"


# --- Global State for Managing Kernels ---
USER_KERNELS: Dict[str, Tuple[KernelManager, KernelClient]] = {}
from difflib import SequenceMatcher
import pandas as pd
import numpy as np


# --- Helper Functions ---

def validate_code_with_llm(question_description: str, student_code: str) -> Dict:
    """
    Uses Gemini to validate if the student's code is a genuine attempt to solve the problem.
    Returns a dictionary with 'aligned' (bool) and 'reason' (str).
    """
    if not genai_model:
        return {"aligned": True, "reason": "LLM validation skipped (model not configured)."}

    prompt = f"""
    You are an expert Python code reviewer for an educational platform.
    Your task is to determine if a student's code is a genuine and valid attempt to solve a given problem,
    or if it's just hardcoding the answer to pass specific test cases.

    Problem Description:
    ---
    {question_description}
    ---

    Student's Code:
    ---
    {student_code}
    ---

    Analyze the code based on the description. The code must align with the problem's requirements.
    For example, if the problem asks to "create a NumPy array and print it", the code must import numpy and use it.
    Simply doing `print("[1 2 3]")` is NOT a valid solution, even if the output matches.

    Respond ONLY with a JSON object in the following format:
    {{
      "aligned": boolean,
      "reason": "A brief explanation of your decision."
    }}

    - Set "aligned" to true if the code is a valid attempt.
    - Set "aligned" to false if the code hardcodes the answer or doesn't follow the problem's logic.
    """

    try:
        print(f"[LLM] Sending request for code: '{student_code[:50].strip()}'...")
        response = genai_model.generate_content(prompt)
        
        print(f"[LLM] Raw response received:\n---\n{response.text}\n---")

        cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
        
        if not cleaned_response_text:
             raise ValueError("LLM returned an empty response.")

        result = json.loads(cleaned_response_text)
        print(f"[LLM] Validation result: {result}")
        return result
        
    except Exception as e:
        print(f"❌ [LLM] CRITICAL ERROR during validation: {e}")
        return {"aligned": False, "reason": f"Automated LLM validation failed. Error: {e}"}


def check_keywords_in_text(student_output: str, keywords_str: str, threshold: float = 0.8) -> Tuple[bool, str]:
    keywords = keywords_str.replace('/n', ' ').replace('\\n', ' ').strip().split()
    keywords = [kw.strip("'\"") for kw in keywords if kw.strip("'\"")]

    if not keywords:
        return True, "No keywords specified; passing by default."

    matched_count = sum(1 for kw in keywords if kw in student_output)
    match_ratio = matched_count / len(keywords)
    missing_keywords = [kw for kw in keywords if kw not in student_output]

    if match_ratio >= threshold:
        return True, f"{matched_count}/{len(keywords)} keywords found ({match_ratio:.0%}); passed."
    else:
        return False, f"{matched_count}/{len(keywords)} keywords found ({match_ratio:.0%}); missing: {missing_keywords}"


def compare_csvs(student_path: Path, solution_path: Path, key_columns=None, threshold: float = 0.8) -> Tuple[bool, float]:
    try:
        print(f"Comparing CSVs: Student='{student_path}', Solution='{solution_path}'")
        if not student_path.exists():
            print("  - ERROR: Student file not found!")
            return False, 0.0
        if not solution_path.exists():
            print("  - ERROR: Solution file not found!")
            return False, 0.0

        df_student = pd.read_csv(student_path)
        df_solution = pd.read_csv(solution_path)

        # --- LOGIC BRANCH 1: Key-based comparison (for tasks like house price prediction) ---
        if key_columns and len(key_columns) == 2:
            print(f"  - Using key-based comparison with keys: {key_columns}")
            merge_key, compare_col = key_columns

            if merge_key not in df_student.columns or merge_key not in df_solution.columns:
                print(f"  - ERROR: Merge key '{merge_key}' not found in one of the files.")
                return False, 0.0

            df_student[merge_key] = df_student[merge_key].astype(df_solution[merge_key].dtype)
            merged = pd.merge(df_student, df_solution, on=merge_key, suffixes=('_student', '_solution'))
            if merged.empty:
                print("  - ERROR: Merge resulted in an empty DataFrame. Check key columns content and types.")
                return False, 0.0

            col_student = merged[f'{compare_col}_student']
            col_solution = merged[f'{compare_col}_solution']

            if pd.api.types.is_numeric_dtype(col_student) and pd.api.types.is_numeric_dtype(col_solution):
                diffs = np.abs(col_student.values - col_solution.values)
                max_vals = np.maximum(np.abs(col_student.values), np.abs(col_solution.values))
                similarities = 1 - (diffs / (max_vals + 1e-9))
            else:
                matches = col_student.values == col_solution.values
                similarities = matches.astype(float)

            similarity_score = similarities.mean() * 100

        # --- LOGIC BRANCH 2: Direct dataframe comparison (for tasks like audio framing) ---
        else:
            print("  - Using direct dataframe comparison (no key columns provided).")
            if df_student.shape != df_solution.shape:
                print(f"  - ERROR: DataFrame shapes do not match. Student: {df_student.shape}, Solution: {df_solution.shape}")
                return False, 0.0

            # Calculate similarity based on the number of matching cells
            matches = (df_student.values == df_solution.values).sum()
            total_elements = df_student.size
            similarity_score = (matches / total_elements) * 100 if total_elements > 0 else 100.0

        print(f"  - Overall Similarity: {similarity_score:.2f}%")
        return similarity_score >= (threshold * 100), similarity_score

    except Exception as e:
        print(f"  - ERROR during CSV comparison: {e}")
        return False, 0.0

async def run_code_on_kernel(kc: KernelClient, code: str, timeout: int = 10) -> Tuple[str, str]:
    msg_id = kc.execute(code)
    stdout, stderr = [], []
    while True:
        try:
            msg = await asyncio.to_thread(kc.get_iopub_msg, timeout=timeout)
            if msg.get('parent_header', {}).get('msg_id') != msg_id: continue
            msg_type = msg['header']['msg_type']
            content = msg.get('content', {})
            if msg_type == 'stream':
                if content['name'] == 'stdout': stdout.append(content['text'])
                else: stderr.append(content['text'])
            elif msg_type == 'error': stderr.append('\n'.join(content.get('traceback', [])))
            elif msg_type == 'execute_result': stdout.append(content['data'].get('text/plain', ''))
            elif msg_type == 'status' and content.get('execution_state') == 'idle': break
        except Exception:
            stderr.append(f"\n[Kernel Timeout] Execution exceeded {timeout} seconds.")
            break
    return "".join(stdout).strip(), "".join(stderr).strip()


def create_input_mock_script(input_string: str) -> str:
    escaped_input = json.dumps(input_string)
    return f"""
import builtins
_input_lines = {escaped_input}.splitlines()
def _mock_input(prompt=''):
    try: return _input_lines.pop(0)
    except IndexError: return ''
builtins.input = _mock_input
"""


# --- Session Management Routes ---
@evaluation_bp.route('/session/start', methods=['POST'])
def start_session():
    data = request.get_json()
    session_id = data.get('sessionId')
    if not session_id:
        return jsonify({'error': 'sessionId is required.'}), 400
    if session_id not in USER_KERNELS:
        print(f"Starting new kernel for session: {session_id}")
        km = KernelManager()
        km.start_kernel()
        kc = km.client()
        kc.start_channels()
        try: kc.wait_for_ready(timeout=30)
        except RuntimeError:
            km.shutdown_kernel()
            return jsonify({'error': 'Kernel failed to start in time.'}), 500
        USER_KERNELS[session_id] = (km, kc)
        return jsonify({'message': f'Session {session_id} started successfully.'})
    return jsonify({'message': f'Session {session_id} already exists.'})


# --- MODIFIED /run ROUTE ---
@evaluation_bp.route('/run', methods=['POST'])
def run_cell():
    data = request.get_json()
    session_id = data.get('sessionId')
    student_code = data.get('cellCode', 'pass')
    user_input = data.get('userInput', '')
    
    username = data.get('username')
    subject = data.get('subject')
    level = data.get('level')
    question_id = data.get('questionId')
    part_id = data.get('partId')

    if not session_id:
        return jsonify({'error': 'Missing sessionId.'}), 400
    if session_id not in USER_KERNELS:
        return jsonify({'error': 'User session not found.'}), 404

    _km, kc = USER_KERNELS[session_id]

    # Default script for standard questions
    input_setup_script = create_input_mock_script(user_input)
    full_script = f"{input_setup_script}\n{student_code}"

    # If full context is provided, check for special question types
    if all([username, subject, level, question_id]):
        try:
            q_file_path = QUESTIONS_BASE_PATH / subject / f"level{level}" / "questions.json"
            with open(q_file_path, 'r', encoding='utf-8') as f:
                all_questions = json.load(f)
            
            question_data = next((q for q in all_questions if q['id'] == question_id), None)
            target_question_part = next((p for p in question_data.get('parts', []) if p['part_id'] == part_id), question_data) if part_id else question_data
            
            task_type = target_question_part.get("type")

            if task_type == "csv_similarity":
                print(f"[RUN] Detected CSV similarity task for user '{username}'. Preparing file path.")
                user_output_dir = USER_GENERATED_PATH / username
                user_output_dir.mkdir(parents=True, exist_ok=True)
                
                base_filename = target_question_part.get('student_file', 'backend/ml-l2-1.csv')
                student_output_path = user_output_dir / base_filename
                
                original_filename_placeholder = target_question_part['placeholder_filename']
                modified_code = student_code.replace(
                    f"'{original_filename_placeholder}'", f"r'{student_output_path.as_posix()}'"
                ).replace(
                    f"\"{original_filename_placeholder}\"", f"r'{student_output_path.as_posix()}'"
                )
                
                # For file generation, we only need the modified code
                full_script = modified_code
                print(f"[RUN] Code modified to save file to: {student_output_path}")

        except Exception as e:
            print(f"[RUN] Warning: Could not process question context for special types. Running as-is. Error: {e}")

    try:
        student_stdout, student_stderr = asyncio.run(run_code_on_kernel(kc, full_script))
        return jsonify({'stdout': student_stdout, 'stderr': student_stderr})
    except Exception as e:
        return jsonify({'stdout': '', 'stderr': str(e)}), 500


# --- UNCHANGED /validate ROUTE ---
@evaluation_bp.route('/validate', methods=['POST'])
def validate_cell():
    data = request.get_json()
    session_id, username, subject, level = data.get('sessionId'), data.get('username'), data.get('subject'), data.get('level')
    question_id, part_id = data.get('questionId'), data.get('partId')
    student_code = data.get('cellCode')

    if not all([session_id, username, subject, level, question_id, student_code]):
        return jsonify({'error': 'Missing required fields (sessionId, username, subject, level, questionId, cellCode)'}), 400
    if session_id not in USER_KERNELS:
        return jsonify({'error': 'User session not found.'}), 404
        
    _km, kc = USER_KERNELS[session_id]

    try:
        q_file_path = QUESTIONS_BASE_PATH / subject / f"level{level}" / "questions.json"
        with open(q_file_path, 'r', encoding='utf-8') as f: all_questions = json.load(f)
        question_data = next((q for q in all_questions if q['id'] == question_id), None)
        target_question_part = next((p for p in question_data.get('parts', []) if p['part_id'] == part_id), question_data) if part_id else question_data
    except Exception as e: return jsonify({'error': f'Could not load question data: {str(e)}'}), 500

    test_results = []
    task_type = target_question_part.get("type")
    
    print(f"--- [VALIDATION LOG] ---")
    print(f"Session: {session_id}, User: {username}, Question: {question_id}, Part: {part_id or 'N/A'}")
    print(f"Validation Type: {task_type or 'Standard Test Cases'}")

    try:
        if task_type == "text_similarity":
            student_stdout, student_stderr = asyncio.run(run_code_on_kernel(kc, student_code))
            if student_stderr:
                passed, log_message = False, f"Execution failed: {student_stderr}"
            else:
                expected_keywords = target_question_part.get("expected_text", "")
                passed, log_message = check_keywords_in_text(student_stdout, expected_keywords)
            print(f"Keyword Match Result: {log_message} -> Passed: {passed}")
            test_results.append(passed)

        elif task_type == "csv_similarity":
            user_output_dir = USER_GENERATED_PATH / username
            user_output_dir.mkdir(parents=True, exist_ok=True)
            base_filename = target_question_part.get('student_file', 'backend/ml-l2-1.csv')
            student_output_path = user_output_dir / base_filename
            print(f"User-specific student file path: {student_output_path}")

            original_filename_placeholder = target_question_part['placeholder_filename']
            modified_student_code = student_code.replace(
                f"'{original_filename_placeholder}'", f"r'{student_output_path.as_posix()}'"
            ).replace(
                f"\"{original_filename_placeholder}\"", f"r'{student_output_path.as_posix()}'"
            )

            _stdout, _stderr = asyncio.run(run_code_on_kernel(kc, modified_student_code))
            
            if _stderr:
                 passed, score = False, 0.0
                 print(f"Error during CSV generation: {_stderr}")
            else:
                solution_file_path = BASE_DIR / target_question_part['solution_file']
                passed, score = compare_csvs(
                    student_output_path,
                    solution_file_path,
                    target_question_part.get('key_columns'),
                    target_question_part.get('similarity_threshold', 0.8)
                )
            print(f"CSV Similarity Score: {score:.2f}% -> Passed: {passed}")
            test_results.append(bool(passed))
            
        else: # Standard test cases
            for i, test_case in enumerate(target_question_part.get("test_cases", [])):
                print(f"  Running Test Case {i+1}...")
                input_str = test_case.get("input", "")
                expected_output = test_case.get("output", "")
                
                input_setup_script = create_input_mock_script(input_str)
                full_script = f"{input_setup_script}\n{student_code}"
                student_stdout, student_stderr = asyncio.run(run_code_on_kernel(kc, full_script))
                
                if student_stderr:
                    passed = False
                    print(f"    - FAILED (Error): {student_stderr}")
                else:
                    passed = student_stdout.strip() == expected_output.strip()
                    print(f"    - Student Output:  '{student_stdout.strip()}'")
                    print(f"    - Expected Output: '{expected_output.strip()}'")
                    print(f"    - Result: {'PASSED' if passed else 'FAILED'}")
                test_results.append(passed)

    except Exception as e:
        print(f"Validation Error: {e}") 
        test_results = [False]
    
    print(f"Final Result for Part: {test_results}\n------------------------\n")
    return jsonify({"test_results": test_results})


# --- FINAL /submit ROUTE (NO AI INFERENCE + FIXED QUESTIONID CHECK) ---
@evaluation_bp.route('/submit', methods=['POST'])
def submit_answers():
    data = request.get_json()
    session_id, username, subject, level = data.get('sessionId'), data.get('username'), data.get('subject'), data.get('level')
    answers = data.get('answers', [])
    
    final_results = []
    
    try:
        q_file_path = QUESTIONS_BASE_PATH / subject / f"level{level}" / "questions.json"
        with open(q_file_path, 'r', encoding='utf-8') as f:
            all_questions_data = json.load(f)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Could not load question file: {e}'}), 500

    for answer in answers:
        question_id = answer.get('questionId')
        student_code = answer.get('code', '')
        test_cases_passed = answer.get('passed', False)

        question_data = next((q for q in all_questions_data if q['id'] == question_id), None)

        if not question_data:
            print(f"Warning: Could not find question data for ID: {question_id}")
            # ✅ Don’t force fail — just rely on test case result
            final_results.append(test_cases_passed)
            answer['fully_passed'] = test_cases_passed
            continue

        # ✅ No AI validation, just trust test case result
        is_fully_passed = test_cases_passed
        final_results.append(is_fully_passed)
        answer['fully_passed'] = is_fully_passed

    all_questions_passed = len(final_results) > 0 and all(final_results)
    
    status = 'passed' if all_questions_passed else 'failed'
    submission = {
        'subject': subject, 'level': f"level{level}", 'status': status,
        'timestamp': datetime.now().isoformat(), 'answers': answers
    }
    
    SUBMISSIONS_PATH.mkdir(exist_ok=True)
    user_submission_file = SUBMISSIONS_PATH / f"{username}.json"
    try:
        with open(user_submission_file, 'r+', encoding='utf-8') as f:
            user_submissions = json.load(f)
            user_submissions.append(submission)
            f.seek(0)
            json.dump(user_submissions, f, indent=2)
    except (FileNotFoundError, json.JSONDecodeError):
        with open(user_submission_file, 'w', encoding='utf-8') as f:
            json.dump([submission], f, indent=2)
    
    updated_user = None
    if all_questions_passed:
        with open(USERS_FILE_PATH, 'r+', encoding='utf-8') as f:
            users_json = json.load(f)
            user_found = next((user for user in users_json['users'] if user['username'] == username), None)
            if user_found:
                level_dir = f"level{level}"
                user_found['progress'][subject][level_dir] = 'completed'
                next_level_num = int(level) + 1
                next_level_dir = f"level{next_level_num}"
                if user_found['progress'][subject].get(next_level_dir) == 'locked':
                    user_found['progress'][subject][next_level_dir] = 'unlocked'
                updated_user = user_found.copy()
                del updated_user['password']
            f.seek(0)
            json.dump(users_json, f, indent=2)
            f.truncate()
            
    if session_id in USER_KERNELS:
        print(f"Shutting down kernel for session: {session_id}")
        km, kc = USER_KERNELS.pop(session_id)
        if kc.is_alive(): kc.stop_channels()
        if km.is_alive(): km.shutdown_kernel()

    return jsonify({
        'success': True,
        'message': "Submission received and session ended.",
        'updatedUser': updated_user
    })
