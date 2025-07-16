from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.models import File as FileModel, User
from app.database import get_db
from app.schemas import FileOut
from typing import List
from datetime import datetime

router = APIRouter()

# Helper to get current user from session
async def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_data = request.session.get('user')
    if not user_data:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.query(User).filter(User.id == user_data['id']).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post('/files/upload', response_model=FileOut)
async def upload_file(
    uploaded_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    contents = await uploaded_file.read()
    # Placeholder: Save file to Pinata, get ipfs_hash
    ipfs_hash = 'placeholder_ipfs_hash'
    file_record = FileModel(
        user_id=user.id,
        filename=uploaded_file.filename,
        size=len(contents),
        status='pending',
        ipfs_hash=ipfs_hash,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(file_record)
    db.commit()
    db.refresh(file_record)
    # TODO: Trigger async compression job
    return file_record

@router.get('/files', response_model=List[FileOut])
async def list_files(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    files = db.query(FileModel).filter(FileModel.user_id == user.id).all()
    return files

@router.patch('/files/{file_id}', response_model=FileOut)
async def rename_file(
    file_id: int,
    new_name: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    file = db.query(FileModel).filter(FileModel.id == file_id, FileModel.user_id == user.id).first()
    if not file:
        raise HTTPException(404, "File not found")
    file.filename = new_name
    file.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(file)
    return file

@router.get('/files/{file_id}', response_model=FileOut)
async def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    file = db.query(FileModel).filter(FileModel.id == file_id, FileModel.user_id == user.id).first()
    if not file:
        raise HTTPException(404, "File not found")
    return file 