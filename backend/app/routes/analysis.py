from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pathlib import Path
from uuid import uuid4
import os
import subprocess
import numpy as np
from app.config import get_settings
from app.database import get_db
from app.models import Result
from app.dependencies import get_current_user
from app.ai.text_model import (
    predict_text,
    predict_text_probs
)
from app.ai.audio_model import (
    predict_audio,
)
from app.ai.face_model import (
    predict_face,
    predict_face_probs
)
from app.ai.fusion import predict_fusion
from app.services.explainability import build_explanation, build_fusion_explanation
from app.services.recommendations import build_recommendations
from app.services.concern_level import build_concern_meta, normalize_score
from app.schemas import ChatFinalizeSubmission, ChatSubmission, QuestionnaireSubmission
import json
import random
import time
import asyncio

router = APIRouter(tags=["Analysis"])

# Shared emotion class names in severity order (lowest to highest risk)
CLASS_NAMES = ["Positive", "Neutral", "Stress", "Anxiety", "Negative", "Depression"]


settings = get_settings()
UPLOAD_DIR = Path(settings.upload_dir)
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_MB = settings.max_upload_mb
MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024


def validate_extension(filename: str, allowed: list[str]):
    ext = Path(filename).suffix.lower()

    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Allowed types: {', '.join(allowed)}"
        )

    return ext


def save_upload_file(upload: UploadFile, allowed: list[str]):
    if not upload.filename:
        raise HTTPException(
            status_code=400,
            detail="File required"
        )

    ext = validate_extension(
        upload.filename,
        allowed
    )

    data = upload.file.read()

    if not data:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Max file size {MAX_FILE_MB}MB"
        )

    file_name = f"{uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / file_name

    with open(file_path, "wb") as f:
        f.write(data)

    return file_path


def normalize_confidence(value: float) -> float:
    return value * 100 if value <= 1 else value


def convert_audio_to_wav(input_path: Path) -> Path:
    output_path = UPLOAD_DIR / f"converted_{uuid4().hex}.wav"
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_path),
        "-ac",
        "1",
        "-ar",
        "22050",
        str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        error_lines = result.stderr.strip().splitlines()
        error_message = error_lines[-1] if error_lines else "Unknown FFmpeg error"
        raise HTTPException(
            status_code=500,
            detail=f"FFmpeg conversion failed: {error_message}"
        )

    return output_path


def modality_result(pred: dict) -> dict:
    return {
        "emotion": pred.get("emotion", "Neutral"),
        "confidence": float(pred.get("confidence", 0.0)),
        "quality": normalize_confidence(float(pred.get("confidence", 0.0))),
        "probabilities": pred.get("probs", []),
    }


def _compute_fusion(
    text_pred: dict,
    audio_pred: dict | None,
    face_pred: dict | None,
    text_probs: np.ndarray | None = None,
    audio_probs: np.ndarray | None = None,
    face_probs: np.ndarray | None = None,
) -> tuple[str, float, bool]:
    """
    Compute weighted fusion from up to 3 modality predictions.
    Returns (final_emotion, final_confidence, is_fusion).
    If fewer than 2 modalities, uses text-only result.
    """
    has_audio = audio_pred is not None
    has_face = face_pred is not None

    if text_probs is None:
        text_probs = np.array(text_pred["probs"])
    if audio_probs is None and has_audio and audio_pred:
        audio_probs = np.array(audio_pred["probs"])
    if face_probs is None and has_face and face_pred:
        face_probs = np.array(face_pred["probs"])

    is_fusion = has_audio or has_face

    if is_fusion and has_audio and has_face:
        try:
            fused = predict_fusion(text_probs, audio_probs, face_probs)
            return fused["emotion"], float(fused["confidence"]), True
        except Exception:
            combined = text_probs * 0.4 + audio_probs * 0.3 + face_probs * 0.3
            idx = int(np.argmax(combined))
            return CLASS_NAMES[idx] if 0 <= idx < len(CLASS_NAMES) else "Neutral", float(combined[idx]), True

    if has_audio and not has_face:
        combined = text_probs * 0.55 + audio_probs * 0.45
        idx = int(np.argmax(combined))
        return CLASS_NAMES[idx] if 0 <= idx < len(CLASS_NAMES) else "Neutral", float(combined[idx]), True

    if has_face and not has_audio:
        combined = text_probs * 0.55 + face_probs * 0.45
        idx = int(np.argmax(combined))
        return CLASS_NAMES[idx] if 0 <= idx < len(CLASS_NAMES) else "Neutral", float(combined[idx]), True

    return text_pred["emotion"], float(text_pred["confidence"]), False


def _compute_modality_weights(has_audio: bool, has_face: bool) -> dict[str, float]:
    if has_audio and has_face:
        return {"text": 0.4, "audio": 0.3, "face": 0.3}
    if has_audio:
        return {"text": 0.55, "audio": 0.45, "face": 0.0}
    if has_face:
        return {"text": 0.55, "audio": 0.0, "face": 0.45}
    return {"text": 1.0, "audio": 0.0, "face": 0.0}


