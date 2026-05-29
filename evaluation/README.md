# MindCare AI - Model Evaluation & Research Benchmarks

This directory contains evaluation scripts, research datasets comparisons, and resulting confusion matrices for the AI components in the MindCare AI platform.

## Directory Structure

* **`compare_confusion_matrices.py`**: Compares all model performance metrics side-by-side (Text, Audio, Face, Fusion) and plots comparison charts.
* **`eval_audio_confusion.py`**: Evaluates the Speech Emotion Recognition model (CNN + LSTM) on the RAVDESS test dataset.
* **`eval_face_confusion.py`**: Evaluates the Face Emotion Recognition CNN on the RAF-DB test dataset.
* **`eval_text_confusion.py`**: Evaluates the NLP Emotion Classifier (DistilBERT) on the GoEmotions test dataset.
* **`eval_fusion_confusion.py` / `eval_fusion_v2.py`**: Benchmarks the Fusion network performance under different modality alignment scenarios.
* **`test_decode.py`**: Utility script to inspect the label mapping decoder of models.
* **`*_eval_output/`**: Folders containing the generated normalized/raw confusion matrix graphs and detailed precision/recall text reports for each model.

## Running the Benchmarks

To run any of the benchmarks, activate your python virtual environment and run the script from the command line:

```bash
# Run comparison benchmarks
python evaluation/compare_confusion_matrices.py

# Run text model evaluation
python evaluation/eval_text_confusion.py

# Run audio model evaluation
python evaluation/eval_audio_confusion.py
```

*Note: Path resolution in all scripts automatically points relative to the parent project directory so that datasets and models are loaded correctly.*
