import warnings
warnings.filterwarnings("ignore")

import os
import numpy as np
import pathlib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from sklearn.metrics import (
    confusion_matrix, accuracy_score,
    precision_score, recall_score, f1_score,
    classification_report
)

BASE_DIR = pathlib.Path(__file__).resolve().parent
DATA_DIR = str(BASE_DIR / "data" / "face" / "RAF-DB" / "DATASET" / "test")
MODEL_PATH = str(BASE_DIR / "models" / "face_final_6.h5")
OUTPUT_DIR = BASE_DIR / "face_eval_output"
OUTPUT_DIR.mkdir(exist_ok=True)

# RAF-DB folder -> BE class mapping
raf_to_final = {
    "1": "Neutral",      # Surprise
    "2": "Anxiety",      # Fear
    "3": "Negative",     # Disgust
    "4": "Positive",     # Happy
    "5": "Depression",   # Sad
    "6": "Stress",       # Anger
    "7": "Neutral"       # Neutral
}

class_names = ["Positive", "Neutral", "Stress", "Anxiety", "Negative", "Depression"]
label2id = {name: i for i, name in enumerate(class_names)}

print("=" * 65)
print("Loading face model...")
print("=" * 65)
model = load_model(MODEL_PATH)
print("Model loaded successfully.\n")

print("Loading RAF-DB test dataset...")
X_paths = []
y_true_list = []

for folder in sorted(os.listdir(DATA_DIR)):
    folder_path = os.path.join(DATA_DIR, folder)
    if not os.path.isdir(folder_path):
        continue
    final_label = raf_to_final.get(folder)
    if final_label is None:
        continue
    label_id = label2id[final_label]
    for fname in os.listdir(folder_path):
        if fname.lower().endswith((".jpg", ".jpeg", ".png")):
            X_paths.append(os.path.join(folder_path, fname))
            y_true_list.append(label_id)

print(f"Test set size: {len(X_paths)} samples\n")

print("Running inference on test set...")
y_pred_list = []
all_probs = []

for i, img_path in enumerate(X_paths):
    img = image.load_img(img_path, target_size=(224, 224))
    img = image.img_to_array(img) / 255.0
    img = np.expand_dims(img, axis=0)
    
    pred = model.predict(img, verbose=0)[0]
    idx = int(np.argmax(pred))
    
    # Handle 7-output model mapping
    if len(pred) == 7:
        # Use the _MODEL7_TO_CLASS6 mapping
        model7_to_class6 = {0: 1, 1: 3, 2: 4, 3: 0, 4: 5, 5: 2, 6: 1}
        probs6 = np.zeros(6)
        for j, p in enumerate(pred):
            target = model7_to_class6.get(j, 1)
            if 0 <= target < 6:
                probs6[target] += p
        idx = int(np.argmax(probs6))
        all_probs.append(probs6)
    else:
        all_probs.append(pred)
    
    y_pred_list.append(idx)
    
    if (i + 1) % 500 == 0:
        print(f"  Processed {i+1}/{len(X_paths)}")

y_true = np.array(y_true_list)
y_pred = np.array(y_pred_list)

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
plt.title("Face Model Confusion Matrix (RAF-DB Test Set)", fontsize=14)
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
plt.title("Face Model Normalized Confusion Matrix", fontsize=14)
plt.tight_layout()
norm_path = OUTPUT_DIR / "confusion_matrix_normalized.png"
plt.savefig(norm_path, dpi=150)
print(f"Saved: {norm_path}")

results_path = OUTPUT_DIR / "evaluation_results.txt"
with open(results_path, "w") as f:
    f.write("Face Model Evaluation Results (RAF-DB Test Set)\n")
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
