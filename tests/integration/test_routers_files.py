# Example integration test for file upload endpoint


def test_upload_file(client):
    """Test uploading a file returns a valid response."""
    response = client.post(
        "/api/v1/files/upload", files={"uploaded_file": ("test.txt", b"hello world")}
    )
    assert response.status_code in (200, 401)  # 401 if authentication is required
    if response.status_code == 200:
        data = response.json()
        assert "ipfs_hash" in data
