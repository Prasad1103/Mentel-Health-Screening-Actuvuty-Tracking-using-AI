import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pathlib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from datasets import load_dataset
from transformers import pipeline
from tensorflow.keras.models import load_model
from sklearn.metrics import (
    confusion_matrix, accuracy_score,
    precision_score, recall_score, f1_score,
    classification_report
)

BASE_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
MODEL_DIR = str(PROJECT_ROOT / "models" / "text_final_6")
FUSION_PATH = str(PROJECT_ROOT / "models" / "fusion_model.h5")
OUTPUT_DIR = BASE_DIR / "fusion_eval_output"
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
print("Loading fine-tuned DistilBERT text model...")
print("=" * 65)
clf = None
for attempt in range(2):
    try:
        clf = pipeline(
            "text-classification",
            model=MODEL_DIR,
            tokenizer=MODEL_DIR,
            top_k=None
        )
        break
    except Exception as e:
        print(f"Attempt {attempt+1} failed: {str(e)[:120]}")
        if attempt == 1:
            raise
print("Text model loaded successfully.")

print()
print("Loading fusion model...")
fusion = load_model(FUSION_PATH)
print("Fusion model loaded successfully.")

print()
print("Loading GoEmotions test dataset...")
ds = load_dataset("google-research-datasets/go_emotions")
test_ds = ds["test"]
print(f"Test set size: {len(test_ds)} samples")
print()

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

texts = test_ds["text"]
true_labels = test_ds["label_6"]

print("Running text model inference to get probability vectors...")
BATCH_SIZE = 64
text_probs_list = []

