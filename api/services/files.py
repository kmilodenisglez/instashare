from api.external_services.pinata import upload_file_to_ipfs

def process_and_upload_zip(filename, content):
    return upload_file_to_ipfs(filename)