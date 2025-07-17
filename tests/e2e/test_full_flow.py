# Example E2E test for full file upload and download flow
import requests

def test_full_upload_download_flow():
    """Test uploading and downloading a file through the API (requires server running)."""
    base_url = "http://localhost:8000"
    session = requests.Session()
    # 1. Upload a file
    upload_resp = session.post(f"{base_url}/api/v1/files/upload", files={"uploaded_file": ("test.txt", b"hello world")})
    assert upload_resp.status_code in (200, 401)
    if upload_resp.status_code == 200:
        file_id = upload_resp.json()["id"]
        # 2. Download the file
        download_resp = session.get(f"{base_url}/api/v1/files/{file_id}/download")
        assert download_resp.status_code == 200
        assert download_resp.content == b"hello world"  # Only if file is not processed/changed 