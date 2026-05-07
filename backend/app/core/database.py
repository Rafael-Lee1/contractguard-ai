from collections.abc import Generator
from functools import lru_cache
import logging

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.models.base import Base

logger = logging.getLogger(__name__)


@lru_cache
def get_engine() -> Engine:
    settings = get_settings()

    connect_args = {}
    if settings.database_url.startswith("postgresql"):
        connect_args = {"sslmode": "require"}

    return create_engine(
        settings.database_url,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=1800,
        future=True,
    )


SessionLocal = sessionmaker(
    bind=get_engine(),
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=Session,
)


def get_db_session() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def init_db() -> None:
    """Initialize database with proper error handling and logging."""
    try:
        import app.models  # noqa: F401

        engine = get_engine()
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialization successful")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}", exc_info=True)
        raise
