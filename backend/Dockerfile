FROM python:3.13.5

WORKDIR /app

# Instalar cliente MySQL
RUN apt-get update && apt-get install -y default-mysql-client && rm -rf /var/lib/apt/lists/*

COPY . .
RUN pip install --no-cache-dir -r requirements.txt

# Hacer el script ejecutable
RUN chmod +x wait-for-db.sh

CMD ["./wait-for-db.sh", "db", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]