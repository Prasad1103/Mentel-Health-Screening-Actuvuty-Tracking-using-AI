from pydantic import BaseModel, Field, field_validator
import re


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Full name")
    email: str = Field(..., description="Email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password (min 8 chars)")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", cleaned):
            raise ValueError("Invalid email format")
        return cleaned

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 1:
            raise ValueError("Name cannot be empty")
        return cleaned


class UserLogin(BaseModel):
    email: str = Field(..., description="Email address")
    password: str = Field(..., min_length=1, description="Password")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", cleaned):
            raise ValueError("Invalid email format")
        return cleaned


class TextRequest(BaseModel):
    user_id: int
    text: str


class ModalityResultSchema(BaseModel):
    emotion: str
    confidence: float
    quality: float | None = None
    probabilities: list[float] | None = None


class ExplanationSchema(BaseModel):
    reasons: list[str]
    model_agreement: str | None = None
    limitations: str | None = None


class RecommendationSchema(BaseModel):
    risk_level: str
    items: list[str]


class AnalysisResponse(BaseModel):
    id: int | None = None
    type: str
    emotion: str
    concern: str
    confidence: float
    summary: str | None = None
    final: ModalityResultSchema | None = None
    explanation: ExplanationSchema | None = None
    recommendations: RecommendationSchema | None = None
    risk_level: str | None = None


class QuestionnaireAnswer(BaseModel):
    value: str = Field(..., min_length=1, description="Selected option value")
    label: str = Field(..., min_length=1, description="Display label for the option")

    @field_validator("value")
    @classmethod
    def validate_value(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Answer value cannot be empty")
        return cleaned

    @field_validator("label")
    @classmethod
    def validate_label(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Answer label cannot be empty")
        return cleaned


class QuestionnaireSubmission(BaseModel):
    answers: dict[str, QuestionnaireAnswer] = Field(
        ...,
        description="User's MCQ answers keyed by question ID",
    )
    free_text: str = Field(
        ...,
        min_length=20,
        max_length=2000,
        description="Free-text emotional description (min 20 characters)",
    )
    facial_emotion: str | None = Field(
        None,
        description="Optional detected facial emotion - empty string will be normalized to None",
    )

    @field_validator("answers")
    @classmethod
    def validate_answers(cls, v: dict[str, QuestionnaireAnswer]) -> dict[str, QuestionnaireAnswer]:
        if not v:
            raise ValueError("At least one answer is required")
        if len(v) > 50:
            raise ValueError("Maximum 50 answers allowed")
        return v

    @field_validator("free_text")
    @classmethod
    def validate_free_text(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 20:
            raise ValueError(f"Free text must be at least 20 characters (got {len(cleaned)})")
        return cleaned

    @field_validator("facial_emotion")
    @classmethod
    def normalize_facial_emotion(cls, v: str | None) -> str | None:
        if v is None:
            return None
        cleaned = v.strip()
        return cleaned if cleaned else None


class ChatMessage(BaseModel):
    role: str
    content: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if cleaned not in {"user", "assistant"}:
            raise ValueError("Chat role must be 'user' or 'assistant'")
        return cleaned

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Chat message content cannot be empty")
        return cleaned


class ChatSubmission(BaseModel):
    message: str = Field(..., min_length=1, description="User's chat message (min 1 char)")
    transcript: list[ChatMessage] = []
    audio_summary: str | None = None
    facial_emotion: str | None = None


class ChatFinalizeSubmission(BaseModel):
    transcript: list[ChatMessage]
    latest_message: str = Field(..., min_length=1, description="Final message to finalize with (min 1 char)")
    audio_summary: str | None = None
    facial_emotion: str | None = None


class ChatEmotionEntry(BaseModel):
    """Single emotion data point for session trend tracking."""
    emotion: str
    confidence: float
    concern_level: str
    timestamp: str | None = None


# ===========================
# Forgot / Reset Password Schemas
# ===========================


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., description="Email address to send reset link")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", cleaned):
            raise ValueError("Invalid email format")
        return cleaned


class ForgotPasswordResponse(BaseModel):
    message: str = "If an account with that email exists, a reset link has been sent."


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Reset token received via email")
    password: str = Field(..., min_length=8, max_length=128, description="New password (min 8 chars)")


class ResetPasswordResponse(BaseModel):
    message: str = "Password has been reset successfully."