def build_chat_analysis_payload(
    message: str,
    transcript: list,
    audio_summary: str | None = None,
    facial_emotion: str | None = None,
):
    user_lines = [
        f"user: {item.content.strip()}"
        for item in transcript
        if item.content and item.content.strip() and item.role == "user"
    ]

    latest_line = f"user: {message.strip()}"
    if not user_lines or user_lines[-1] != latest_line:
        user_lines.append(latest_line)

    analysis_text = "\n".join(user_lines[-12:]) or message

    if audio_summary:
        analysis_text += f"\nAudio signal: {audio_summary}"

    if facial_emotion:
        analysis_text += f"\nFace signal: {facial_emotion}"

    pred = predict_text(analysis_text)
    confidence_norm = normalize_score(float(pred["confidence"]))
    concern_meta = build_concern_meta(confidence_norm)
    recommendations = build_recommendations(pred["emotion"], confidence_norm)

    return pred, confidence_norm, concern_meta, recommendations


def chat_response(
    row_id: int | None,
    message: str,
    transcript: list,
    pred: dict,
    confidence_norm: float,
    concern_meta: dict,
    recommendations: dict,
    audio_summary: str | None = None,
    facial_emotion: str | None = None,
    ai_response: str | None = None,
):
    structured_data = {
        "type": "Chat",
        "message": message,
        "transcript": [
            {"role": item.role, "content": item.content}
            for item in transcript
            if item.content and item.content.strip()
        ],
        "audio_summary": audio_summary,
        "facial_emotion": facial_emotion,
        "emotion": pred["emotion"],
        "concern_level": concern_meta["concern_level"],
        "confidence": confidence_norm,
        "wellness_status": concern_meta["wellness_status"],
        "turn_count": len([item for item in transcript if item.role == "user"]),
    }

    readable_summary = (
        f"Chat Session | {structured_data['turn_count']} user message"
        f"{'' if structured_data['turn_count'] == 1 else 's'} | "
        f"Latest: {message[:140]}"
    )

    return {
        "id": row_id,
        "type": "Chat",
        "emotion": pred["emotion"],
        "concern": concern_meta["concern_level"],
        "concern_level": concern_meta["concern_level"],
        "confidence": confidence_norm,
        "severity_color": concern_meta["severity_color"],
        "wellness_status": concern_meta["wellness_status"],
        "summary": readable_summary,
        "structured_data": structured_data,
        "final": modality_result(pred),
        "modalities": {"text": modality_result(pred)},
        "explanation": build_explanation(pred["emotion"], confidence_norm, "Chat"),
        "recommendations": recommendations,
        "risk_level": recommendations["risk_level"],
        "ai_response": ai_response,
    }

