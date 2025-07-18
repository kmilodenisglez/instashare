import io
from unittest.mock import patch
from fastapi.testclient import TestClient
from api.main import app
from tests.integration.test_router_auth_and_file import login_and_get_cookies

client = TestClient(app)

API_PREFIX = "/api/v1"

def test_upload_file_pinata_error(monkeypatch):
    # Simula login y obtiene cookies
    # ... (tu helper de login aquí) ...
    cookies = login_and_get_cookies()

    # Mockea upload_file_to_ipfs para lanzar una excepción
    with patch("api.routers.file.upload_file_to_ipfs") as mock_upload:
        mock_upload.side_effect = Exception("Pinata error")
        file_content = io.BytesIO(b"fail pinata")
        response = client.post(
            f"{API_PREFIX}/files/upload",
            files={"uploaded_file": ("fail.txt", file_content)},
            cookies=cookies,
        )
        # Espera un error 500 o el código que manejes en tu backend
        assert response.status_code in (400, 500)
        assert "error" in response.text or "Pinata" in response.text