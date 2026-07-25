from flask import Flask, send_from_directory
from flask_cors import CORS

# Создаём приложение, указываем папку с фронтендом
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)  # разрешаем запросы с других доменов

# Корневой маршрут — отдаём index.html
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Запускаем сервер на всех интерфейсах, порт 5000
    app.run(host='0.0.0.0', port=5001, debug=True)