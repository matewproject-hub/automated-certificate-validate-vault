from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import bcrypt

app = Flask(__name__)
# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    reg_no = db.Column(db.String(50), nullable=True)
    branch = db.Column(db.String(50), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'regNo': self.reg_no,
            'branch': self.branch
        }

with app.app_context():
    db.create_all()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Missing required fields"}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"message": "Email already registered"}), 400
        
    hashed_password = bcrypt.hashpw(data.get('password').encode('utf-8'), bcrypt.gensalt())
    
    new_user = User(
        name=data.get('name', ''),
        email=data.get('email'),
        password=hashed_password.decode('utf-8'),
        role=data.get('role', 'student'),
        reg_no=data.get('regNo', ''),
        branch=data.get('branch', 'CSE')
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    
    if not data or not data.get('email') or not data.get('password') or not data.get('role'):
        return jsonify({"message": "Missing credentials"}), 400
        
    user = User.query.filter_by(email=data.get('email'), role=data.get('role')).first()
    
    if user and bcrypt.checkpw(data.get('password').encode('utf-8'), user.password.encode('utf-8')):
        return jsonify(user.to_dict()), 200
    else:
        return jsonify({"message": "Invalid email, password, or role"}), 401

if __name__ == '__main__':
    app.run(debug=True, port=5000)
