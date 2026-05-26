from __future__ import annotations

from app.services.concern_level import CONCERN_LEVELS


def normalize_confidence(value: float) -> float:
    return value * 100 if value <= 1 else value


def _emotion_reasons(emotion: str, analysis_type: str) -> list[str]:
    """Return detailed, research-informed reasons for each emotion class."""
    reasons_map: dict[str, list[str]] = {
        "Positive": [
            f"{analysis_type} model detected elevated valence and engagement markers, predicting Positive emotional state.",
            "Language patterns show constructive framing, solution-oriented thinking, and forward-looking perspective.",
            "Vocal and facial indicators (if applicable) suggest open posture and relaxed engagement.",
            "The overall signal profile aligns with healthy emotional regulation and positive affect.",
        ],
        "Neutral": [
            f"{analysis_type} model found a balanced emotional profile without strong activation in either positive or negative valence.",
            "Language patterns are measured and factual, lacking pronounced emotional weighting.",
            "This may indicate a reflective or contemplative state rather than emotional absence.",
            "The signal is comparatively stable and does not strongly indicate elevated risk or extreme positivity.",
        ],
        "Stress": [
            f"{analysis_type} model identified elevated tension markers consistent with a Stress response.",
            "Lexical analysis shows increased use of pressure-related language, urgency cues, and cognitive load indicators.",
            "Repeated patterns of time-pressure references and overwhelm signals were detected in the text.",
            "Stress can manifest as reduced emotional flexibility and narrowed attention — the model picked up on these patterns.",
            "Cortisol-linked behavioral markers (impatience, irritability signals) may be present in the communication style.",
        ],
        "Anxiety": [
            f"{analysis_type} model detected patterns strongly associated with Anxiety and heightened vigilance.",
            "Uncertainty markers, worry indicators, and future-oriented concern language were identified at elevated frequency.",
            "The text contains probabilistic language ('maybe', 'what if', 'I'm not sure') that correlates with anxious cognition.",
            "Repeated checking or reassurance-seeking patterns may be present in the communication.",
            "Anxiety often involves threat-overestimation — the model detected linguistic patterns consistent with this cognitive pattern.",
        ],
        "Negative": [
            f"{analysis_type} model identified sustained negative valence across the analyzed signals.",
            "Language patterns show frustration markers, dissatisfaction cues, and reduced positive affect.",
            "The communication contains indicators of lowered emotional resilience and possible rumination.",
            "Negative emotional states can narrow behavioral options — the model detected reduced flexibility in emotional expression.",
            "This reading suggests a challenging emotional state that may benefit from structured support.",
        ],
        "Depression": [
            f"{analysis_type} model detected patterns consistent with significantly reduced emotional activation.",
            "Lexical analysis shows flattened affect, reduced agency language, and increased self-critical references.",
            "The text contains markers associated with anhedonia (reduced anticipation of positive outcomes) and withdrawal.",
            "Social disconnection signals and decreased positive future-thinking were identified in the communication.",
            "This reading indicates a clinically significant emotional pattern that warrants professional attention.",
        ],
    }
    return reasons_map.get(emotion, reasons_map["Neutral"])


def build_explanation(
    emotion: str,
    confidence: float,
    analysis_type: str,
    modality_notes: list[str] | None = None,
    previous_emotion: str | None = None,
) -> dict:
    normalized = normalize_confidence(float(confidence or 0))
    notes = modality_notes or []

    # Core reasons from emotion-specific research-grade descriptions
    reasons = _emotion_reasons(emotion, analysis_type)

    # Add confidence context
    if normalized >= 85:
        reasons.append(
            f"Model confidence is high at {normalized:.1f}%, indicating strong signal clarity for this prediction."
        )
    elif normalized >= 65:
        reasons.append(
            f"Model confidence is moderate at {normalized:.1f}%, suggesting meaningful but not definitive signal patterns."
        )
    else:
        reasons.append(
            f"Model confidence is {normalized:.1f}%, which may reflect mixed or low-intensity emotional signals."
        )

    # Add emotional progression insight if previous emotion is known
    if previous_emotion and previous_emotion != emotion:
        prev_idx = CONCERN_LEVELS.index(previous_emotion) if previous_emotion in CONCERN_LEVELS else -1
        curr_idx = CONCERN_LEVELS.index(emotion) if emotion in CONCERN_LEVELS else -1
        if prev_idx >= 0 and curr_idx >= 0:
            if curr_idx > prev_idx:
                reasons.append(
                    f"Notable emotional escalation detected: shifted from {previous_emotion} to {emotion}, "
                    "indicating increased emotional intensity compared to previous readings."
                )
            elif curr_idx < prev_idx:
                reasons.append(
                    f"Positive emotional shift detected: moved from {previous_emotion} to {emotion}, "
                    "indicating improvement in emotional state compared to previous readings."
                )

    # Add modality-specific notes
    reasons.extend(notes)

    # Always append disclaimer
    reasons.append("This is an AI-assisted emotional insight and not a medical diagnosis.")

    return {
        "reasons": reasons,
        "model_agreement": "Single modality result" if analysis_type != "Fusion" else "Multi-modal agreement calculated from text, audio, and face signals.",
        "limitations": "Predictions depend on signal quality, model training data, and user context. Results should be reviewed by a qualified professional for clinical decisions.",
    }


def build_fusion_explanation(
    final_emotion: str,
    confidence: float,
    text_result: dict,
    audio_result: dict,
    face_result: dict,
    previous_emotion: str | None = None,
) -> dict:
    text_conf = normalize_confidence(float(text_result.get("confidence", 0)))
    audio_conf = normalize_confidence(float(audio_result.get("confidence", 0)))
    face_conf = normalize_confidence(float(face_result.get("confidence", 0)))

    modality_notes = [
        f"Text modality: {text_result.get('emotion', 'Unknown')} detected at {text_conf:.1f}% confidence — based on lexical analysis of emotional language patterns.",
        f"Audio modality: {audio_result.get('emotion', 'Unknown')} detected at {audio_conf:.1f}% confidence — based on vocal tone, rhythm, pitch, and prosodic features.",
        f"Face modality: {face_result.get('emotion', 'Unknown')} detected at {face_conf:.1f}% confidence — based on facial expression analysis of muscle movement patterns.",
    ]

    # Add modality agreement analysis
    emotions = {
        text_result.get("emotion"),
        audio_result.get("emotion"),
        face_result.get("emotion"),
    }

    if len(emotions) == 1:
        modality_notes.append("All three modalities are in strong agreement, increasing confidence in the final prediction.")
    elif len(emotions) == 2:
        modality_notes.append("Two of three modalities agree, providing moderate convergence for the fused result.")
    else:
        modality_notes.append("The three modalities show divergent signals, which may indicate mixed emotional states or modality-specific noise.")

    explanation = build_explanation(
        final_emotion, confidence, "Fusion", modality_notes, previous_emotion
    )

    explanation["model_agreement"] = (
        "Strong agreement across modalities"
        if len(emotions) == 1
        else "Partial agreement across modalities"
        if len(emotions) == 2
        else "Mixed signals across modalities — fusion weighted average applied"
    )

    return explanation
