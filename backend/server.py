import os

from dotenv import load_dotenv
from flask import Flask, send_from_directory
from flask_cors import CORS
from models import db
from routes import register_blueprints

load_dotenv()

app = Flask(__name__, static_folder="../frontend", static_url_path="")

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql://{os.getenv('DB_USER', 'postgres')}:{os.getenv('DB_PASSWORD', 'postgres')}"
    f"@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'rpg_db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
CORS(app)

# Регистрируем модули (пока только auth)
register_blueprints(app)


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


with app.app_context():
    db.drop_all()
    db.create_all()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
