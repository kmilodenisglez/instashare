import os
import requests
import logging

PINATA_FILE_API_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS"

# Read credentials from environment variables
PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_API_SECRET = os.getenv("PINATA_API_SECRET")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./output")

def upload_file_to_ipfs(file_path=None):
    """
    Uploads a file to IPFS using Pinata API (https://pinata.cloud/)
    :param file_path: Path to the file to upload (defaults to encrypted database)
    :return: IPFS hash
    """
    if file_path is None:
        # Default to the encrypted database file
        file_path = os.path.join(OUTPUT_DIR, "db.libsql.pgp")
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    if not PINATA_API_KEY or not PINATA_API_SECRET:
        raise Exception("Error: Pinata IPFS API credentials not found, please check your environment variables")

    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_API_SECRET
    }

    try:
        with open(file_path, 'rb') as file:
            files = {
                'file': file
            }
            response = requests.post(
                PINATA_FILE_API_ENDPOINT,
                files=files,
                headers=headers
            )
        
        response.raise_for_status()
        result = response.json()
        logging.info(f"Successfully uploaded file to IPFS with hash: {result['IpfsHash']}")
        return result['IpfsHash']

    except requests.exceptions.RequestException as e:
        logging.error(f"An error occurred while uploading file to IPFS: {e}")
        raise e 