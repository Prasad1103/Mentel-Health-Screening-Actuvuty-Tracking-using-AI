from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.security import verify_token

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    raw = credentials.credentials or ""
    token = raw.strip().strip('"').strip("'")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    if token.lower().startswith("bearer "):
        token = token.split(" ", 1)[1].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    payload = verify_token(token)

    user_id = payload.get("user_id")
    email = payload.get("email")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )

    return {
        "user_id": int(user_id),
        "email": email
    }
