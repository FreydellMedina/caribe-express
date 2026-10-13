# Dockerfile para FastAPI Backend - Caribe Express
FROM python:3.11-slim

# Evitar escritura de bytecode y habilitar buffer de logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema necesarias para psycopg2 y redes
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar requerimientos de Python
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copiar código del backend
COPY backend/ /app/backend/

# Exponer el puerto de FastAPI
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Comando de inicio del servidor ASGI
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

