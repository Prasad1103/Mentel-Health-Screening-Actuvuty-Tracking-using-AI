from app.services.concern_level import get_concern_level, normalize_score


def risk_level(emotion: str, confidence: float) -> str:
    """
    Map a concern level + confidence to a clinical risk label.
    The risk label is derived from the NEW concern-level scale.
    """
    normalized = normalize_score(confidence)
    concern = get_concern_level(normalized)

    if concern == "Depression":
        return "High Attention"
    if concern == "Negative":
        return "Elevated Concern"
    if concern == "Anxiety":
        return "Watch"
    if concern == "Stress":
        return "Moderate"
    return "Stable"


def build_recommendations(emotion: str, confidence: float) -> dict:
    """
    Return wellness copy and risk label for the given emotion/confidence pair.
    'emotion' is the model's raw label; the risk level is recomputed from confidence.
    """
    copy: dict[str, list[str]] = {
        "Positive": [
            "Maintain the routine that is supporting your current momentum.",
            "Keep sleep, movement, and social connection steady.",
        ],
        "Neutral": [
            "Use a light check-in today with hydration, short pauses, and a simple plan.",
            "Continue monitoring emotional patterns over time.",
        ],
        "Stress": [
            "Try five minutes of paced breathing before the next demanding task.",
            "Reduce context switching and schedule a short recovery break.",
        ],
        "Anxiety": [
            "Use grounding: name five things you can see and one next action you can control.",
            "Write down the uncertainty and separate facts from assumptions.",
        ],
        "Negative": [
            "Take a restorative break and avoid extended isolation if possible.",
            "Speak with someone trusted if the pattern continues.",
        ],
        "Depression": [
            "Prioritize support, routine, hydration, and rest today.",
            "Consider contacting a qualified professional if this state persists.",
        ],
    }

    # Use the concern level derived from the confidence score as the primary label
    normalized = normalize_score(confidence)
    concern = get_concern_level(normalized)

    return {
        "risk_level": risk_level(emotion, confidence),
        "items": copy.get(concern, copy["Neutral"]),
    }
