from unittest.mock import patch, MagicMock, AsyncMock

import pytest
import requests
from starlette.testclient import TestClient

from api.main import app
from api.services.files import process_and_upload_zip

BASE_URL = "http://localhost:8000"

import celery

celery.current_app.conf.task_always_eager = True

def login_and_get_cookies(email="test@example.com", password="testpassword"):
    """
    Logs in and returns session cookies for authenticated requests.
    Adapt the payload and endpoint to your actual login flow.
    """
    # Example for a test login endpoint that sets the session
    resp = requests.post(
        f"{BASE_URL}/auth/test-login", json={"email": email, "password": password}
    )
    assert resp.status_code == 200
    # Return the cookies for use in subsequent requests
    return resp.cookies


@pytest.fixture
def authenticated_client():
    with TestClient(app) as client:
        # Simulate login
        resp = client.post(
            "/auth/test-login",
            json={"email": "test@example.com", "password": "testpassword"},
        )
        assert resp.status_code == 200
        yield client


def async_return(value):
    async def _coroutine(*args, **kwargs):
        return value
    return _coroutine()

async def mock_download_file(*args, **kwargs):
    return b"fake file content"

def test_upload_file_with_pinata_mock(authenticated_client):
    with patch("api.routers.file.upload_file_to_ipfs") as mock_upload, \
         patch("requests.get") as mock_requests_get, \
         patch("api.services.files.download_file", new_callable=AsyncMock) as mock_download:
        mock_upload.return_value = "QmFakeHash123"
        mock_download.side_effect = mock_download_file
        # Mock the download to return a fake response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = b"fake file content"
        mock_response.raise_for_status = lambda: None
        mock_requests_get.return_value = mock_response

        response = authenticated_client.post(
            "/api/v1/files/upload",
            files={"uploaded_file": ("test.txt", b"hello world")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ipfs_hash"] == "QmFakeHash123"


def test_process_and_upload_zip():
    with patch("api.services.files.upload_file_to_ipfs") as mock_upload:
        mock_upload.return_value = "QmFakeZipHash"
        result = process_and_upload_zip("test.txt", b"content")
        assert result == "QmFakeZipHash"


def test_upload():
    cookies = login_and_get_cookies()
    with open("test_file.txt", "w") as f:
        f.write("Test content")

    with open("test_file.txt", "rb") as f:
        response = requests.post(
            f"{BASE_URL}/api/v1/files/upload",
            files={"uploaded_file": f},
            cookies=cookies,
        )
    if response.status_code == 200:
        print(response.json())
    else:
        print("Error:", response.status_code, response.text)
    assert response.status_code == 200
