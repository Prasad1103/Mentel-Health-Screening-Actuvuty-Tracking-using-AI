import warnings

# Suppress PyTorch pytree registration conflicts with transformers ModelOutput.
# This is a harmless compatibility issue between torch 2.11+ and transformers 5.x.
# The text model functions correctly despite this registration conflict.
warnings.filterwarnings(
    "ignore",
    message=".*already registered as pytree node.*",
)

from transformers import pipeline
from pathlib import Path
import numpy as np

BASE_DIR = Path(__file__).resolve().parents[3]
MODEL_DIR = BASE_DIR / "models" / "text_final_6"

class_names = {
    0: "Positive",
    1: "Neutral",
    2: "Stress",
    3: "Anxiety",
    4: "Negative",
    5: "Depression"
}

clf = None
load_error = None

try:
    clf = pipeline(
        "text-classification",
        model=str(MODEL_DIR),
        tokenizer=str(MODEL_DIR),
        top_k=None
    )
except Exception as e:
    err_str = str(e)
    # Retry once if pytree registration conflict (transient on first load)
    if "already registered as pytree node" in err_str:
        try:
            clf = pipeline(
                "text-classification",
                model=str(MODEL_DIR),
                tokenizer=str(MODEL_DIR),
                top_k=None
            )
        except Exception as e2:
            load_error = str(e2)
    else:
        load_error = err_str


def predict_text(text: str):
    if clf is None:
        raise RuntimeError(
            f"Text model unavailable: {load_error}"
        )

    result = clf(text)[0]

    probs = [0.0] * 6

    for item in result:
        idx = int(
            item["label"].replace(
                "LABEL_",
                ""
            )
        )

        if idx < 6:
            probs[idx] = float(
                item["score"]
            )

    best_idx = int(np.argmax(probs))

    return {
        "emotion": class_names[best_idx],
        "confidence": round(
            probs[best_idx], 4
        ),
        "probs": probs,
        "text": text
    }


def predict_text_probs(text: str):
    return np.array(
        predict_text(text)["probs"]
    )