FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir poetry || pip install --no-cache-dir pip install poetry

COPY backend/pyproject.toml .
RUN pip install -e .

COPY backend/ .

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
