import os
from functools import lru_cache


class Settings:
    app_name: str = os.getenv("APP_NAME", "Behavioral Intelligence API")
    app_env: str = os.getenv("APP_ENV", "development")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///../database/beproject.db")
    secret_key: str = os.getenv("SECRET_KEY", "insecure_dev_key_replace_me")  # WARNING: must be set via env var for production!
    algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_hours: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "24"))
    upload_dir: str = os.getenv("UPLOAD_DIR", "uploads")
    max_upload_mb: int = int(os.getenv("MAX_UPLOAD_MB", "10"))
    allowed_origins: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5713,http://127.0.0.1:5713,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175",
        ).split(",")
        if origin.strip()
    ]


# =============================
# Security constants
# =============================
PBKDF2_ITERATIONS: int = int(os.getenv("PBKDF2_ITERATIONS", "260000"))
ACCESS_TOKEN_EXPIRE_HOURS: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "24"))
RESET_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "30"))


@lru_cache
def get_settings() -> Settings:
    return Settings()

