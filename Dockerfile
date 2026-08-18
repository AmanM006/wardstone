# Wardstone AP2 Cloud Run Container
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

WORKDIR /app

# Install system certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency specification
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and dashboard
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY dashboard/ ./dashboard/

EXPOSE 8080

CMD ["uvicorn", "src.server:app", "--host", "0.0.0.0", "--port", "8080"]
