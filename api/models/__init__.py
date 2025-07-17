"""
Models package - SQLAlchemy database models
"""
# Importar Base primero
from .base import Base

# Importar modelos en orden correcto para evitar problemas de relaciones
from .user import User
from .file import File

# Asegurar que todas las relaciones estén configuradas
def configure_mappers():
    """Configure all SQLAlchemy mappers"""
    from sqlalchemy.orm import configure_mappers
    configure_mappers()

__all__ = [
    "Base",
    "User",
    "File",
    "configure_mappers"
]