import warnings
warnings.filterwarnings("ignore")

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from datasets import load_dataset
from transformers import pipeline
from sklearn.metrics import (
    confusion_matrix, accuracy_score,
    precision_score, recall_score, f1_score,
    classification_report
)
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
MODEL_DIR = PROJECT_ROOT / "models" / "text_final_6"
OUTPUT_DIR = BASE_DIR / "text_eval_output"
OUTPUT_DIR.mkdir(exist_ok=True)

id2label_28 = {
    0: "admiration", 1: "amusement", 2: "anger", 3: "annoyance",
    4: "approval", 5: "caring", 6: "confusion", 7: "curiosity",
    8: "desire", 9: "disappointment", 10: "disapproval", 11: "disgust",
    12: "embarrassment", 13: "excitement", 14: "fear", 15: "gratitude",
    16: "grief", 17: "joy", 18: "love", 19: "nervousness",
    20: "optimism", 21: "pride", 22: "realization", 23: "relief",
    24: "remorse", 25: "sadness", 26: "surprise", 27: "neutral"
}

final_map = {
    "admiration": 0, "amusement": 0, "approval": 0, "caring": 0,
    "desire": 0, "excitement": 0, "gratitude": 0, "joy": 0, "love": 0,
    "optimism": 0, "pride": 0, "relief": 0,
    "curiosity": 1, "realization": 1, "surprise": 1, "neutral": 1,
    "anger": 2, "annoyance": 2, "disapproval": 2, "confusion": 2,
    "fear": 3, "nervousness": 3,
    "disappointment": 4, "disgust": 4, "embarrassment": 4, "remorse": 4,
    "grief": 5, "sadness": 5
}

class_names = ["Positive", "Neutral", "Stress", "Anxiety", "Negative", "Depression"]

print("=" * 65)
print("Loading fine-tuned DistilBERT model...")
print("=" * 65)

clf = None
for attempt in range(2):
    try:
        clf = pipeline(
            "text-classification",
            model=str(MODEL_DIR),
            tokenizer=str(MODEL_DIR),
            top_k=None
        )
        break
    except Exception as e:
        err = str(e)
        print(f"Attempt {attempt+1} failed: {err[:120]}")
        if attempt == 1:
            raise

print("Model loaded successfully.\n")

print("Loading GoEmotions test dataset...")
ds = load_dataset("google-research-datasets/go_emotions")
test_ds = ds["test"]
print(f"Test set size: {len(test_ds)} samples\n")

def convert_label(example):
    labels = example["labels"]
    if len(labels) == 0:
        example["label_6"] = 1
    else:
        first = labels[0]
        emotion = id2label_28[first]
        example["label_6"] = final_map[emotion]
    return example

test_ds = test_ds.map(convert_label)

print("Running inference on test set...")
texts = test_ds["text"]
true_labels = test_ds["label_6"]

BATCH_SIZE = 64
all_preds = []

for i in range(0, len(texts), BATCH_SIZE):
    batch = texts[i:i+BATCH_SIZE]
    results = clf(batch)
    for result in results:
        probs = [0.0] * 6
        for item in result:
            idx = int(item["label"].replace("LABEL_", ""))
            if idx < 6:
                probs[idx] = float(item["score"])
        pred = int(np.argmax(probs))
        all_preds.append(pred)
    if (i // BATCH_SIZE) % 5 == 0:
        print(f"  Processed {min(i+BATCH_SIZE, len(texts))}/{len(texts)}")

y_true = np.array(true_labels)
y_pred = np.array(all_preds)

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
print("Confusion Matrix (raw counts):")
header = "".join(f"{n:>10}" for n in class_names)
print(f"{'':>12}{header}")
for i, row in enumerate(cm):
    vals = "".join(f"{v:>10}" for v in row)
    print(f"{class_names[i]:>12}{vals}")

# Plot raw confusion matrix
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=class_names, yticklabels=class_names,
            cbar_kws={"label": "Count"})
plt.xlabel("Predicted Label", fontsize=12)
plt.ylabel("True Label", fontsize=12)
plt.title("Text Model Confusion Matrix (GoEmotions Test Set)", fontsize=14)
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
plt.title("Text Model Normalized Confusion Matrix", fontsize=14)
plt.tight_layout()
norm_path = OUTPUT_DIR / "confusion_matrix_normalized.png"
plt.savefig(norm_path, dpi=150)
print(f"Saved: {norm_path}")

# Save results to text file
results_path = OUTPUT_DIR / "evaluation_results.txt"
with open(results_path, "w") as f:
    f.write("Text Model Evaluation Results (GoEmotions Test Set)\n")
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
