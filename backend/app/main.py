import webbrowser
from threading import Timer

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine, ensure_runtime_schema
from app.routes import analysis, auth, history

settings = get_settings()

Base.metadata.create_all(bind=engine)
ensure_runtime_schema()

app = FastAPI(title=settings.app_name, version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(history.router, prefix="/api")


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Backend Running",
        "app": settings.app_name,
        "environment": settings.app_env,
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "database": "ready",
        "models": {
            "text": "configured",
            "audio": "configured",
            "face": "configured",
            "fusion": "configured",
        },
    }


@app.on_event("startup")
def open_browser():
    if settings.app_env == "development":
        Timer(1.0, lambda: webbrowser.open("http://localhost:8000/docs")).start()
