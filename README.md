python -m venv .venv
source .venv/bin/activate
pip install --no-cache-dir -r requirements.txt
deactivate

uvicorn app.main:app --reload


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

#### b. Upload a File
- In the /docs UI, use the POST /api/v1/files/upload endpoint.
- Click “Try it out”, upload a file, and execute.

#### c. List Files
Use GET `/api/v1/files` to see your uploaded files.

#### d. Rename a File
Use PATCH `/api/v1/files/{file_id}` with a valid file ID and a new name as a query parameter.

#### e. Get File Info
Use GET /api/v1/files/{file_id} with a valid file ID.

### 4. Testing with HTTP Clients
You can also use tools like:
- curl
- httpie
- Postman (import cookies from your browser for session auth)

### 5. Troubleshooting
- If you get “Not authenticated”, make sure you’re logged in via Google and your browser sends the session cookie.
- If you get “File not found”, check the file ID and that you’re logged in as the correct user.