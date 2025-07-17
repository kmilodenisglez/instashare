from celery import Celery
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get Redis URL from Railway environment
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')

celery_app = Celery(
    'instashare',
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=['api.services.tasks']
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
) 