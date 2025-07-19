import os
import shutil
from datetime import UTC, datetime
from typing import List, AsyncGenerator

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from fastapi_cache.decorator import cache
from sqlalchemy.orm import Session

from api.database import get_db
from api.external_services import upload_file_to_ipfs
from api.models import File as FileModel
from api.models import User
from api.schemas import FileOut
from api.services import process_file_zip

router = APIRouter()


# Helper to get current user from session
async def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_data = request.session.get("user")
    if not user_data:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.query(User).filter(User.id == user_data["id"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/files/upload", response_model=FileOut)
async def upload_file(
    uploaded_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./output")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    if not uploaded_file.filename:
        raise HTTPException(400, "Filename is required")
    file_path = os.path.join(OUTPUT_DIR, uploaded_file.filename)
    # Save uploaded file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(uploaded_file.file, buffer)

    # Try to calculate the file size
    try:
        file_size = os.path.getsize(file_path)
    except Exception as e:
        # raise HTTPException(status_code=500, detail=f"Could not determine file size: {str(e)}")
        file_size = None
        # Opcional: loguear el error
        import logging
        logging.error(f"Could not determine file size for {file_path}: {e}")

    try:
        # Upload file to Pinata
        ipfs_hash = upload_file_to_ipfs(file_path)
    except Exception as e:
        # Returns a 500 error with the exception message
        raise HTTPException(status_code=500, detail=f"Failed to upload to Pinata: {str(e)}")

    # Optionally, remove the file after upload
    try:
        os.remove(file_path)
    except Exception:
        pass

    file_record = FileModel(
        user_id=user.id,
        filename=uploaded_file.filename,
        size=file_size,
        status="pending",
        ipfs_hash=ipfs_hash,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db.add(file_record)
    db.commit()
    db.refresh(file_record)
    # Trigger async ZIP processing
    process_file_zip.delay(file_record.id)
    return file_record


@router.get("/files", response_model=List[FileOut])
@cache(expire=5)  # cache the response for 60 seconds
async def list_files(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    files = db.query(FileModel).filter(FileModel.user_id == user.id).all()
    return files


@router.patch("/files/{file_id}/rename", response_model=FileOut)
async def rename_file(
    file_id: int,
    new_name: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    file = (
        db.query(FileModel)
        .filter(FileModel.id == file_id, FileModel.user_id == user.id)
        .first()
    )
    if not file:
        raise HTTPException(404, "File not found")
    file.filename = new_name
    file.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(file)
    return file


@router.get("/files/{file_id}", response_model=FileOut)
async def get_file(
    file_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    file = (
        db.query(FileModel)
        .filter(FileModel.id == file_id, FileModel.user_id == user.id)
        .first()
    )
    if not file:
        raise HTTPException(404, "File not found")
    return file


@router.get("/files/{file_id}/download")
async def download_file(
        file_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    file = (
        db.query(FileModel)
        .filter(FileModel.id == file_id, FileModel.user_id == user.id)
        .first()
    )
    if not file or not file.ipfs_hash:
        raise HTTPException(404, "File not found or not uploaded to IPFS")

    ipfs_url = f"https://gateway.pinata.cloud/ipfs/{file.ipfs_hash}"
    async with httpx.AsyncClient() as client:
        response = await client.get(ipfs_url, timeout=60.0)
        response.raise_for_status()

        async def file_stream() -> AsyncGenerator[bytes, None]:
            async for chunk in response.aiter_bytes():
                yield chunk

        return StreamingResponse(
            file_stream(),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f'attachment; filename="{file.filename}"'},
        )


@router.get("/files/{file_id}/download_zip")
@cache(expire=120)
async def download_zip_file(
    file_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    file = (
        db.query(FileModel)
        .filter(FileModel.id == file_id, FileModel.user_id == user.id)
        .first()
    )
    if not file or not file.zip_ipfs_hash:
        raise HTTPException(404, "ZIP file not found or not ready yet")
    ipfs_url = f"https://gateway.pinata.cloud/ipfs/{file.zip_ipfs_hash}"
    async with httpx.AsyncClient() as client:
        response = await client.get(ipfs_url, timeout=60.0)
        response.raise_for_status()
        return StreamingResponse(
            response.aiter_bytes(),
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{file.filename}.zip"'
            },
        )
