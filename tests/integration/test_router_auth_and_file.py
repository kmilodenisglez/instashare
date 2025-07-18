import io
import uuid
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from api.main import app

from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from authlib.integrations.base_client.errors import MismatchingStateError

# This initializes the in-memory cache (not Redis) for tests only.
@pytest.fixture(autouse=True, scope="session")
def init_cache():
    FastAPICache.init(InMemoryBackend(), prefix="test-cache")

client = TestClient(app)

API_PREFIX = "/api/v1"

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
    assert response.status_code == 200

def logout():
    response = client.post("/auth/logout")
    assert response.status_code == 200

def test_register_and_login():
    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    response = client.post("/auth/register", data={
        "email": unique_email,
        "password": "B@j0Mund1",
        "name": "Test User"
    })
    assert response.status_code == 200

    response = client.post("/auth/login", data={
        "email": unique_email,
        "password": "B@j0Mund1"
    })
    assert response.status_code == 200

def test_register_existing_email():
    email = f"testuser_{uuid.uuid4()}@example.com"
    client.post(f"/auth/register", data={
        "email": email, "password": "B@j0Mund1", "name": "Test"
    })
    response = client.post(f"/auth/register", data={
        "email": email, "password": "B@j0Mund1", "name": "Test"
    })
    assert response.status_code == 400

def test_login_invalid_credentials():
    response = client.post(f"/auth/login", data={
        "email": "no@user.com", "password": "wrong"
    })
    assert response.status_code == 401

def test_logout_and_me():
    client.post(f"/auth/logout")
    response = client.get(f"/auth/me")
    assert response.json()["authenticated"] is False

def test_upload_file_unauthenticated():
    logout()
    file_content = io.BytesIO(b"no auth")
    response = client.post(
        f"{API_PREFIX}/files/upload",
        files={"uploaded_file": ("fail.txt", file_content)},
    )
    assert response.status_code == 401

def test_rename_file_not_found(monkeypatch):
    register_user()
    cookies = login_and_get_cookies()
    response = client.patch(f"{API_PREFIX}/files/9999/rename", params={"new_name": "fail.txt"}, cookies=cookies)
    assert response.status_code == 404


def test_list_files(monkeypatch):
    # register_user(unique_email=False)
    cookies = login_and_get_cookies()
    print("cookies: ", cookies)
    # Mock para upload y subir un archivo primero
    with patch("api.external_services.pinata.upload_file_to_ipfs") as mock_upload:
        mock_upload.return_value = "QmFakeHashList"
        file_content = io.BytesIO(b"file for list")
        client.post(
            f"{API_PREFIX}/files/upload",
            files={"uploaded_file": ("list.txt", file_content)},
            cookies=cookies,
        )

    response = client.get(f"{API_PREFIX}/files", cookies=cookies)
    assert response.status_code == 200
    files = response.json()
    assert isinstance(files, list)
    assert any(f["filename"] == "list.txt" for f in files)

def test_download_file_not_found():
    cookies = login_and_get_cookies()
    response = client.get(f"{API_PREFIX}/files/9999/download", cookies=cookies)
    assert response.status_code == 404

def test_download_zip_file_not_found():
    cookies = login_and_get_cookies()
    response = client.get(f"{API_PREFIX}/files/9999/download_zip", cookies=cookies)
    assert response.status_code == 404


def test_download_file(monkeypatch):
    register_user()
    cookies = login_and_get_cookies()

    # Subir archivo
    with patch("api.external_services.pinata.upload_file_to_ipfs") as mock_upload:
        mock_upload.return_value = "QmFakeHashDownload"
        file_content = io.BytesIO(b"download me")
        resp = client.post(
            f"{API_PREFIX}/files/upload",
            files={"uploaded_file": ("download.txt", file_content)},
            cookies=cookies,
        )
        print("Status:", resp.status_code)
        print("Response:", resp.json())
        file_id = resp.json()["id"]

    # Mock de httpx para simular descarga desde IPFS
    with patch("httpx.AsyncClient.get") as mock_get:
        class MockResponse:
            status_code = 200
            def raise_for_status(self): pass
            async def aiter_bytes(self): yield b"downloaded content"
        mock_get.return_value = MockResponse()

        response = client.get(f"{API_PREFIX}/files/{file_id}/download", cookies=cookies)
        assert response.status_code == 200
        assert response.content == b"downloaded content"
def test_auth_callback_csrf_error():
    with TestClient(app) as client:
        with pytest.raises(MismatchingStateError):
            client.get("/auth/callback/google")

def test_auth_callback_csrf_error_mock():
    with patch("api.routers.auth.oauth.google.authorize_access_token", side_effect=MismatchingStateError()):
        with TestClient(app) as client:
            with pytest.raises(MismatchingStateError):
                client.get("/auth/callback/google")
