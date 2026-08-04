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
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(
        db.String(20), default="pending"
    )  # pending, active, in_progress, paused, done
    is_active = db.Column(db.Boolean, default=False)  # флаг для отображения в "В игре"
    goal_id = db.Column(db.Integer, db.ForeignKey("goals.id"), nullable=True)
    skills = db.Column(db.JSON, default=[])  # массив строк (названия навыков)
    planned_time_minutes = db.Column(db.Integer, default=0)
    resistance = db.Column(db.Integer, default=0)
    importance = db.Column(db.Integer, default=0)
    urgency = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    # Поля для будущего (таймеры, XP) – пока не используем, но оставляем
    elapsed_time_seconds = db.Column(db.Integer, default=0)
    xp_earned = db.Column(db.Integer, default=0)

class Goal(db.Model):
    __tablename__ = "goals"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=False)
    status = db.Column(
        db.String(20), default="active"
    )  # active, done — позже пригодится