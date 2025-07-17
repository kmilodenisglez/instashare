from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import File as FileModel
from app.pinata import upload_file_to_ipfs
import httpx
import zipfile
import tempfile
import os
import logging

from dotenv import load_dotenv
load_dotenv()  # load environment variables from .env

@celery_app.task(bind=True)
def process_file_zip(self, file_id: int):
    """Download file from Pinata, compress to ZIP, upload ZIP, update DB"""
    db = SessionLocal()
    try:
        # Get file record
        file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
        if not file_record or not file_record.ipfs_hash:
            raise Exception(f"File {file_id} not found or no IPFS hash")
        
        # Update status to processing
        file_record.status = 'processing'
        db.commit()
        
        # Download file from Pinata
        ipfs_url = f"https://gateway.pinata.cloud/ipfs/{file_record.ipfs_hash}"
        async def download_file():
            async with httpx.AsyncClient() as client:
                response = await client.get(ipfs_url, timeout=60.0)
                response.raise_for_status()
                return response.content
        
        # Run async download in sync context
        import asyncio
        file_content = asyncio.run(download_file())
        
        # Create ZIP file
        with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_zip:
            with zipfile.ZipFile(temp_zip.name, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.writestr(file_record.filename, file_content)
            
            # Upload ZIP to Pinata
            zip_ipfs_hash = upload_file_to_ipfs(temp_zip.name)
            
            # Clean up temp file
            os.unlink(temp_zip.name)
        
        # Update database
        file_record.zip_ipfs_hash = zip_ipfs_hash
        file_record.status = 'zipped'
        db.commit()
        
        logging.info(f"Successfully processed file {file_id} to ZIP: {zip_ipfs_hash}")
        return zip_ipfs_hash
        
    except Exception as e:
        # Update status to failed
        if file_record:
            file_record.status = 'failed'
            db.commit()
        logging.error(f"Failed to process file {file_id}: {str(e)}")
        raise
    finally:
        db.close()

@celery_app.task
def process_pending_files():
    """Process all files with status 'pending'"""
    db = SessionLocal()
    try:
        pending_files = db.query(FileModel).filter(FileModel.status == 'pending').all()
        for file_record in pending_files:
            process_file_zip.delay(file_record.id)
        return f"Queued {len(pending_files)} files for processing"
    finally:
        db.close() 