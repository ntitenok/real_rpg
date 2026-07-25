FROM python:3.14-slim

WORKDIR /app

RUN pip install --no-cache-dir poetry

COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root

COPY backend/ ./backend/
COPY frontend/ ./frontend/

WORKDIR /app/backend

CMD ["python", "server.py"]