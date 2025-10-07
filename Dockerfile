# Multi-stage build for Railway deployment
FROM node:18-alpine AS frontend-build

# Set working directory
WORKDIR /app

# Copy frontend files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Python backend stage
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY app/ ./app/

# Copy built frontend from previous stage
COPY --from=frontend-build /app/dist ./frontend/dist

# Create a simple nginx config for serving frontend
RUN echo 'server { \
    listen 3000; \
    server_name _; \
    root /app/frontend/dist; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://localhost:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/sites-available/default

# Install nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Expose ports
EXPOSE 3000 8000

# Create startup script
RUN echo '#!/bin/bash\n\
# Start nginx in background\n\
nginx\n\
# Start FastAPI backend\n\
cd /app && uvicorn app.main:app --host 0.0.0.0 --port 8000 &\n\
# Wait for any process to exit\n\
wait' > /app/start.sh && chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]