from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.analysis_result import AnalysisResult
from app.models.base import Base


class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    text_content: Mapped[str] = mapped_column(Text, nullable=False)
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)
    content_type: Mapped[str] = mapped_column(String(128), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    analysis_results: Mapped[list["AnalysisResult"]] = relationship(
        "AnalysisResult",
        back_populates="contract",
        cascade="all, delete-orphan",
        order_by=lambda: AnalysisResult.created_at.desc(),
    )
