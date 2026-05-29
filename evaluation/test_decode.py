import warnings
warnings.filterwarnings('ignore')

import os
import numpy as np
import pathlib
import matplotlib
matplotlib.use('Agg')
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
MODEL_DIR = str(PROJECT_ROOT / 'models' / 'text_final_6')
FUSION_PATH = str(PROJECT_ROOT / 'models' / 'fusion_model.h5')
OUTPUT_DIR = BASE_DIR / 'fusion_eval_output'
OUTPUT_DIR.mkdir(exist_ok=True)

id2label_28 = {
	0: 'admiration', 1: 'amusement', 2: 'anger', 3: 'annoyance',
	4: 'approval', 5: 'caring', 6: 'confusion', 7: 'curiosity',
	8: 'desire', 9: 'disappointment', 10: 'disapproval', 11: 'disgust',
	12: 'embarrassment', 13: 'excitement', 14: 'fear', 15: 'gratitude',
	16: 'grief', 17: 'joy', 18: 'love', 19: 'nervousness',
	20: 'optimism', 21: 'pride', 22: 'realization', 23: 'relief',
	24: 'remorse', 25: 'sadness', 26: 'surprise', 27: 'neutral'
}
