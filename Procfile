web: sh -c 'uvicorn api.main:app --host 0.0.0.0 --port 8000'
worker: celery -A api.services.celery_app worker --loglevel=info --concurrency=1