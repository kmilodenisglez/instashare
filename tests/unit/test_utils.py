import pytest
from starlette.testclient import TestClient
from api.main import app

from api.routers.file import get_current_user
from api.external_services.pinata import upload_file_to_ipfs

from unittest.mock import patch
from api.services.files import process_and_upload_zip
from types import SimpleNamespace

import requests

BASE_URL = "http://localhost:8000"

def login_and_get_cookies(email="test@example.com", password="testpassword"):
    """
    Logs in and returns session cookies for authenticated requests.
    Adapt the payload and endpoint to your actual login flow.
    """
    # Example for a test login endpoint that sets the session
    resp = requests.post(
        f"{BASE_URL}/auth/test-login",
        json={"email": email, "password": password}
    )
    assert resp.status_code == 200
    # Return the cookies for use in subsequent requests
    return resp.cookies


@pytest.fixture
def authenticated_client():
    with TestClient(app) as client:
        # Simulate login
        resp = client.post("/auth/test-login", json={"email": "test@example.com", "password": "testpassword"})
        assert resp.status_code == 200
        yield client

def test_upload_file_with_pinata_mock(authenticated_client):
    with patch("api.routers.file.upload_file_to_ipfs") as mock_upload:
        mock_upload.return_value = "QmFakeHash123"
        response = authenticated_client.post(
            "/api/v1/files/upload",
            files={"uploaded_file": ("test.txt", b"hello world")}
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
            cookies=cookies
        )
    print(response.json())
    assert response.status_code == 200