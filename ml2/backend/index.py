# backend/app.py
from flask import Flask, send_from_directory
from flask_cors import CORS
import os
from pathlib import Path

# Import Blueprints (equivalent to Express routes)
from routes.auth import auth_bp
from routes.questions import questions_bp
from routes.evaluate import evaluation_bp
from routes.users import users_bp
from routes.admin import admin_bp
from routes.submissions import submissions_bp

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})

PORT = 3001

# --- API Routes ---
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(questions_bp, url_prefix="/api/questions")
app.register_blueprint(evaluation_bp, url_prefix='/api/evaluate')
app.register_blueprint(users_bp, url_prefix="/api/users")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(submissions_bp, url_prefix="/api/submissions")

# --- Serve static assets if in production ---
if os.getenv("FLASK_ENV") == "production":
    frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):
        if path != "" and (frontend_dist / path).exists():
            return send_from_directory(frontend_dist, path)
        else:
            return send_from_directory(frontend_dist, "index.html")


if __name__ == "__main__":
    print(f"✅ Backend server running on http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT,debug=True)
