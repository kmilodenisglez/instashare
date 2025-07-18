import io
from unittest.mock import patch
from fastapi.testclient import TestClient
from api.main import app
from tests.integration.test_router_auth_and_file import login_and_get_cookies
import pytest
from api.external_services.pinata import upload_file_to_ipfs

client = TestClient(app)

API_PREFIX = "/api/v1"

def test_upload_file_pinata_error(monkeypatch):
    # Simulate login and get cookies
    # ... (login helper here) ...
    cookies = login_and_get_cookies()

    # Mock upload_file_to_ipfs to throw an exception
    with patch("api.routers.file.upload_file_to_ipfs") as mock_upload:
        mock_upload.side_effect = Exception("Pinata error")
        file_content = io.BytesIO(b"fail pinata")
        response = client.post(
            f"{API_PREFIX}/files/upload",
            files={"uploaded_file": ("fail.txt", file_content)},
            cookies=cookies,
        )
        # Wait for a 500 error or whatever code you handle in your backend
        assert response.status_code in (400, 500)
        assert "error" in response.text or "Pinata" in response.text

def test_upload_file_to_ipfs_file_not_found():
    with pytest.raises(FileNotFoundError):
        upload_file_to_ipfs("no_such_file.txt")

def test_upload_file_to_ipfs_no_credentials(monkeypatch, tmp_path):
    test_file = tmp_path / "test.txt"
    test_file.write_text("hello")
    monkeypatch.setenv("PINATA_API_KEY", "")
    monkeypatch.setenv("PINATA_API_SECRET", "")
    with pytest.raises(Exception):
        upload_file_to_ipfs(str(test_file))

def test_upload_file_to_ipfs_requests_error(monkeypatch, tmp_path):
    test_file = tmp_path / "test.txt"
    test_file.write_text("hello")
    monkeypatch.setenv("PINATA_API_KEY", "fake")
    monkeypatch.setenv("PINATA_API_SECRET", "fake")
    import requests
    from unittest.mock import patch
    with patch("requests.post") as mock_post:
        mock_post.side_effect = requests.exceptions.RequestException("fail")
        with pytest.raises(requests.exceptions.RequestException):
            upload_file_to_ipfs(str(test_file))