# ==================================================
# TEXT ANALYSIS
# ==================================================
@router.post("/analyze-text")
def analyze_text(
    text: str,
    current=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not text or len(text.strip()) < 3:
        raise HTTPException(status_code=400, detail="Text must be at least 3 characters")
    user_id = current["user_id"]
    pred = predict_text(text)

    confidence_norm = normalize_score(float(pred["confidence"]))
    concern_meta = build_concern_meta(confidence_norm)
    recommendations = build_recommendations(pred["emotion"], confidence_norm)

    structured_data = {
        "type": "Text",
        "text": text,
        "emotion": pred["emotion"],
        "concern_level": concern_meta["concern_level"],
        "confidence": confidence_norm,
        "wellness_status": concern_meta["wellness_status"],
    }

    row = Result(
        user_id=user_id,
        type="Text",
        concern=concern_meta["concern_level"],
        confidence=confidence_norm,
        summary=text,
        structured_data=json.dumps(structured_data),
    )

    db.add(row)
    db.commit()
    db.refresh(row)

    return {
        "id": row.id,
        "type": "Text",
        "emotion": pred["emotion"],
        "concern": concern_meta["concern_level"],
        "confidence": confidence_norm,
        "concern_level": concern_meta["concern_level"],
        "severity_color": concern_meta["severity_color"],
        "wellness_status": concern_meta["wellness_status"],
        "summary": text,
        "final": modality_result(pred),
        "modalities": {"text": modality_result(pred)},
        "explanation": build_explanation(pred["emotion"], confidence_norm, "Text"),
        "recommendations": recommendations,
        "risk_level": recommendations["risk_level"]
    }


# ==================================================
# CHAT ANALYSIS (text-only fallback)
# ==================================================
@router.post("/analyze-chat")
def analyze_chat(
    payload: ChatSubmission,
    current=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    message = payload.message.strip()

    if len(message) < 3:
        raise HTTPException(status_code=400, detail="Message is too short")

    try:
        pred, confidence_norm, concern_meta, recommendations = build_chat_analysis_payload(
            message,
            payload.transcript,
            payload.audio_summary,
            payload.facial_emotion,
        )
        ai_response = _generate_contextual_response(
            pred["emotion"], concern_meta, confidence_norm,
            recommendations, [], message
        )
        # Persist to DB
        row = Result(
            user_id=current["user_id"],
            type="Chat",
            concern=concern_meta["concern_level"],
            confidence=confidence_norm,
            summary=chat_response(
                None, message, payload.transcript,
                pred, confidence_norm, concern_meta, recommendations,
                payload.audio_summary, payload.facial_emotion, ai_response,
            )["summary"],
            structured_data=json.dumps({
                "type": "Chat",
                "message": message,
                "transcript": [
                    {"role": item.role, "content": item.content}
                    for item in payload.transcript
                    if item.content and item.content.strip()
                ],
                "emotion": pred["emotion"],
                "concern_level": concern_meta["concern_level"],
                "confidence": confidence_norm,
                "wellness_status": concern_meta["wellness_status"],
            }),
        )
        db.add(row)
        db.commit()
        db.refresh(row)

        return chat_response(
            row.id,
            message,
            payload.transcript,
            pred,
            confidence_norm,
            concern_meta,
            recommendations,
            payload.audio_summary,
            payload.facial_emotion,
            ai_response,
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat analysis failed: {str(e)}"
        )


# ==================================================
# TRUE MULTI-MODAL CHAT ANALYSIS
# ==================================================
@router.post("/analyze-chat-multimodal")
def analyze_chat_multimodal(
    message: str = Form(...),
    transcript_json: str = Form("[]"),
    audio: UploadFile | None = File(None),
    face_image: UploadFile | None = File(None),
    session_emotions_json: str = Form("[]"),
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    True multi-modal chat endpoint.
    Runs predict_text, predict_audio, predict_face independently
    and fuses results with weighted confidence (40/30/30).
    """
    message = message.strip()
    if len(message) < 3:
        raise HTTPException(status_code=400, detail="Message is too short")

    audio_path = None
    converted_audio_path = None
    face_path = None

    try:
        # Parse transcript
        import json as _json
        try:
            transcript_raw = _json.loads(transcript_json)
        except Exception:
            transcript_raw = []

        # Parse session emotions for trend tracking
        try:
            session_emotions = _json.loads(session_emotions_json)
        except Exception:
            session_emotions = []

        # ===== TEXT PREDICTION (always available) =====
        # Build context from transcript for richer analysis
        user_lines = []
        for item in transcript_raw:
            if isinstance(item, dict) and item.get("role") == "user":
                content = item.get("content", "").strip()
                if content:
                    user_lines.append(f"user: {content}")

        latest_line = f"user: {message}"
        if not user_lines or user_lines[-1] != latest_line:
            user_lines.append(latest_line)

        analysis_text = "\n".join(user_lines[-12:]) or message
        text_pred = predict_text(analysis_text)
        text_probs = np.array(text_pred["probs"])

        # ===== AUDIO PREDICTION (if audio file provided) =====
        audio_pred = None
        audio_probs = None
        has_audio = False
        if audio and audio.filename:
            try:
                audio_path = save_upload_file(
                    audio,
                    [".wav", ".mp3", ".webm", ".ogg", ".m4a"]
                )
                converted_audio_path = convert_audio_to_wav(audio_path)
                audio_pred = predict_audio(str(converted_audio_path))
                audio_probs = np.array(audio_pred["probs"])
                has_audio = True
            except Exception as e:
                # Audio analysis failed, continue with text-only
                audio_pred = None
                print(f"Audio analysis skipped: {e}")

        # ===== FACE PREDICTION (if face image provided) =====
        face_pred = None
        face_probs = None
        has_face = False
        if face_image and face_image.filename:
            try:
                face_path = save_upload_file(
                    face_image,
                    [".jpg", ".jpeg", ".png", ".webp"]
                )
                face_pred = predict_face(str(face_path))
                face_probs = predict_face_probs(str(face_path))
                has_face = True
            except Exception as e:
                face_pred = None
                print(f"Face analysis skipped: {e}")

        # ===== FUSION (via consolidated helper) =====
        modalities_used = ["text"]
        if has_audio:
            modalities_used.append("audio")
        if has_face:
            modalities_used.append("face")

        final_emotion, final_confidence, is_fusion = _compute_fusion(
            text_pred, audio_pred, face_pred,
            text_probs, audio_probs, face_probs
        )
        analysis_type = "Fusion" if is_fusion else "Chat"

        confidence_norm = normalize_score(final_confidence)
        concern_meta = build_concern_meta(confidence_norm)
        recommendations = build_recommendations(final_emotion, confidence_norm)

        # Build explanation
        if is_fusion:
            explanation = build_fusion_explanation(
                final_emotion,
                confidence_norm,
                text_pred,
                audio_pred or {"emotion": "N/A", "confidence": 0},
                face_pred or {"emotion": "N/A", "confidence": 0},
            )
        else:
            explanation = build_explanation(final_emotion, confidence_norm, "Chat")

        # Build modalities response
        modalities_data = {"text": modality_result(text_pred)}
        if audio_pred:
            modalities_data["audio"] = modality_result(audio_pred)
        if face_pred:
            modalities_data["face"] = modality_result(face_pred)

        # Build weights
        weights = _compute_modality_weights(has_audio, has_face)

        # ===== CONTEXTUAL AI RESPONSE GENERATION =====
        ai_response = _generate_contextual_response(
            final_emotion, concern_meta, confidence_norm,
            recommendations, session_emotions, message
        )

        # Build structured data for persistence
        structured_data = {
            "type": "Chat",
            "message": message,
            "transcript": transcript_raw,
            "audio_used": has_audio,
            "face_used": has_face,
            "emotion": final_emotion,
            "concern_level": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "wellness_status": concern_meta["wellness_status"],
            "modalities_used": modalities_used,
            "turn_count": len([
                item for item in transcript_raw
                if isinstance(item, dict) and item.get("role") == "user"
            ]),
        }

        readable_summary = (
            f"Chat Session | {structured_data['turn_count']} user message"
            f"{'s' if structured_data['turn_count'] != 1 else ''} | "
            f"Latest: {message[:140]}"
        )

        return {
            "type": analysis_type,
            "emotion": final_emotion,
            "concern": concern_meta["concern_level"],
            "concern_level": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "severity_color": concern_meta["severity_color"],
            "wellness_status": concern_meta["wellness_status"],
            "summary": readable_summary,
            "structured_data": structured_data,
            "final": {
                "emotion": final_emotion,
                "confidence": confidence_norm,
            },
            "modalities": modalities_data,
            "weights": weights,
            "explanation": explanation,
            "recommendations": recommendations,
            "risk_level": recommendations["risk_level"],
            "ai_response": ai_response,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Multi-modal chat analysis failed: {str(e)}"
        )
    finally:
        for path in [audio_path, converted_audio_path, face_path]:
            if path:
                try:
                    os.remove(path)
                except OSError:
                    pass


def _generate_contextual_response(
    emotion: str,
    concern_meta: dict,
    confidence: float,
    recommendations: dict,
    session_emotions: list,
    user_message: str,
) -> str:
    """
    Generate a dynamic, contextual, human-like AI response
    based on current analysis and emotional progression.
    """
    concern = concern_meta["concern_level"]
    wellness = concern_meta["wellness_status"]
    risk = recommendations["risk_level"]

    # Detect emotional progression
    progression_note = ""
    if session_emotions and len(session_emotions) >= 2:
        prev = session_emotions[-1]
        prev_concern = prev.get("concern_level", "Neutral")
        severity_order = CLASS_NAMES
        prev_idx = severity_order.index(prev_concern) if prev_concern in severity_order else 2
        curr_idx = severity_order.index(concern) if concern in severity_order else 2

        if curr_idx > prev_idx:
            progression_note = (
                "I notice your emotional signals have shifted toward greater intensity compared to earlier in our conversation. "
                "This is worth paying attention to — it may indicate building pressure. "
            )
        elif curr_idx < prev_idx:
            progression_note = (
                "Your signals appear to be easing compared to earlier in our session, which is a positive shift. "
                "Keep doing what you're doing. "
            )

    # Emotion-specific contextual responses
    response_templates = {
        "Positive": [
            f"Your message reflects a constructive and resilient emotional tone. Your confidence signal is at {confidence:.0f}%, which suggests genuine engagement and positive outlook.",
            f"I can sense a positive and grounded state in your words. Your behavioral signals confirm this with {confidence:.0f}% confidence.",
            f"The emotional signals from your message indicate a healthy, balanced state. This is encouraging — your confidence reads at {confidence:.0f}%.",
        ],
        "Neutral": [
            f"Your message carries a balanced emotional tone without strong positive or negative markers. The analysis confidence is at {confidence:.0f}%.",
            f"Your behavioral signals suggest a relatively stable emotional state right now. Confidence is at {confidence:.0f}%.",
        ],
        "Stress": [
            f"Your message shows patterns consistent with stress and cognitive load. At {confidence:.0f}% confidence, the analysis suggests you may be under pressure. Breaking tasks into smaller steps and taking structured breaks can help reduce this feeling.",
            f"I'm picking up on stress indicators in your message — the kind that comes from sustained demand. Confidence is {confidence:.0f}%. A short pause followed by one clear next action may make things feel more manageable.",
        ],
        "Anxiety": [
            f"Your message contains markers that suggest anxiety and heightened alertness. The analysis confidence is {confidence:.0f}%. Grounding techniques — like naming things you can see around you — can help bring your focus back to the present moment.",
            f"I notice patterns in your words that are consistent with anxiety and uncertainty. At {confidence:.0f}% confidence, this is a meaningful signal. Try separating the things you can control from those you cannot.",
        ],
        "Negative": [
            f"Your message reflects emotional patterns that lean toward a more difficult state. At {confidence:.0f}% confidence, this warrants attention. Connecting with someone trusted and avoiding extended isolation may help.",
            f"The behavioral signals in your words suggest you're in a challenging emotional space right now. Confidence is at {confidence:.0f}%. Remember that reaching out is a sign of strength, not weakness.",
        ],
        "Depression": [
            f"Your message contains signals that indicate significant emotional weight. The confidence level is {confidence:.0f}%, which means this reading is meaningful. I want to encourage you to prioritize rest, connection, and professional support if this feeling persists.",
            f"I'm sensing deep emotional strain in your message. At {confidence:.0f}% confidence, this is an important signal. Please know that you don't have to navigate this alone — consider reaching out to a qualified professional.",
        ],
    }

    templates = response_templates.get(emotion, response_templates["Neutral"])
    base_response = random.choice(templates)

    # Add progression context
    full_response = progression_note + base_response

    # Add recommendation
    rec_items = recommendations.get("items", [])
    if rec_items:
        full_response += f"\n\nSuggested next step: {rec_items[0]}"

    # Add wellness status footer
    full_response += f"\n\nWellness status: {wellness} | Risk assessment: {risk}"

    return full_response


@router.post("/finalize-chat")
def finalize_chat(
    latest_message: str = Form(...),
    transcript_json: str = Form("[]"),
    audio_summary: str | None = Form(None),
    facial_emotion: str | None = Form(None),
    audio: UploadFile | None = File(None),
    face_image: UploadFile | None = File(None),
    current=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current["user_id"]
    message = latest_message.strip()

    if len(message) < 3:
        raise HTTPException(status_code=400, detail="Latest message is too short")

    audio_path = None
    converted_audio_path = None
    face_path = None

    try:
        import json as _json
        try:
            transcript_raw = _json.loads(transcript_json)
        except Exception:
            transcript_raw = []

        # ===== TEXT PREDICTION =====
        user_lines = []
        for item in transcript_raw:
            if isinstance(item, dict) and item.get("role") == "user":
                content = item.get("content", "").strip()
                if content:
                    user_lines.append(f"user: {content}")

        latest_line = f"user: {message}"
        if not user_lines or user_lines[-1] != latest_line:
            user_lines.append(latest_line)

        analysis_text = "\n".join(user_lines[-12:]) or message

        if audio_summary:
            analysis_text += f"\nAudio signal: {audio_summary}"
        if facial_emotion:
            analysis_text += f"\nFace signal: {facial_emotion}"

        text_pred = predict_text(analysis_text)
        text_probs = np.array(text_pred["probs"])

        # ===== AUDIO PREDICTION (if audio file provided) =====
        audio_pred = None
        audio_probs = None
        has_audio = False
        if audio and audio.filename:
            try:
                audio_path = save_upload_file(
                    audio,
                    [".wav", ".mp3", ".webm", ".ogg", ".m4a"]
                )
                converted_audio_path = convert_audio_to_wav(audio_path)
                audio_pred = predict_audio(str(converted_audio_path))
                audio_probs = np.array(audio_pred["probs"])
                has_audio = True
            except Exception as e:
                audio_pred = None
                print(f"Audio analysis skipped: {e}")

        # ===== FACE PREDICTION (if face image provided) =====
        face_pred = None
        face_probs = None
        has_face = False
        if face_image and face_image.filename:
            try:
                face_path = save_upload_file(
                    face_image,
                    [".jpg", ".jpeg", ".png", ".webp"]
                )
                face_pred = predict_face(str(face_path))
                face_probs = predict_face_probs(str(face_path))
                has_face = True
            except Exception as e:
                face_pred = None
                print(f"Face analysis skipped: {e}")

        # ===== FUSION (via consolidated helper) =====
        modalities_used = ["text"]
        if has_audio:
            modalities_used.append("audio")
        if has_face:
            modalities_used.append("face")

        final_emotion, final_confidence, is_fusion = _compute_fusion(
            text_pred, audio_pred, face_pred,
            text_probs, audio_probs, face_probs
        )
        analysis_type = "Fusion" if is_fusion else "Chat"

        confidence_norm = normalize_score(final_confidence)
        concern_meta = build_concern_meta(confidence_norm)
        recommendations = build_recommendations(final_emotion, confidence_norm)

        # Build explanation
        if is_fusion:
            explanation = build_fusion_explanation(
                final_emotion,
                confidence_norm,
                text_pred,
                audio_pred or {"emotion": "N/A", "confidence": 0},
                face_pred or {"emotion": "N/A", "confidence": 0},
            )
        else:
            explanation = build_explanation(final_emotion, confidence_norm, "Chat")

        # Build modalities response
        modalities_data = {"text": modality_result(text_pred)}
        if audio_pred:
            modalities_data["audio"] = modality_result(audio_pred)
        if face_pred:
            modalities_data["face"] = modality_result(face_pred)

        # Build weights
        weights = _compute_modality_weights(has_audio, has_face)

        # Build structured data
        structured_data = {
            "type": "Chat",
            "message": message,
            "transcript": transcript_raw,
            "audio_used": has_audio,
            "face_used": has_face,
            "audio_summary": audio_summary,
            "facial_emotion": facial_emotion,
            "emotion": final_emotion,
            "concern_level": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "wellness_status": concern_meta["wellness_status"],
            "modalities_used": modalities_used,
            "turn_count": len([
                item for item in transcript_raw
                if isinstance(item, dict) and item.get("role") == "user"
            ]),
        }

        readable_summary = (
            f"Chat Session | {structured_data['turn_count']} user message"
            f"{'s' if structured_data['turn_count'] != 1 else ''} | "
            f"Latest: {message[:140]}"
        )

        row = Result(
            user_id=user_id,
            type=analysis_type,
            concern=concern_meta["concern_level"],
            confidence=confidence_norm,
            summary=readable_summary,
            structured_data=_json.dumps(structured_data),
        )

        db.add(row)
        db.commit()
        db.refresh(row)

        # Generate contextual AI response for finalized report
        ai_response = _generate_contextual_response(
            final_emotion, concern_meta, confidence_norm,
            recommendations, [], message
        )

        return {
            "id": row.id,
            "type": analysis_type,
            "emotion": final_emotion,
            "concern": concern_meta["concern_level"],
            "concern_level": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "severity_color": concern_meta["severity_color"],
            "wellness_status": concern_meta["wellness_status"],
            "summary": readable_summary,
            "structured_data": structured_data,
            "final": {
                "emotion": final_emotion,
                "confidence": confidence_norm,
            },
            "modalities": modalities_data,
            "weights": weights,
            "explanation": explanation,
            "recommendations": recommendations,
            "risk_level": recommendations["risk_level"],
            "ai_response": ai_response,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat finalization failed: {str(e)}"
        )
    finally:
        for path in [audio_path, converted_audio_path, face_path]:
            if path:
                try:
                    os.remove(path)
                except OSError:
                    pass


# ==================================================
# AUDIO ANALYSIS
# ==================================================

@router.post("/analyze-audio")
def analyze_audio(
    audio: UploadFile = File(...),
    persist: bool = True,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    input_path = None
    output_path = None

    try:
        if not audio.filename:
            raise HTTPException(
                status_code=400,
                detail="Audio file required"
            )

        input_path = save_upload_file(
            audio,
            [".wav", ".mp3", ".webm", ".ogg", ".m4a"]
        )
        output_path = convert_audio_to_wav(input_path)
        pred = predict_audio(str(output_path))

        confidence_norm = normalize_score(float(pred.get("confidence", 0.0)))
        concern_meta = build_concern_meta(confidence_norm)
        recommendations = build_recommendations(pred.get("emotion", "Neutral"), confidence_norm)

        row_id = None
        summary = f"Audio: {audio.filename}"

        structured_data = {
            "type": "Audio",
            "filename": audio.filename,
            "emotion": pred.get("emotion", "Neutral"),
            "concern_level": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "wellness_status": concern_meta["wellness_status"],
        }

        if persist:
            row = Result(
                user_id=user_id,
                type="Audio",
                concern=concern_meta["concern_level"],
                confidence=confidence_norm,
                summary=summary,
                structured_data=json.dumps(structured_data),
            )

            db.add(row)
            db.commit()
            db.refresh(row)
            row_id = row.id

        return {
            "id": row_id,
            "type": "Audio",
            "emotion": pred.get("emotion", "Neutral"),
            "concern": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "concern_level": concern_meta["concern_level"],
            "severity_color": concern_meta["severity_color"],
            "wellness_status": concern_meta["wellness_status"],
            "summary": summary,
            "final": modality_result(pred),
            "modalities": {"audio": modality_result(pred)},
            "explanation": build_explanation(
                pred.get("emotion", "Neutral"), confidence_norm, "Audio",
                ["Vocal tone, rhythm, and MFCC-derived acoustic features contributed to this estimate."]
            ),
            "recommendations": recommendations,
            "risk_level": recommendations["risk_level"]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        for path in [input_path, output_path]:
            if path:
                try:
                    os.remove(path)
                except OSError:
                    pass
    
# ==================================================
# FACE ANALYSIS
# ==================================================
@router.post("/analyze-face")
def analyze_face(
    image: UploadFile = File(...),
    persist: bool = True,
    current=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current["user_id"]
    file_path = None
    try:
        if not image.filename:
            raise HTTPException(
                status_code=400,
                detail="Image file required"
            )

        allowed = [".jpg", ".jpeg", ".png", ".webp"]
        ext = Path(image.filename).suffix.lower()

        if ext not in allowed:
            raise HTTPException(
                status_code=400,
                detail="Only jpg, jpeg, png, webp allowed"
            )

        file_path = save_upload_file(
            image,
            [".jpg", ".jpeg", ".png", ".webp"]
        )
        pred = predict_face(str(file_path))

        confidence_norm = normalize_score(float(pred.get("confidence", 0.0)))
        concern_meta = build_concern_meta(confidence_norm)
        recommendations = build_recommendations(pred.get("emotion", "Neutral"), confidence_norm)

        row_id = None
        summary = f"Face: {image.filename}"

        structured_data = {
            "type": "Face",
            "image": image.filename,
            "emotion": pred.get("emotion", "Neutral"),
            "concern_level": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "wellness_status": concern_meta["wellness_status"],
        }

        if persist:
            row = Result(
                user_id=user_id,
                type="Face",
                concern=concern_meta["concern_level"],
                confidence=confidence_norm,
                summary=summary,
                structured_data=json.dumps(structured_data),
            )

            db.add(row)
            db.commit()
            db.refresh(row)
            row_id = row.id

        return {
            "id": row_id,
            "type": "Face",
            "emotion": pred.get("emotion", "Neutral"),
            "concern": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "concern_level": concern_meta["concern_level"],
            "severity_color": concern_meta["severity_color"],
            "wellness_status": concern_meta["wellness_status"],
            "summary": summary,
            "final": modality_result(pred),
            "modalities": {"face": modality_result(pred)},
            "explanation": build_explanation(
                pred.get("emotion", "Neutral"), confidence_norm, "Face",
                ["Facial expression features and image classification confidence contributed to this estimate."]
            ),
            "recommendations": recommendations,
            "risk_level": recommendations["risk_level"]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Face analysis failed: {str(e)}"
        )

    finally:
        if file_path:
            try:
                os.remove(file_path)
            except OSError:
                pass

# ==================================================
# FUSION ANALYSIS
# ==================================================
@router.post("/analyze-fusion")
def analyze_fusion(
    text: str = Form(...),
    audio: UploadFile = File(...),
    face: UploadFile = File(...),
    current=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current["user_id"]
    audio_path = None
    converted_audio_path = None
    face_path = None

    try:
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text required")

        if not audio.filename:
            raise HTTPException(status_code=400, detail="Audio file required")

        if not face.filename:
            raise HTTPException(status_code=400, detail="Face image required")

        audio_path = save_upload_file(
            audio,
            [".wav", ".mp3", ".webm", ".ogg", ".m4a"]
        )
        face_path = save_upload_file(
            face,
            [".jpg", ".jpeg", ".png", ".webp"]
        )

        converted_audio_path = convert_audio_to_wav(audio_path)

        text_pred = predict_text(text)
        audio_pred = predict_audio(str(converted_audio_path))
        face_pred = predict_face(str(face_path))

        tp = np.array(text_pred["probs"])
        ap = np.array(audio_pred["probs"])
        fp = predict_face_probs(str(face_path))
        pred = predict_fusion(tp, ap, fp)

        confidence_norm = normalize_score(float(pred["confidence"]))
        concern_meta = build_concern_meta(confidence_norm)
        recommendations = build_recommendations(pred["emotion"], confidence_norm)
        explanation = build_fusion_explanation(
            pred["emotion"], confidence_norm, text_pred, audio_pred, face_pred,
        )

        # Build structured data for persistent storage
        structured_data = {
            "type": "Fusion",
            "text": text,
            "modalities_used": ["text", "audio", "face"],
            "fusion_weights": {"text": 0.4, "audio": 0.3, "face": 0.3},
            "text_result": {
                "emotion": text_pred.get("emotion", "Unknown"),
                "confidence": float(text_pred.get("confidence", 0)),
            },
            "audio_result": {
                "emotion": audio_pred.get("emotion", "Unknown"),
                "confidence": float(audio_pred.get("confidence", 0)),
            },
            "face_result": {
                "emotion": face_pred.get("emotion", "Unknown"),
                "confidence": float(face_pred.get("confidence", 0)),
            },
            "fusion_method": "trained_model" if pred.get("emotion") else "weighted_average",
            "emotion": pred["emotion"],
            "concern_level": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "wellness_status": concern_meta["wellness_status"],
        }

        # Generate contextual AI response
        ai_response = _generate_contextual_response(
            pred["emotion"], concern_meta, confidence_norm,
            recommendations, [], text
        )

        row = Result(
            user_id=user_id,
            type="Fusion",
            concern=concern_meta["concern_level"],
            confidence=confidence_norm,
            summary=f"Fusion Analysis | Text: {text[:140]}",
            structured_data=json.dumps(structured_data),
        )

        db.add(row)
        db.commit()
        db.refresh(row)

        return {
            "id": row.id,
            "type": "Fusion",
            "emotion": pred["emotion"],
            "concern": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "concern_level": concern_meta["concern_level"],
            "severity_color": concern_meta["severity_color"],
            "wellness_status": concern_meta["wellness_status"],
            "summary": row.summary,
            "structured_data": structured_data,
            "final": {
                "emotion": pred["emotion"],
                "confidence": confidence_norm,
                "probabilities": pred.get("probs", []),
            },
            "modalities": {
                "text": modality_result(text_pred),
                "audio": modality_result(audio_pred),
                "face": modality_result(face_pred),
            },
            "weights": {"text": 0.4, "audio": 0.3, "face": 0.3},
            "explanation": explanation,
            "recommendations": recommendations,
            "risk_level": recommendations["risk_level"],
            "ai_response": ai_response,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fusion analysis failed: {str(e)}"
        )

    finally:
        for path in [audio_path, converted_audio_path, face_path]:
            if path:
                try:
                    os.remove(path)
                except OSError:
                    pass


# ==================================================
# QUESTIONNAIRE ANALYSIS
# ==================================================

# Severity scoring: map each answer option value to a numeric score (0-3)
# 0 = positive/healthy, 1 = mild, 2 = moderate, 3 = concerning
# Scoring: map each answer option value to a numeric score (0-3)
# 0 = positive/healthy, 1 = mild, 2 = moderate, 3 = concerning
# Keys match the option values defined in frontend/src/pages/Questionnaire.tsx
_OPTION_SCORES: dict[str, int] = {
    # morning
    "up": 0, "snooze": 1, "scroll": 2, "dread": 3,
    # weekend
    "social": 0, "create": 0, "rest": 1, "blank": 2,
    # music
    "upbeat": 0, "focus": 1, "melancholy": 2, "silence": 3,
    # messages
    "busy": 0, "check": 1, "worry": 2, "withdraw": 3,
    # mirror
    "fine": 0, "neutral": 1, "tired": 2, "critical": 3,
    # meals
    "regular": 0, "rushed": 1, "skipped": 2, "appetite": 3,
    # task
    "flow": 0, "warmup": 0, "distract": 2, "stuck": 3,
    # stranger
    "smile": 0, "polite": 0, "avoid": 2, "suspicious": 3,
    # future (uses "neutral" which is same as mirror's → both score 1)
    "excited": 0, "anxious": 2, "heavy": 3,
    # compliment
    "accept": 0, "deflect": 1, "doubt": 2, "uncomfortable": 2,
    # night
    "quiet": 0, "planning": 0, "replaying": 1, "racing": 3,
    # hobby
    "still": 0, "less": 1, "rare": 2, "flat": 3,
    # criticism
    "curious": 0, "defend": 1, "spiral": 2, "deflate": 3,
    # body
    "none": 0, "shoulders": 1, "chest": 2, "stomach": 2,
    # phone
    "calm": 0, "tense": 2,
}


def _calculate_questionnaire_score(answers: dict) -> dict:
    """Calculate overall wellness score from MCQ answers (0-100 scale)."""
    if not answers:
        return {"total_score": 0, "max_score": 0, "normalized_score": 50, "item_count": 0}

    total = 0
    max_possible = 0
    count = 0

    for qid, answer in answers.items():
        score = _OPTION_SCORES.get(answer.value, 1)
        total += score
        max_possible += 3
        count += 1

    # Invert so higher = better (0-100)
    normalized = round((1 - (total / max_possible)) * 100) if max_possible > 0 else 50
    return {
        "total_score": total,
        "max_score": max_possible,
        "normalized_score": max(0, min(100, normalized)),
        "item_count": count,
    }


# ==================================================
# STREAMING CHAT ENDPOINT
# ==================================================
@router.post("/chat/stream")
async def chat_stream(
    message: str = Form(...),
    transcript_json: str = Form("[]"),
    session_emotions_json: str = Form("[]"),
    current=Depends(get_current_user),
):
    """
    Streaming chat endpoint that returns the AI response as SSE chunks.
    Each chunk is a word or small phrase, streamed progressively.
    """
    import json as _json

    try:
        transcript_raw = _json.loads(transcript_json)
    except Exception:
        transcript_raw = []

    try:
        session_emotions = _json.loads(session_emotions_json)
    except Exception:
        session_emotions = []

    message = message.strip()
    if len(message) < 3:
        # Return error as SSE
        async def error_stream():
            yield f"data: {_json.dumps({'error': 'Message is too short'})}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(error_stream(), media_type="text/event-stream")

    # Build context from transcript
    user_lines = []
    for item in transcript_raw:
        if isinstance(item, dict) and item.get("role") == "user":
            content = item.get("content", "").strip()
            if content:
                user_lines.append(f"user: {content}")

    latest_line = f"user: {message}"
    if not user_lines or user_lines[-1] != latest_line:
        user_lines.append(latest_line)

    analysis_text = "\n".join(user_lines[-12:]) or message
    text_pred = predict_text(analysis_text)
    confidence_norm = normalize_score(float(text_pred["confidence"]))
    concern_meta = build_concern_meta(confidence_norm)
    recommendations = build_recommendations(text_pred["emotion"], confidence_norm)

    # Generate full response
    full_response = _generate_contextual_response(
        text_pred["emotion"], concern_meta, confidence_norm,
        recommendations, session_emotions, message
    )

    async def generate():
        # Send analysis metadata first
        meta = {
            "type": "stream_start",
            "emotion": text_pred["emotion"],
            "concern": concern_meta["concern_level"],
            "confidence": confidence_norm,
        }
        yield f"data: {_json.dumps(meta)}\n\n"

        # Stream the response word by word with realistic timing
        words = full_response.split()
        buffer = ""
        for i, word in enumerate(words):
            buffer += word + " "
            # Send chunks progressively (every few words for natural flow)
            if (i + 1) % 3 == 0 or i == len(words) - 1:
                chunk = {
                    "type": "stream_chunk",
                    "content": buffer.strip(),
                    "done": False,
                }
                yield f"data: {_json.dumps(chunk)}\n\n"
                buffer = ""
                # Small delay to simulate real-time generation
                await asyncio.sleep(0.04 + (random.random() * 0.06))

        # Send emotion analysis data at end
        analysis_data = {
            "type": "stream_complete",
            "emotion": text_pred["emotion"],
            "concern_level": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "wellness_status": concern_meta["wellness_status"],
            "risk_level": recommendations["risk_level"],
            "explanation": build_explanation(text_pred["emotion"], confidence_norm, "Chat"),
            "recommendations": recommendations,
        }
        yield f"data: {_json.dumps(analysis_data)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


# ==================================================
# QUESTIONNAIRE ANALYSIS
# ==================================================

@router.post("/analyze-questionnaire")
def analyze_questionnaire(
    payload: QuestionnaireSubmission,
    current=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current["user_id"]

    try:
        # Build analysis text from structured answers
        summary_lines = []
        for question_id, answer in payload.answers.items():
            summary_lines.append(f"{question_id}: {answer.label}")

        summary_lines.append(f"Free text: {payload.free_text}")

        if payload.facial_emotion:
            summary_lines.append(f"Observed facial emotion: {payload.facial_emotion}")

        text_for_analysis = "\n".join(summary_lines)

        # Run text prediction on the combined summary
        pred = predict_text(text_for_analysis)

        confidence_norm = normalize_score(float(pred["confidence"]))
        concern_meta = build_concern_meta(confidence_norm)
        recommendations = build_recommendations(pred["emotion"], confidence_norm)

        # Calculate wellness score from MCQ answers
        score_data = _calculate_questionnaire_score(payload.answers)

        # Determine completion percentage
        # We expect 15 MCQ questions total in the frontend
        expected_mcq_count = 15
        completion_pct = min(100, round((score_data["item_count"] / expected_mcq_count) * 100))

        # Build the structured data payload to store as JSON
        structured_data = {
            "type": "Questionnaire",
            "answers": {k: {"value": v.value, "label": v.label} for k, v in payload.answers.items()},
            "free_text": payload.free_text,
            "facial_emotion": payload.facial_emotion,
            "emotion": pred["emotion"],
            "concern_level": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "wellness_status": concern_meta["wellness_status"],
            "score": score_data["normalized_score"],
            "completion_pct": completion_pct,
            "total_answers": score_data["item_count"],
        }

        # Build a concise readable summary for Dashboard/History
        readable_summary = f"Questionnaire Assessment | {score_data['item_count']} responses | "
        readable_summary += f"Score: {score_data['normalized_score']}/100 | "
        readable_summary += f"Primary concern: {concern_meta['concern_level']} | "
        readable_summary += f"Confidence: {confidence_norm:.1f}%"
        if payload.facial_emotion:
            readable_summary += f" | Facial: {payload.facial_emotion}"

        row = Result(
            user_id=user_id,
            type="Questionnaire",
            concern=concern_meta["concern_level"],
            confidence=confidence_norm,
            summary=readable_summary,
            structured_data=json.dumps(structured_data),
        )

        db.add(row)
        db.commit()
        db.refresh(row)

        return {
            "id": row.id,
            "type": "Questionnaire",
            "emotion": pred["emotion"],
            "concern": concern_meta["concern_level"],
            "concern_level": concern_meta["concern_level"],
            "confidence": confidence_norm,
            "severity_color": concern_meta["severity_color"],
            "wellness_status": concern_meta["wellness_status"],
            "summary": readable_summary,
            "structured_data": structured_data,
            "final": modality_result(pred),
            "modalities": {"text": modality_result(pred)},
            "explanation": build_explanation(pred["emotion"], confidence_norm, "Questionnaire"),
            "recommendations": recommendations,
            "risk_level": recommendations["risk_level"],
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Questionnaire analysis failed: {str(e)}"
        )
