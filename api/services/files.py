import httpx

from api.external_services.pinata import upload_file_to_ipfs


async def download_file(ipfs_url):
    async with httpx.AsyncClient() as client:
        response = await client.get(ipfs_url, timeout=60.0)
        response.raise_for_status()
        return response.content


def process_and_upload_zip(filename, content):
    return upload_file_to_ipfs(filename)
