# Instashare Backend

This project is a distributed file system backend built with FastAPI, Celery, and Redis. It supports Google OAuth authentication, file upload to Pinata (IPFS), asynchronous ZIP processing, and file management endpoints.

---

## Project Features
- User authentication via Google OAuth
- File upload and storage on Pinata (IPFS)
- Asynchronous ZIP compression using Celery
- Download original or ZIP-compressed files
- File management: list, rename, and get file info

---

## Local Development Setup

### 1. Create and Activate Virtual Environment
```bash
python -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install --no-cache-dir -r requirements.txt
```

### 3. Set Up Redis Locally (Recommended: Docker)
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 4. Set Environment Variables
Create a `.env` file in your project root:
```env
# Pinata Configuration
PINATA_API_KEY=your_pinata_key
PINATA_API_SECRET=your_pinata_secret

# Google OAuth (you'll need to create these)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Redis (for local development)
REDIS_URL=redis://localhost:6379
```

---

## Running the Services

### Terminal 1: Start FastAPI Server
```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Start Celery Worker
```bash
celery -A api.celery_app worker --loglevel=info
```

### Terminal 3: Start Celery Beat (Optional, for periodic tasks)
```bash
celery -A api.celery_app beat --loglevel=info
```

---

## How It Works
1. User uploads file → File saved to Pinata → DB record created → Celery task queued
2. Celery worker picks up task → Downloads file → Creates ZIP → Uploads ZIP → Updates DB
3. User can download original or ZIP version

---

## API Usage & Testing

### 1. Open the Interactive API Docs
Visit: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Authentication
- Go to `/auth/login` in your browser.
- Complete Google login.
- Your session cookie will be set in your browser.

### 3. File Upload & ZIP Processing
- Use `POST /api/v1/files/upload` to upload a file.
- Check the response for `ipfs_hash`.
- Watch the Celery worker terminal for processing logs.
- Check the file status in the database.

### 4. File Management
- `GET /api/v1/files` — List your files
- `PATCH /api/v1/files/{file_id}` — Rename a file
- `GET /api/v1/files/{file_id}/download` — Download original file
- `GET /api/v1/files/{file_id}/download_zip` — Download ZIP file (after processing)
- `GET /api/v1/files/{file_id}` — Get file info

### 5. Testing with HTTP Clients
You can also use tools like:
- curl
- httpie
- Postman (import cookies from your browser for session auth)

### 6. Troubleshooting
- If you get “Not authenticated”, make sure you’re logged in via Google and your browser sends the session cookie.
- If you get “File not found”, check the file ID and that you’re logged in as the correct user.
- If you get an error, check your FastAPI logs for details.
- Make sure your Pinata API credentials are correct and active.

#### Celery Worker Not Starting
```bash
celery -A api.celery_app inspect ping
```

---

## Running Tests

### 1. Unit, Integration, and E2E Tests
- Unit tests: test isolated functions/classes (no DB, no network)
- Integration tests: test API endpoints and DB/service integration
- E2E tests: simulate real user flows (require the FastAPI server to be running)

### 2. How to Run All Tests
From the project root, run:
```bash
PYTHONPATH=. pytest
```

**Note:**
- For E2E and requests-based tests, you must have the FastAPI server running at `http://localhost:8000`.
- For integration/unit tests using `TestClient`, the server is started automatically by the test client.

### 3. Run Only a Specific Type of Test
```bash
pytest tests/unit/
pytest tests/integration/
pytest tests/e2e/
```

---

## Monitoring Celery Tasks

Check task status:
```bash
celery -A api.celery_app inspect active
celery -A api.celery_app inspect registered
```

---

## Database Inspection

Check SQLite database:
```bash
sqlite3 instashare.db
.tables
SELECT * FROM files;
SELECT * FROM users;
```

---

## Project Flow Summary
- Upload → Pinata → DB → Celery → ZIP → Pinata → DB
- Download original or ZIP file via API

---