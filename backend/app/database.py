from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import get_settings

DATABASE_URL = get_settings().database_url

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def ensure_runtime_schema():
    """Apply safe schema upgrades needed by the demo SQLite database."""
    inspector = inspect(engine)

    table_names = set(inspector.get_table_names())

    # Add structured_data to results if missing
    if "results" in table_names:
        columns = {column["name"] for column in inspector.get_columns("results")}
        if "structured_data" not in columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE results ADD COLUMN structured_data TEXT"))

    # Add reset_token / reset_token_expires to users if missing
    if "users" in table_names:
        columns = {column["name"] for column in inspector.get_columns("users")}
        if "reset_token" not in columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE users ADD COLUMN reset_token TEXT"))
        if "reset_token_expires" not in columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP"))

    # Note: unused tables (analysis_sessions, modality_results, explanations,
    # recommendations, user_preferences, audit_logs) are no longer defined in
    # models.py. They can be dropped manually via:
    #   DROP TABLE IF EXISTS ...
    # They are left intact to avoid data loss on existing production databases.
    # They will not be re-created by Base.metadata.create_all() since the
    # corresponding model classes have been removed.


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
