python -m venv .venv
source .venv/bin/activate
pip install --no-cache-dir -r requirements.txt
deactivate

uvicorn app.main:app --reload

# How It Works:
User uploads file → File saved to Pinata → DB record created → Celery task queued
Celery worker picks up task → Downloads file → Creates ZIP → Uploads ZIP → Updates DB
User can download original or ZIP version

## How to test your complete backend locally with Celery + Redis 

1. Install Dependencies
```bash
pip install -r requirements.txt
```

2. Set Up Redis Locally with Docker (Recommended)
```bash
docker run -d -p 6379:6379 redis:alpine
```

3. Set Environment Variables
Create a .env file in your project root:
```bash
# Pinata Configuration
PINATA_API_KEY=your_pinata_key
PINATA_API_SECRET=your_pinata_secret

# Google OAuth (you'll need to create these)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Redis (for local development)
REDIS_URL=redis://localhost:6379
```
4. Start the Services
  Terminal 1: FastAPI Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

  Terminal 2: Celery Worker
```bash
celery -A app.celery_app worker --loglevel=info
```

  Terminal 3: Celery Beat (Optional - for periodic tasks)
```bash
celery -A app.celery_app beat --loglevel=info
```
5. Test the Complete Flow
   A. Authentication
   Visit: http://localhost:8000/auth/login
   Complete Google OAuth
   You should be redirected back with a session

   B. File Upload & ZIP Processing
   Go to: http://localhost:8000/docs
   Use POST /api/v1/files/upload to upload a file
   Check the response for ipfs_hash
   Watch Terminal 2 (Celery worker) for processing logs
   Check the file status in the database

   C. File Management
   Use GET /api/v1/files to list your files
   Use GET /api/v1/files/{id}/download to download original
   Use GET /api/v1/files/{id}/download_zip to download ZIP (after processing)
6. Monitor Celery Tasks
   Check Task Status
```bash
# In a new terminal
celery -A app.celery_app inspect active
celery -A app.celery_app inspect registered
```

## You can test your endpoints as they are:

### 1. Start the FastAPI Server
From your project root:
```bash
uvicorn app.main:app --reload
```

### 2. Open the Interactive API Docs
Visit:
http://localhost:8000/docs

You’ll see all endpoints, including authentication and file management.

### 3. Test the Flow
#### a. Authenticate
1. Go to /auth/login in your browser.
2. Complete Google login.
3. Your session cookie will be set in your browser.

#### b. **Upload a File**

- Go to [http://localhost:8000/docs](http://localhost:8000/docs)
- Find `POST /api/v1/files/upload`
- Click “Try it out”, select a file, and execute.

---

##### b.1. **Check the Response**

- You should see a response with an `ipfs_hash` field.
- This hash should also appear in your Pinata dashboard.


#### c. List Files
Use GET `/api/v1/files` to see your uploaded files.

#### d. Rename a File
Use PATCH `/api/v1/files/{file_id}` with a valid file ID and a new name as a query parameter.

#### e. Download File

- **GET `/api/v1/files/{file_id}/download`**
  - Authenticated users can download their files directly from Pinata/IPFS.
  - The endpoint streams the file from the Pinata public gateway and returns it with the original filename.

#### f. Get File Info
Use GET /api/v1/files/{file_id} with a valid file ID.

### 4. Testing with HTTP Clients
You can also use tools like:
- curl
- httpie
- Postman (import cookies from your browser for session auth)

### 5. Troubleshooting
- If you get “Not authenticated”, make sure you’re logged in via Google and your browser sends the session cookie.
- If you get “File not found”, check the file ID and that you’re logged in as the correct user.
- If you get an error, check your FastAPI logs for details.
- Make sure your Pinata API credentials are correct and active.

5.1 Celery Worker Not Starting
```bash
celery -A app.celery_app inspect ping
```