from pathlib import Path
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

BASE_DIR = Path(__file__).resolve().parents[3]
MODEL_PATH = BASE_DIR / "models" / "face_final_6.h5"

model = None
load_error = None

try:
    model = load_model(str(MODEL_PATH))
except Exception as e:
    load_error = str(e)

# 6-class output matching the trained model
# Order MUST match model output layer indices
CLASS_NAMES_6 = [
    "Positive",    # index 0
    "Neutral",     # index 1
    "Stress",      # index 2
    "Anxiety",     # index 3
    "Negative",    # index 4
    "Depression",  # index 5
]

# The saved model may output in a different order; this mapping
# re-aligns the 7-output model's indices to our 6-class canonical order.
_MODEL7_TO_CLASS6 = {
    0: 1,  # Neutral
    1: 3,  # Anxiety
    2: 4,  # Negative
    3: 0,  # Positive
    4: 5,  # Depression
    5: 2,  # Stress
    6: 1,  # Neutral (duplicate)
}

# For predict_face's single-label output — aligned to CLASS_NAMES_6
class_names = CLASS_NAMES_6


def predict_face(img_path: str):
    if model is None:
        raise RuntimeError(
            f"Face model unavailable: {load_error}"
        )

    img = image.load_img(
        img_path,
        target_size=(224, 224)
    )

    img = image.img_to_array(img) / 255.0
    img = np.expand_dims(img, axis=0)

    pred = model.predict(
        img,
        verbose=0
    )[0]

    idx = int(np.argmax(pred))
    conf = float(pred[idx])

    label = (
        class_names[idx]
        if idx < len(class_names)
        else "Neutral"
    )

    return {
        "emotion": label,
        "confidence": round(conf, 4),
        "probs": pred.tolist(),
        "file": img_path,
        "pred_index": idx,
        "num_outputs": len(pred)
    }


def predict_face_probs(img_path: str):
    result = predict_face(img_path)
    pred = result["probs"]

    probs6 = np.zeros(6)

    for i, p in enumerate(pred):
        target = _MODEL7_TO_CLASS6.get(i, 1)
        if 0 <= target < 6:
            probs6[target] += p

    return probs6