FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 8000

# Create a non-root user
RUN useradd -m appuser
WORKDIR /home/appuser

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Create output directory and set permissions
RUN mkdir -p /home/appuser/output
RUN chown -R appuser:appuser /home/appuser
USER appuser

# Expose FastAPI port
EXPOSE 8000

# Default command (can be overridden in docker-compose)
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
