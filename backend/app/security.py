from datetime import datetime, timedelta, timezone
import base64
import hashlib
import hmac
import os
import secrets

import uuid

import bcrypt
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import HTTPException
from app.config import get_settings

# ===============================
# CONFIG
# ===============================
settings = get_settings()
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_HOURS = settings.access_token_expire_hours
# PBKDF2 iterations now read from config.py
from app.config import PBKDF2_ITERATIONS, ACCESS_TOKEN_EXPIRE_HOURS as _unused_expire

# ===============================
# PASSWORD
# ===============================
def hash_password(password: str) -> str:
    cleaned = password.strip() if password else ""

    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        cleaned.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )

    return "pbkdf2_sha256${}${}${}".format(
        PBKDF2_ITERATIONS,
        base64.b64encode(salt).decode("ascii"),
        base64.b64encode(digest).decode("ascii"),
    )


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    cleaned = plain_password.strip() if plain_password else ""

    try:
        if hashed_password.startswith("pbkdf2_sha256$"):
            _, iterations, salt_b64, digest_b64 = hashed_password.split("$", 3)
            salt = base64.b64decode(salt_b64.encode("ascii"))
            expected = base64.b64decode(digest_b64.encode("ascii"))
            actual = hashlib.pbkdf2_hmac(
                "sha256",
                cleaned.encode("utf-8"),
                salt,
                int(iterations),
            )
            return hmac.compare_digest(actual, expected)

        if hashed_password.startswith("$2"):
            return bcrypt.checkpw(
                cleaned.encode("utf-8"),
                hashed_password.encode("utf-8"),
            )

        return False
    except Exception:
        return False


# ===============================
# RESET TOKEN
# ===============================
def generate_reset_token() -> tuple[str, datetime]:
    """Generate a secure random reset token with 30-minute expiry."""
    token = secrets.token_urlsafe(48)
    expires = datetime.now(timezone.utc) + timedelta(minutes=30)
    return token, expires


def verify_reset_token(token: str, stored_token: str | None, expires_at: datetime | None) -> bool:
    """Verify a reset token hasn't expired and matches the stored token."""
    if not stored_token or not expires_at:
        return False

    if datetime.now(timezone.utc) > expires_at:
        return False

    return hmac.compare_digest(token, stored_token)


# ===============================
# TOKEN
# ===============================
def create_access_token(data: dict) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(
        hours=ACCESS_TOKEN_EXPIRE_HOURS
    )

    payload = data.copy()
    payload.update({
        "jti": str(uuid.uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "access"
    })

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("type") != "access":
            raise HTTPException(
                status_code=401,
                detail="Invalid token type"
            )

        return payload

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