for i in range(0, len(texts), BATCH_SIZE):
    batch = texts[i:i+BATCH_SIZE]
    results = clf(batch)
    for result in results:
        probs = [0.0] * 6
        for item in result:
            idx = int(item["label"].replace("LABEL_", ""))
            if idx < 6:
                probs[idx] = float(item["score"])
        text_probs_list.append(probs)
    if (i // BATCH_SIZE) % 5 == 0:
        print(f"  Processed {min(i+BATCH_SIZE, len(texts))}/{len(texts)}")

text_probs = np.array(text_probs_list)
y_true = np.array(true_labels)

print()
print(f"Text inference complete. Shape: {text_probs.shape}")

# === SCENARIO A: All modalities agree ===
print()
print("=" * 65)
print("SCENARIO A: All 3 modalities agree")
print("=" * 65)

all_preds_a = []
for i in range(len(text_probs)):
    tp = text_probs[i]
    ap = text_probs[i]
    fp = text_probs[i]
    x = np.concatenate([tp, ap, fp]).reshape(1, -1)
    pred = fusion.predict(x, verbose=0)[0]
    idx = int(np.argmax(pred))
    all_preds_a.append(idx)

y_pred_a = np.array(all_preds_a)

acc_a = accuracy_score(y_true, y_pred_a)
prec_a = precision_score(y_true, y_pred_a, average="weighted")
rec_a = recall_score(y_true, y_pred_a, average="weighted")
f1_a = f1_score(y_true, y_pred_a, average="weighted")

print(f"Accuracy  : {acc_a:.4f}  ({acc_a*100:.2f}%)")
print(f"Precision : {prec_a:.4f}")
print(f"Recall    : {rec_a:.4f}")
print(f"F1 Score  : {f1_a:.4f}")

# === SCENARIO B: Text only ===
print()
print("=" * 65)
print("SCENARIO B: Text only (audio/face = uniform)")
print("=" * 65)

uniform_probs = np.ones(6) / 6.0

all_preds_b = []
for i in range(len(text_probs)):
    tp = text_probs[i]
    ap = uniform_probs
    fp = uniform_probs
    x = np.concatenate([tp, ap, fp]).reshape(1, -1)
    pred = fusion.predict(x, verbose=0)[0]
    idx = int(np.argmax(pred))
    all_preds_b.append(idx)

y_pred_b = np.array(all_preds_b)

acc_b = accuracy_score(y_true, y_pred_b)
prec_b = precision_score(y_true, y_pred_b, average="weighted")
rec_b = recall_score(y_true, y_pred_b, average="weighted")
f1_b = f1_score(y_true, y_pred_b, average="weighted")

print(f"Accuracy  : {acc_b:.4f}  ({acc_b*100:.2f}%)")
print(f"Precision : {prec_b:.4f}")
print(f"Recall    : {rec_b:.4f}")
print(f"F1 Score  : {f1_b:.4f}")

# === SCENARIO C: Text + audio, face uniform ===
print()
print("=" * 65)
print("SCENARIO C: Text + audio agree, face = uniform")
print("=" * 65)

all_preds_c = []
for i in range(len(text_probs)):
    tp = text_probs[i]
    ap = text_probs[i]
    fp = uniform_probs
    x = np.concatenate([tp, ap, fp]).reshape(1, -1)
    pred = fusion.predict(x, verbose=0)[0]
    idx = int(np.argmax(pred))
    all_preds_c.append(idx)

y_pred_c = np.array(all_preds_c)

acc_c = accuracy_score(y_true, y_pred_c)
prec_c = precision_score(y_true, y_pred_c, average="weighted")
rec_c = recall_score(y_true, y_pred_c, average="weighted")
f1_c = f1_score(y_true, y_pred_c, average="weighted")

print(f"Accuracy  : {acc_c:.4f}  ({acc_c*100:.2f}%)")
print(f"Precision : {prec_c:.4f}")
print(f"Recall    : {rec_c:.4f}")
print(f"F1 Score  : {f1_c:.4f}")

# === SUMMARY TABLE ===
print()
print("=" * 65)
print("SUMMARY: All Scenarios")
print("=" * 65)
print(f"{"Scenario":<40} {"Accuracy":>10} {"F1 Score":>10}")
print("-" * 60)
print(f"{"A: All 3 agree":<40} {acc_a*100:>9.2f}% {f1_a:>10.4f}")
print(f"{"B: Text only, audio/face uniform":<40} {acc_b*100:>9.2f}% {f1_b:>10.4f}")
print(f"{"C: Text+audio, face uniform":<40} {acc_c*100:>9.2f}% {f1_c:>10.4f}")
print(f"{"Text model alone (reference)":<40} {70.59:>9.2f}% {0.7025:>10.4f}")

# === Plot confusion matrix for Scenario B ===
cm_b = confusion_matrix(y_true, y_pred_b)

plt.figure(figsize=(10, 8))
sns.heatmap(cm_b, annot=True, fmt="d", cmap="Blues",
            xticklabels=class_names, yticklabels=class_names,
            cbar_kws={"label": "Count"})
plt.xlabel("Predicted Label", fontsize=12)
plt.ylabel("True Label", fontsize=12)
plt.title("Fusion Model Confusion Matrix (Text only, uniform audio/face)", fontsize=14)
plt.tight_layout()
plot_path = OUTPUT_DIR / "confusion_matrix_text_only.png"
plt.savefig(plot_path, dpi=150)
print()
print(f"Saved: {plot_path}")

cm_norm = cm_b.astype("float") / cm_b.sum(axis=1)[:, np.newaxis]
plt.figure(figsize=(10, 8))
sns.heatmap(cm_norm, annot=True, fmt=".2f", cmap="Blues",
            xticklabels=class_names, yticklabels=class_names,
            cbar_kws={"label": "Proportion"})
plt.xlabel("Predicted Label", fontsize=12)
plt.ylabel("True Label", fontsize=12)
plt.title("Fusion Model Normalized Confusion Matrix (Text only, uniform audio/face)", fontsize=14)
plt.tight_layout()
norm_path = OUTPUT_DIR / "confusion_matrix_normalized_text_only.png"
plt.savefig(norm_path, dpi=150)
print(f"Saved: {norm_path}")

cm_a = confusion_matrix(y_true, y_pred_a)
plt.figure(figsize=(10, 8))
sns.heatmap(cm_a, annot=True, fmt="d", cmap="Blues",
            xticklabels=class_names, yticklabels=class_names,
            cbar_kws={"label": "Count"})
plt.xlabel("Predicted Label", fontsize=12)
plt.ylabel("True Label", fontsize=12)
plt.title("Fusion Model Confusion Matrix (All 3 modalities agree)", fontsize=14)
plt.tight_layout()
plot_path2 = OUTPUT_DIR / "confusion_matrix_all_agree.png"
plt.savefig(plot_path2, dpi=150)
print(f"Saved: {plot_path2}")

# Save all results
results_path = OUTPUT_DIR / "evaluation_results.txt"
with open(results_path, "w") as f:
    f.write("Fusion Model Evaluation Results (Simulated on GoEmotions Test Set)\n")
    f.write("=" * 65 + "\n\n")
    f.write("NOTE: No true multimodal test set exists. Results are simulated using\n")
    f.write("GoEmotions text data with synthetic audio/face inputs.\n\n")
    
    f.write("SCENARIO A: All 3 modalities agree (text probs used for all)\n")
    f.write("-" * 50 + "\n")
    f.write(f"Accuracy  : {acc_a:.4f}  ({acc_a*100:.2f}%)\n")
    f.write(f"Precision : {prec_a:.4f}\n")
    f.write(f"Recall    : {rec_a:.4f}\n")
    f.write(f"F1 Score  : {f1_a:.4f}\n\n")
    f.write(classification_report(y_true, y_pred_a, target_names=class_names, digits=4))
    f.write("\nConfusion Matrix:\n")
    f.write(np.array2string(cm_a) + "\n\n\n")
    
    f.write("SCENARIO B: Text only, audio/face = uniform distribution\n")
    f.write("-" * 50 + "\n")
    f.write(f"Accuracy  : {acc_b:.4f}  ({acc_b*100:.2f}%)\n")
    f.write(f"Precision : {prec_b:.4f}\n")
    f.write(f"Recall    : {rec_b:.4f}\n")
    f.write(f"F1 Score  : {f1_b:.4f}\n\n")
    f.write(classification_report(y_true, y_pred_b, target_names=class_names, digits=4))
    f.write("\nConfusion Matrix:\n")
    f.write(np.array2string(cm_b) + "\n\n\n")
    
    f.write("SCENARIO C: Text + audio agree, face = uniform\n")
    f.write("-" * 50 + "\n")
    f.write(f"Accuracy  : {acc_c:.4f}  ({acc_c*100:.2f}%)\n")
    f.write(f"Precision : {prec_c:.4f}\n")
    f.write(f"Recall    : {rec_c:.4f}\n")
    f.write(f"F1 Score  : {f1_c:.4f}\n\n")
    f.write(classification_report(y_true, y_pred_c, target_names=class_names, digits=4))
    f.write("\nConfusion Matrix:\n")
    f.write(np.array2string(confusion_matrix(y_true, y_pred_c)) + "\n\n\n")

print()
print(f"Saved: {results_path}")
print()
print("Done!")