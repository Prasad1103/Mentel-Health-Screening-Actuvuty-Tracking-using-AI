from datetime import datetime, timezone
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserLogin, ForgotPasswordRequest, ResetPasswordRequest

from ..security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_reset_token,
    verify_reset_token,
)

router = APIRouter(tags=["Auth"])

# Simple in-memory rate limiter
_login_attempts: dict[str, list[float]] = defaultdict(list)
LOGIN_RATE_LIMIT = 10  # max attempts
LOGIN_RATE_WINDOW = 300  # seconds (5 minutes)


def _check_login_rate_limit(ip: str) -> None:
    now = datetime.now(timezone.utc).timestamp()
    attempts = _login_attempts[ip]
    # Prune old entries
    _login_attempts[ip] = [t for t in attempts if now - t < LOGIN_RATE_WINDOW]
    if len(_login_attempts[ip]) >= LOGIN_RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please try again later."
        )
    _login_attempts[ip].append(now)


# ===============================
# REGISTER
# ===============================
@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        name=user.name.strip(),
        email=user.email.strip().lower(),
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({
        "user_id": new_user.id,
        "email": new_user.email
    })

    return {
        "message": "Registered successfully",
        "token": token,
        "access_token": token,
        "token_type": "bearer",
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    }


# ===============================
# LOGIN
# ===============================
@router.post("/login")
def login(
    request: Request,
    user: UserLogin,
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "unknown"
    _check_login_rate_limit(client_ip)
    db_user = db.query(User).filter(
        User.email == user.email.strip().lower()
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token({
        "user_id": db_user.id,
        "email": db_user.email
    })

    return {
        "message": "Login success",
        "token": token,
        "access_token": token,
        "token_type": "bearer",
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email
    }


# ===============================
# FORGOT PASSWORD
# ===============================
@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Generate a secure reset token for the given email.
    Always returns the same message to avoid exposing whether the email exists.
    """
    user = db.query(User).filter(
        User.email == payload.email.strip().lower()
    ).first()

    if user:
        token, expires = generate_reset_token()
        user.reset_token = token
        user.reset_token_expires = expires
        db.commit()

    # Always return success — never reveal whether the email exists
    return {
        "message": "If an account with that email exists, a reset link has been sent."
    }


# ===============================
# RESET PASSWORD
# ===============================
@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset the user's password using a valid reset token.
    Tokens are single-use and expire after 30 minutes.
    """
    user = db.query(User).filter(
        User.reset_token == payload.token
    ).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token."
        )

    # Verify token hasn't expired
    if not verify_reset_token(payload.token, user.reset_token, user.reset_token_expires):
        # Clear the expired token
        user.reset_token = None
        user.reset_token_expires = None
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token."
        )

    # Update password and invalidate token (single-use)
    user.password = hash_password(payload.password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return {
        "message": "Password has been reset successfully."
    }
