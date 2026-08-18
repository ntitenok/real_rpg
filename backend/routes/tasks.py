from flask import Blueprint, jsonify, request
from models import Goal, Task, db

tasks_bp = Blueprint("tasks", __name__)


# ===== Вспомогательная функция для сериализации задачи =====
def task_to_dict(task):
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "is_active": task.is_active,
        "goal_id": task.goal_id,
        "skills": task.skills,
        "planned_time_minutes": task.planned_time_minutes,
        "resistance": task.resistance,
        "importance": task.importance,
        "urgency": task.urgency,
        "created_at": task.created_at.isoformat(),
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "elapsed_time_seconds": task.elapsed_time_seconds,
        "xp_earned": task.xp_earned,
    }


# ===== Получить все задачи пользователя =====
@tasks_bp.route("/api/tasks", methods=["GET"])
def get_tasks():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    tasks = Task.query.filter_by(user_id=user_id).all()
    return jsonify([task_to_dict(t) for t in tasks])


# ===== Создать новую задачу =====
@tasks_bp.route("/api/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    user_id = data.get("user_id")
    title = data.get("title")
    if not user_id or not title:
        return jsonify({"error": "user_id и title обязательны"}), 400

    # Определяем статус на основе is_active
    is_active = data.get("is_active", False)
    status = "active" if is_active else "pending"

    task = Task(
        user_id=user_id,
        title=title,
        description=data.get("description", ""),
        status=status,
        is_active=is_active,
        goal_id=data.get("goal_id"),  # может быть None
        skills=data.get("skills", []),
        planned_time_minutes=data.get("planned_time_minutes", 0),
        resistance=data.get("resistance", 0),
        importance=data.get("importance", 0),
        urgency=data.get("urgency", 0),
    )
    db.session.add(task)
    db.session.commit()

    # Если задача активна и привязана к цели, активируем цель
    if is_active and task.goal_id:
        goal = Goal.query.get(task.goal_id)
        if goal and not goal.is_active:
            goal.is_active = True
            db.session.commit()

    return jsonify(
        {"id": task.id, "message": "Задача создана", "task": task_to_dict(task)}
    ), 201
