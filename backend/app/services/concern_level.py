"""
Centralized concern-level mapping for the Behavioral AI platform.
Every analysis endpoint MUST use these functions for consistency.
"""

# Ordered from most severe → least severe
CONCERN_LEVELS = ["Depression", "Negative", "Anxiety", "Stress", "Neutral", "Positive"]

SEVERITY_COLORS: dict[str, str] = {
    "Depression": "#7F1D1D",
    "Negative":   "#DC2626",
    "Anxiety":    "#F97316",
    "Stress":     "#FACC15",
    "Neutral":    "#3B82F6",
    "Positive":   "#10B981",
}

WELLNESS_STATUS: dict[str, str] = {
    "Depression": "Severe Emotional Concern",
    "Negative":   "High Emotional Concern",
    "Anxiety":    "Moderate-High Emotional Concern",
    "Stress":     "Moderate Emotional Strain",
    "Neutral":    "Balanced Emotional State",
    "Positive":   "Healthy Emotional State",
}


def normalize_score(value: float) -> float:
    """Ensure the confidence value is in the 0–100 range."""
    return round(value * 100, 2) if value <= 1.0 else round(float(value), 2)


def get_concern_level(score: float) -> str:
    """
    Map a normalized confidence score (0–100) to a concern level.

    | Range   | Level       |
    |---------|-------------|
    | 0–20    | Depression  |
    | 21–40   | Negative    |
    | 41–60   | Anxiety     |
    | 61–75   | Stress      |
    | 76–90   | Neutral     |
    | 91–100  | Positive    |
    """
    s = normalize_score(score)
    if s <= 20:
        return "Depression"
    elif s <= 40:
        return "Negative"
    elif s <= 60:
        return "Anxiety"
    elif s <= 75:
        return "Stress"
    elif s <= 90:
        return "Neutral"
    else:
        return "Positive"


def build_concern_meta(score: float) -> dict:
    """
    Return the full concern metadata block for an API response.
    score should be the raw model confidence (0–1 or 0–100).
    """
    normalized = normalize_score(score)
    level = get_concern_level(normalized)
    return {
        "concern_level":   level,
        "confidence":      normalized,
        "severity_color":  SEVERITY_COLORS[level],
        "wellness_status": WELLNESS_STATUS[level],
    }
