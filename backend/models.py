from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    player = db.relationship('Player', backref='user', uselist=False, cascade='all, delete-orphan')
    tasks = db.relationship('Task', backref='user', cascade='all, delete-orphan')

class Player(db.Model):
    __tablename__ = 'players'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    level = db.Column(db.Integer, default=1)
    total_xp = db.Column(db.Integer, default=0)
    xp_next = db.Column(db.Integer, default=100)
    stats = db.Column(db.JSON, default={'strength': 10, 'dexterity': 10, 'intelligence': 10, 'will': 10})
    skills = db.Column(db.JSON, default=[])

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    time_spent_minutes = db.Column(db.Integer, default=0)

class Goal(db.Model):
    __tablename__ = "goals"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(
        db.String(20), default="active"
    )  # active, done — позже пригодится