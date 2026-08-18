from .auth import auth_bp
from .goals import goals_bp
from .tasks import tasks_bp  # добавь этот импорт


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(goals_bp)
    app.register_blueprint(tasks_bp)  # добавь эту строку
