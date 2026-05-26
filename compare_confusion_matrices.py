import warnings
warnings.filterwarnings("ignore")
import numpy as np
import pathlib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

OUTPUT_DIR = pathlib.Path(__file__).resolve().parent / "comparison_output"
OUTPUT_DIR.mkdir(exist_ok=True)

class_names = ["Positive", "Neutral", "Stress", "Anxiety", "Negative", "Depression"]

# ====== TEXT MODEL CONFUSION MATRIX ======
cm_text = np.array([
    [1733, 243, 55, 8, 11, 4],
    [321, 1438, 199, 13, 60, 9],
    [67, 291, 425, 4, 53, 2],
    [3, 15, 8, 53, 11, 0],
    [30, 59, 54, 5, 132, 7],
    [13, 24, 8, 2, 17, 50]
])
acc_text = 70.59
f1_text = 0.7025

# ====== AUDIO MODEL CONFUSION MATRIX ======
cm_audio = np.array([
    [27, 3, 2, 4, 1, 1],
    [6, 18, 0, 9, 4, 2],
    [0, 1, 23, 10, 2, 2],
    [1, 7, 3, 81, 2, 2],
    [5, 2, 1, 1, 28, 1],
    [1, 0, 4, 3, 4, 27]
])
acc_audio = 70.83
f1_audio = 0.7035

# ====== FACE MODEL CONFUSION MATRIX ======
cm_face = np.array([
    [968, 186, 8, 1, 0, 22],
    [263, 687, 2, 2, 0, 55],
    [70, 36, 41, 4, 0, 11],
    [21, 23, 7, 18, 0, 5],
    [62, 81, 1, 0, 0, 16],
    [167, 140, 5, 2, 1, 163]
])
acc_face = 61.18
f1_face = 0.5778

# ====== FUSION MODEL (Scenario B: Text only) ======
cm_fusion = np.array([
    [12, 2, 1949, 0, 91, 0],
    [142, 4, 953, 0, 941, 0],
    [260, 2, 470, 0, 110, 0],
    [1, 0, 86, 0, 3, 0],
    [12, 3, 256, 0, 16, 0],
    [6, 36, 66, 0, 6, 0]
])
acc_fusion = 9.25
f1_fusion = 0.0378

models = [
    ("Text (DistilBERT)", cm_text, acc_text, f1_text),
    ("Audio (CNN+LSTM)", cm_audio, acc_audio, f1_audio),
    ("Face (CNN/ViT)", cm_face, acc_face, f1_face),
    ("Fusion (simulated)", cm_fusion, acc_fusion, f1_fusion),
]

# ====== PLOT SIDE-BY-SIDE CONFUSION MATRICES ======
fig, axes = plt.subplots(2, 2, figsize=(18, 16))
axes = axes.flatten()

for ax, (name, cm, acc, f1) in zip(axes, models):
    cm_norm = cm.astype("float") / cm.sum(axis=1)[:, np.newaxis]
    sns.heatmap(cm_norm, annot=True, fmt=".2f", cmap="Blues",
                xticklabels=class_names, yticklabels=class_names,
                cbar=True, ax=ax, annot_kws={"size": 10})
    ax.set_xlabel("Predicted Label", fontsize=11)
    ax.set_ylabel("True Label", fontsize=11)
    title = f"{name}\nAcc: {acc:.2f}%  F1: {f1:.4f}"
    ax.set_title(title, fontsize=13, fontweight="bold")
    ax.set_xticklabels(class_names, rotation=45, ha="right", fontsize=9)
    ax.set_yticklabels(class_names, rotation=0, fontsize=9)

plt.suptitle("Confusion Matrices Comparison - All Models (Normalized)",
             fontsize=16, fontweight="bold", y=0.98)
plt.tight_layout(rect=[0, 0, 1, 0.96])
plot_path = OUTPUT_DIR / "comparison_normalized.png"
plt.savefig(plot_path, dpi=150, bbox_inches="tight")
print(f"Saved: {plot_path}")

