from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    name = Column(String)
    email = Column(
        String,
        unique=True,
        index=True
    )
    password = Column(String)
    reset_token = Column(String, nullable=True, index=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)


class Result(Base):
    __tablename__ = "results"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    type = Column(
        String,
        default="Text"
    )

    concern = Column(String)
    confidence = Column(Float)
    summary = Column(String)
    structured_data = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# NOTE: Previous models (AnalysisSession, ModalityResult, Explanation, Recommendation,
# UserPreference, AuditLog) were removed as they were never referenced by any route.
# All analysis data is stored in the unified `Result` model via structured_data JSON.

