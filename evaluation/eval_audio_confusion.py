import pathlib
import warnings
warnings.filterwarnings("ignore")

import os
import numpy as np
import librosa
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    confusion_matrix, accuracy_score,
    precision_score, recall_score, f1_score,
    classification_report
)
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import to_categorical

BASE_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATA_PATH = str(PROJECT_ROOT / "data" / "audio" / "ravdess")
MODEL_PATH = str(PROJECT_ROOT / "models" / "speech_final_6.h5")
ENCODER_PATH = str(PROJECT_ROOT / "models" / "speech_label_encoder.pkl")
OUTPUT_DIR = BASE_DIR / "audio_eval_output"
OUTPUT_DIR.mkdir(exist_ok=True)

emotion_map = {
    "01": "Neutral",
    "02": "Neutral",
    "03": "Positive",
    "04": "Depression",
    "05": "Stress",
    "06": "Anxiety",
    "07": "Negative",
    "08": "Neutral"
}

def extract_features(file_path):
    audio, sr = librosa.load(file_path, duration=3, offset=0.5)
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
    mfcc = np.mean(mfcc.T, axis=0)
    return mfcc

print("Loading audio data...")
X = []
y = []

for root, dirs, files in os.walk(DATA_PATH):
    for file in files:
        if file.endswith(".wav"):
            path = os.path.join(root, file)
            parts = file.split("-")
            code = parts[2]
            label = emotion_map[code]
            feat = extract_features(path)
            X.append(feat)
            y.append(label)

X = np.array(X)
y = np.array(y)
print(f"Total samples: {len(X)}")

encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)
y_cat = to_categorical(y_encoded)

X = X.reshape(X.shape[0], X.shape[1], 1)

X_train, X_temp, y_train, y_temp = train_test_split(
    X, y_cat, test_size=0.2, random_state=42, stratify=y_cat
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
)

# Also get string labels for the test set
_, y_temp_str = train_test_split(
    y, test_size=0.2, random_state=42, stratify=y
)
_, y_test_str = train_test_split(
    y_temp_str, test_size=0.5, random_state=42, stratify=y_temp_str
)

print(f"Test set size: {len(X_test)}")

class_names = encoder.classes_.tolist()

print("Loading trained model...")
model = load_model(MODEL_PATH)

print("Running inference on test set...")
y_pred_prob = model.predict(X_test, verbose=0)
y_pred = np.argmax(y_pred_prob, axis=1)
y_true = np.argmax(y_test, axis=1)

print("\n" + "=" * 65)
print("RESULTS")
print("=" * 65)

accuracy = accuracy_score(y_true, y_pred)
precision = precision_score(y_true, y_pred, average="weighted")
recall = recall_score(y_true, y_pred, average="weighted")
f1 = f1_score(y_true, y_pred, average="weighted")

print(f"\nOverall Test Set Performance:")
print(f"  Accuracy  : {accuracy:.4f}  ({accuracy*100:.2f}%)")
print(f"  Precision : {precision:.4f}")
print(f"  Recall    : {recall:.4f}")
print(f"  F1 Score  : {f1:.4f}")

print(f"\nPer-Class Classification Report:")
report = classification_report(y_true, y_pred, target_names=class_names, digits=4)
print(report)

cm = confusion_matrix(y_true, y_pred)

print("\nConfusion Matrix (raw counts):")
header = "".join(f"{n:>12}" for n in class_names)
print(f"{'':>14}{header}")
for i, row in enumerate(cm):
    vals = "".join(f"{v:>12}" for v in row)
    print(f"{class_names[i]:>14}{vals}")

# Plot raw confusion matrix
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=class_names, yticklabels=class_names,
            cbar_kws={"label": "Count"})
plt.xlabel("Predicted Label", fontsize=12)
plt.ylabel("True Label", fontsize=12)
plt.title("Audio Model Confusion Matrix (RAVDESS Test Set)", fontsize=14)
plt.tight_layout()
plot_path = OUTPUT_DIR / "confusion_matrix.png"
plt.savefig(plot_path, dpi=150)
print(f"\nSaved: {plot_path}")

# Plot normalized confusion matrix
cm_norm = cm.astype("float") / cm.sum(axis=1)[:, np.newaxis]
plt.figure(figsize=(10, 8))
sns.heatmap(cm_norm, annot=True, fmt=".2f", cmap="Blues",
            xticklabels=class_names, yticklabels=class_names,
            cbar_kws={"label": "Proportion"})
plt.xlabel("Predicted Label", fontsize=12)
plt.ylabel("True Label", fontsize=12)
plt.title("Audio Model Normalized Confusion Matrix", fontsize=14)
plt.tight_layout()
norm_path = OUTPUT_DIR / "confusion_matrix_normalized.png"
plt.savefig(norm_path, dpi=150)
print(f"Saved: {norm_path}")

results_path = OUTPUT_DIR / "evaluation_results.txt"
with open(results_path, "w") as f:
    f.write("Audio Model Evaluation Results (RAVDESS Test Set)\n")
    f.write("=" * 55 + "\n\n")
    f.write(f"Accuracy  : {accuracy:.4f}  ({accuracy*100:.2f}%)\n")
    f.write(f"Precision : {precision:.4f}\n")
    f.write(f"Recall    : {recall:.4f}\n")
    f.write(f"F1 Score  : {f1:.4f}\n\n")
    f.write(classification_report(y_true, y_pred, target_names=class_names, digits=4))
    f.write("Confusion Matrix:\n")
    f.write(np.array2string(cm) + "\n\n")
    f.write("Normalized Confusion Matrix:\n")
    f.write(np.array2string(cm_norm, precision=4))
print(f"Saved: {results_path}")
print("\nDone!")
