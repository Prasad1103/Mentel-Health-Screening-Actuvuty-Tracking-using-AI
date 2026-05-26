from pathlib import Path
import numpy as np
from tensorflow.keras.models import load_model

BASE_DIR = Path(__file__).resolve().parents[3]
MODEL_PATH = BASE_DIR / "models" / "fusion_model.h5"

CLASS_NAMES = [
    "Positive",
    "Neutral",
    "Stress",
    "Anxiety",
    "Negative",
    "Depression",
]

fusion_model = None
load_error = None

try:
    fusion_model = load_model(str(MODEL_PATH))
except Exception as e:
    load_error = str(e)


def predict_fusion(tp, ap, fp):
    if fusion_model is None:
        raise RuntimeError(
            f"Fusion model unavailable: {load_error}"
        )

    x = np.concatenate(
        [tp, ap, fp]
    ).reshape(1, -1)

    pred = fusion_model.predict(
        x,
        verbose=0
    )[0]

    idx = int(np.argmax(pred))

    return {
        "emotion": CLASS_NAMES[idx],
        "confidence": float(np.max(pred)),
        "probs": pred.tolist(),
    }
