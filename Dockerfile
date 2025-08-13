FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend
COPY backend/ .

# Exponer puerto (Render usa $PORT automáticamente)
EXPOSE $PORT

# Comando para ejecutar la aplicación
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