# ====== RAW COUNTS VERSION ======
fig2, axes2 = plt.subplots(2, 2, figsize=(18, 16))
axes2 = axes2.flatten()

for ax, (name, cm, acc, f1) in zip(axes2, models):
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=class_names, yticklabels=class_names,
                cbar=True, ax=ax, annot_kws={"size": 9})
    ax.set_xlabel("Predicted Label", fontsize=11)
    ax.set_ylabel("True Label", fontsize=11)
    title = f"{name}\nAcc: {acc:.2f}%  F1: {f1:.4f}"
    ax.set_title(title, fontsize=13, fontweight="bold")
    ax.set_xticklabels(class_names, rotation=45, ha="right", fontsize=9)
    ax.set_yticklabels(class_names, rotation=0, fontsize=9)

plt.suptitle("Confusion Matrices Comparison - All Models (Raw Counts)",
             fontsize=16, fontweight="bold", y=0.98)
plt.tight_layout(rect=[0, 0, 1, 0.96])
raw_path = OUTPUT_DIR / "comparison_raw_counts.png"
plt.savefig(raw_path, dpi=150, bbox_inches="tight")
print(f"Saved: {raw_path}")

# ====== PER-CLASS F1 COMPARISON BAR CHART ======
fig3, ax3 = plt.subplots(figsize=(14, 8))

x = np.arange(len(class_names))
width = 0.25

f1_scores = {
    "Text": [0.8211, 0.6998, 0.5343, 0.6057, 0.4623, 0.5376],
    "Audio": [0.7089, 0.7941, 0.7297, 0.6923, 0.6479, 0.5143],
    "Face": [0.7076, 0.6355, 0.3628, 0.3564, 0.0000, 0.4347],
}

colors = ["#2196F3", "#4CAF50", "#FF9800"]

for idx, (model_name, scores) in enumerate(f1_scores.items()):
    offset = width * idx
    ax3.bar(x + offset, scores, width, label=model_name, color=colors[idx])

ax3.set_xlabel("Emotion Class", fontsize=12)
ax3.set_ylabel("F1 Score", fontsize=12)
ax3.set_title("Per-Class F1 Score Comparison", fontsize=14, fontweight="bold")
ax3.set_xticks(x + width)
ax3.set_xticklabels(class_names, fontsize=11)
ax3.set_ylim(0, 1.0)
ax3.legend(loc="lower right", fontsize=11)
ax3.axhline(y=0.7, color="gray", linestyle="--", alpha=0.5)
ax3.grid(axis="y", alpha=0.3)

for idx, (model_name, scores) in enumerate(f1_scores.items()):
    offset = width * idx
    for i, v in enumerate(scores):
        if v > 0.05:
            ax3.text(x[i] + offset, v + 0.02, f"{v:.2f}", ha="center", va="bottom", fontsize=7)

plt.tight_layout()
bar_path = OUTPUT_DIR / "per_class_f1_comparison.png"
plt.savefig(bar_path, dpi=150, bbox_inches="tight")
print(f"Saved: {bar_path}")

# ====== SUMMARY METRICS TABLE ======
print()
print("=" * 70)
print("MODEL COMPARISON SUMMARY")
print("=" * 70)
print(f"{"Model":<25} {"Accuracy":>10} {"Precision":>10} {"Recall":>10} {"F1 Score":>10}")
print("-" * 65)

model_metrics = [
    ("Text (DistilBERT)", 70.59, 0.7014, 0.7059, 0.7025),
    ("Audio (CNN+LSTM)", 70.83, 0.7042, 0.7083, 0.7035),
    ("Face (CNN/ViT)", 61.18, 0.5803, 0.6118, 0.5778),
    ("Fusion (simulated)", 9.25, 0.0625, 0.0925, 0.0378),
]

for name, acc, prec, rec, f1_val in model_metrics:
    print(f"{name:<25} {acc:>9.2f}% {prec:>10.4f} {rec:>10.4f} {f1_val:>10.4f}")
print()
print("Done!")