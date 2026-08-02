from flask import Blueprint, jsonify, request
from models import Goal, db

goals_bp = Blueprint("goals", __name__)


@goals_bp.route("/api/goals", methods=["POST"])
def create_goal():
    data = request.get_json()
    user_id = data.get("user_id")
    title = data.get("title")
    if not user_id or not title:
        return jsonify({"error": "user_id и title обязательны"}), 400

    goal = Goal(user_id=user_id, title=title, description=data.get("description", ""))
    db.session.add(goal)
    db.session.commit()
    return jsonify(
        {
            "id": goal.id,
            "title": goal.title,
            "description": goal.description,
            "created_at": goal.created_at.isoformat(),
        }
    ), 201


@goals_bp.route("/api/goals", methods=["GET"])
def get_goals():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    goals = Goal.query.filter_by(user_id=user_id).all()
    return jsonify(
        [
            {
                "id": g.id,
                "title": g.title,
                "description": g.description,
                "created_at": g.created_at.isoformat(),
                "status": g.status,
            }
            for g in goals
        ]
    )
