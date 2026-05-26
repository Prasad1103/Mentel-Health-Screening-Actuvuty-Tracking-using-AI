import numpy as np
import librosa
import joblib
from pathlib import Path
from tensorflow.keras.models import load_model

BASE_DIR = Path(__file__).resolve().parents[3]
MODEL_PATH = BASE_DIR / "models" / "speech_final_6.h5"
ENCODER_PATH = BASE_DIR / "models" / "speech_label_encoder.pkl"

model = None
encoder = None
load_error = None

try:
    model = load_model(str(MODEL_PATH))
    encoder = joblib.load(str(ENCODER_PATH))
except Exception as e:
    load_error = str(e)


def extract_features(file_path: str):
    audio, sr = librosa.load(
        file_path,
        duration=3,
        offset=0.5
    )

    mfcc = librosa.feature.mfcc(
        y=audio,
        sr=sr,
        n_mfcc=40
    )

    return np.mean(mfcc.T, axis=0)


def predict_audio(file_path: str):
    if model is None or encoder is None:
        raise RuntimeError(
            f"Audio model unavailable: {load_error}"
        )

    feat = extract_features(file_path).reshape(1, 40, 1)

    pred = model.predict(
        feat,
        verbose=0
    )[0]

    idx = int(np.argmax(pred))
    label = encoder.inverse_transform([idx])[0]
    conf = float(pred[idx])

    return {
        "emotion": label,
        "confidence": round(conf, 4),
        "probs": pred.tolist(),
        "file": file_path
    }


def predict_audio_probs(file_path: str):
    return np.array(
        predict_audio(file_path)["probs"]
    )