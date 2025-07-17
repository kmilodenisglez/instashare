# import requests
# import time
#
# BASE_URL = "http://localhost:8000"
#
# # Test file upload
# def test_upload():
#     with open("test_file.txt", "w") as f:
#         f.write("Test content")
#
#     with open("test_file.txt", "rb") as f:
#         response = requests.post(
#             f"{BASE_URL}/api/v1/files/upload",
#             files={"uploaded_file": f},
#             cookies=session_cookies  # You'll need to get these from browser
#         )
#     print(f"Upload response: {response.json()}")
#
# # Test file listing
# def test_list():
#     response = requests.get(f"{BASE_URL}/api/v1/files")
#     print(f"Files: {response.json()}")
