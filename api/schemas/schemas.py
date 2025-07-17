from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FileBase(BaseModel):
    filename: str
    size: Optional[int] = None


class FileCreate(FileBase):
    pass


class FileOut(FileBase):
    id: int
    status: str
    ipfs_hash: Optional[str] = None
    zip_ipfs_hash: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
