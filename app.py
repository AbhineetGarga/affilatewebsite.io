from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'leads.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        package TEXT,
        created_at TEXT NOT NULL
    )''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/community')
def serve_community():
    return send_from_directory('.', 'community.html')

@app.route('/api/lead', methods=['POST'])
def create_lead():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('phone') or not data.get('email'):
        return jsonify({'error': 'Name, phone and email are required'}), 400
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('INSERT INTO leads (name, phone, email, package, created_at) VALUES (?, ?, ?, ?, ?)',
              (data['name'], data['phone'], data['email'], data.get('package', ''), datetime.now().isoformat()))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Lead captured successfully'}), 201

@app.route('/api/leads', methods=['GET'])
def get_leads():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, name, phone, email, package, created_at FROM leads ORDER BY id DESC')
    rows = c.fetchall()
    conn.close()
    leads = [{'id': r[0], 'name': r[1], 'phone': r[2], 'email': r[3], 'package': r[4], 'created_at': r[5]} for r in rows]
    return jsonify(leads)

if __name__ == '__main__':
    print("🚀 CareerFixx Lead Server running at http://localhost:5000")
    app.run(debug=True, port=5000)
