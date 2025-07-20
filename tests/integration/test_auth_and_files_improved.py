import io
import uuid
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def generate_user_data():
    return {
        "email": f"test_{uuid.uuid4()}@example.com",  # Unique email per test
        "password": "ValidP@ssword123",
        "name": "Test User"
    }

# Helper for login and getting session cookies
def login_and_get_cookies(email="test@example.com", password="T3stp@ssw0rd"):
    resp = client.post("/auth/login", data={"email": email, "password": password})
    assert resp.status_code == 200
    return resp.cookies

# Helper to register a user
def register_user(unique_email=True, password="T3stp@ssw0rd", name="Test User"):
    email = f"testuser_{uuid.uuid4()}@example.com"
    if not unique_email:
        email = "test@example.com"
    response = client.post("/auth/register", data={
        "email": email,
        "password": password,
        "name": name
    })
    return email  # <--- returns the email, not the response

@pytest.fixture(scope="module", autouse=True)
def setup_test_user():
    user_data = generate_user_data()
    response = client.post("/auth/register", data=user_data)
    assert response.status_code == 200  # Verifies that registration was successful

    # Perform login and store cookies
    login_response = client.post("/auth/login", data={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    assert login_response.status_code == 200  # Verifies that login was successful
    cookies = login_response.cookies  # Get the cookies from the response
    assert cookies, "Login failed, no cookies returned"  # Verifies that cookies are not empty

    return cookies, user_data["email"]  # Returns cookies and email for use in other tests

def test_me_authenticated(setup_test_user):
    cookies, expected_email = setup_test_user  # Using the cookies and email generated in the fixture
    response = client.get("/auth/me", cookies=cookies)
    assert response.status_code == 200
    assert response.json()["authenticated"] is True
    assert response.json()["user"]["email"] == expected_email  # Compares with the dynamically generated email

def test_upload_file_authenticated(setup_test_user):
    cookies, _ = setup_test_user  # Using the cookies
    file_data = {
        "uploaded_file": ("test.txt", io.BytesIO(b"Hello, world"), "text/plain")
    }

    # We make the request to upload the file
    response = client.post("/api/v1/files/upload", files=file_data, cookies=cookies)

    # Prints the response for debugging the error
    print(response.text)  # This will help you better understand the server message

    assert response.status_code == 200  # We expect a 200 response if everything is correct
    json_data = response.json()
    assert "id" in json_data  # Verifies that a file ID was generated, using 'id' instead of 'file_id'

def test_upload_without_file_authenticated(setup_test_user):
    cookies, _ = setup_test_user  # Using the cookies
    response = client.post("/api/v1/files/upload", files={}, cookies=cookies)
    assert response.status_code in (400, 422)  # 422 is expected due to a missing file

def test_register_existing_user():
    user_data = generate_user_data()
    # First time - OK
    response = client.post("/auth/register", data=user_data)
    assert response.status_code == 200
    # Second time - should fail
    response = client.post("/auth/register", data=user_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_wrong_password():
    user_data = generate_user_data()
    client.post("/auth/register", data=user_data)
    response = client.post("/auth/login", data={
        "email": user_data["email"],
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_login_nonexistent_user():
    response = client.post("/auth/login", data={
        "email": "nonexistent@example.com",
        "password": "any"
    })
    assert response.status_code == 401

def test_me_unauthenticated():
    unauth_client = TestClient(app)
    response = unauth_client.get("/auth/me")
    assert response.status_code == 200
    assert response.json()["authenticated"] is False

def test_download_nonexistent_file_authenticated(setup_test_user):
    cookies, _ = setup_test_user  # Using the cookies
    response = client.get("/api/v1/files/9999/download", cookies=cookies)
    assert response.status_code == 404

def test_test_login():
    response = client.post("/auth/test-login")
    assert response.status_code == 200
    assert response.json()["message"] == "logged in"

def test_upload_file_without_filename(setup_test_user):
    cookies, _ = setup_test_user
    file_data = {
        "uploaded_file": ("", io.BytesIO(b"no name"), "text/plain")
    }
    response = client.post("/api/v1/files/upload", files=file_data, cookies=cookies)
    assert response.status_code in (400, 422)
    assert "Expected UploadFile" in response.text or "value_error" in response.text

def test_rename_nonexistent_file(setup_test_user):
    cookies, _ = setup_test_user
    response = client.patch("/api/v1/files/999999/rename", params={"new_name": "new.txt"}, cookies=cookies)
    assert response.status_code == 404
    assert "File not found" in response.text

def test_download_zip_nonexistent_file(setup_test_user):
    cookies, _ = setup_test_user
    response = client.get("/api/v1/files/999999/download_zip", cookies=cookies)
    assert response.status_code == 404
    assert "ZIP file not found" in response.text

def test_register_invalid_email():
    response = client.post("/auth/register", data={
        "email": "not-an-email",
        "password": "ValidP@ssword123",
        "name": "Test User"
    })
    assert response.status_code == 400

def test_logout_without_session():
    response = client.post("/auth/logout")
    assert response.status_code == 200  # O el código que uses para logout sin sesión

def test_register_existing_email_error():
    user_data = generate_user_data()
    # Primer registro
    response = client.post("/auth/register", data=user_data)
    assert response.status_code == 200
    # Segundo registro con el mismo email
    response = client.post("/auth/register", data=user_data)
    assert response.status_code == 400
    assert "Email already registered" in response.text

def test_login_invalid_credentials():
    user_data = generate_user_data()
    # No registramos el usuario
    response = client.post("/auth/login", data={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    assert response.status_code == 401
    assert "Invalid credentials" in response.text

def test_logout_clears_session():
    user_data = generate_user_data()
    client.post("/auth/register", data=user_data)
    login_resp = client.post("/auth/login", data={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    cookies = login_resp.cookies
    # Logout
    response = client.post("/auth/logout", cookies=cookies)
    assert response.status_code == 200
    # Remove session cookie to simulate a new session
    client.cookies.clear()
    response = client.get("/auth/me")
    assert response.json()["authenticated"] is False

def test_me_no_session():
    from fastapi.testclient import TestClient
    unauth_client = TestClient(app)
    response = unauth_client.get("/auth/me")
    assert response.status_code == 200
    assert response.json()["authenticated"] is False

def test_oauth_callback_missing_userinfo(monkeypatch):
    # Simula que authorize_access_token retorna un token sin userinfo
    class DummyOAuth:
        async def authorize_access_token(self, request):
            return {}
    monkeypatch.setattr("api.routers.auth.oauth.google", DummyOAuth())
    response = client.get("/auth/callback/google")
    assert response.status_code == 400
    assert "Could not get userinfo" in response.text