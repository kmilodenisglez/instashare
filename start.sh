#!/bin/bash

# Start FastAPI with Uvicorn in the background
uvicorn api.main:app --host 0.0.0.0 --port 8000 &

# Save the uvicorn server PID
uvicorn_pid=$!

# Start Celery in the foreground
celery -A api.services.celery_app worker --loglevel=info --concurrency=1

# If Celery terminates, also close uvicorn
kill $uvicorn_pid
