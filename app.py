import os
import uuid
import sqlite3
from flask import Flask, render_template, request, jsonify, g
from flask_cors import CORS
from google.cloud import dialogflow_v2 as dialogflow

# Initialize Flask app
app = Flask(__name__, template_folder='frontend', static_folder='static')
CORS(app)  # Enable CORS for all routes

# Configuration
PROJECT_ID = os.getenv('DIALOGFLOW_PROJECT_ID', '*bot-id*')
CREDENTIALS_PATH = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', '*credentials-file*')
DATABASE = 'productivity.db'
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = CREDENTIALS_PATH

# Database setup
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                note TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        db.commit()

# Dialogflow integration
def get_dialogflow_response(query: str) -> str:
    try:
        session_client = dialogflow.SessionsClient()
        session = session_client.session_path(PROJECT_ID, str(uuid.uuid4()))
        text_input = dialogflow.TextInput(text=query, language_code="en")
        query_input = dialogflow.QueryInput(text=text_input)
        response = session_client.detect_intent(
            request={"session": session, "query_input": query_input}
        )
        return response.query_result.fulfillment_text
    except Exception as e:
        return f"Error processing request: {str(e)}"

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def get_response():
    user_input = request.json.get('message')
    bot_response = get_dialogflow_response(user_input)
    return jsonify({'response': bot_response})

@app.route('/api/todos', methods=['GET', 'POST'])
def handle_todos():
    db = get_db()
    try:
        if request.method == 'GET':
            cursor = db.execute('SELECT * FROM todos ORDER BY created_at DESC')
            todos = [dict(row) for row in cursor.fetchall()]
            return jsonify(todos)
        
        if request.method == 'POST':
            data = request.json
            db.execute('INSERT INTO todos (text, completed) VALUES (?, ?)',
                     (data['text'], data.get('completed', False)))
            db.commit()
            return jsonify({'status': 'success', 'id': db.cursor().lastrowid}), 201
            
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/schedules', methods=['GET', 'POST', 'DELETE'])
def handle_schedules():
    db = get_db()
    try:
        if request.method == 'GET':
            cursor = db.execute('SELECT * FROM schedules')
            schedules = [dict(row) for row in cursor.fetchall()]
            return jsonify(schedules)
        
        if request.method == 'POST':
            data = request.json
            db.execute('INSERT OR REPLACE INTO schedules (date, note) VALUES (?, ?)',
                     (data['date'], data['note']))
            db.commit()
            return jsonify({'status': 'success', 'id': db.cursor().lastrowid}), 201
        
        if request.method == 'DELETE':
            date = request.args.get('date')
            db.execute('DELETE FROM schedules WHERE date = ?', (date,))
            db.commit()
            return jsonify({'status': 'success'})
            
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True)