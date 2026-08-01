from flask import Blueprint, jsonify, request
from models import Player, User, db
from werkzeug.security import check_password_hash, generate_password_hash

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Имя пользователя и пароль обязательны"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Пользователь уже существует"}), 400
    hashed = generate_password_hash(password)
    user = User(username=username, password_hash=hashed)
    db.session.add(user)
    db.session.commit()
    player = Player(user_id=user.id)
    db.session.add(player)
    db.session.commit()
    return jsonify({"message": "Пользователь создан", "username": username}), 201


@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Неверное имя пользователя или пароль"}), 401
    return jsonify(
        {"message": "Вход выполнен", "user_id": user.id, "username": user.username}
    ), 200
