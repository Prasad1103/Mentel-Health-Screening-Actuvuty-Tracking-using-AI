# 🧠 MindCare AI

### AI-Powered Behavioral & Emotional Analysis Platform

> A multimodal AI system for behavioral and emotional analysis using Text, Audio, Facial Expression, and Fusion AI models.

---

# 📌 Overview

MindCare AI is a full-stack artificial intelligence platform designed to analyze human emotions and behavioral patterns using multiple input modalities. The system combines:

* 📝 Text Emotion Analysis
* 🎤 Audio Emotion Analysis
* 📷 Facial Emotion Analysis
* 🧠 Multimodal Fusion Analysis

The platform provides a professional dashboard, analytics system, AI-powered chat assistant, questionnaire assessment, report generation, and historical emotional tracking.

Unlike traditional single-modality systems, MindCare AI fuses multiple emotional signals together to generate more reliable and context-aware emotional predictions.

---

# ✨ Core Features

## 🔐 Authentication & Security

* JWT-based authentication
* Secure password hashing (PBKDF2 + bcrypt compatibility)
* Forgot & reset password system
* Rate limiting for login protection
* User-isolated session history

## 📝 Text Emotion Analysis

* Real-time emotional prediction from user text
* Transformer-based NLP emotion detection
* Confidence score generation
* Explainable AI reasoning

## 🎤 Audio Emotion Analysis

* Speech emotion recognition
* MFCC feature extraction using Librosa
* TensorFlow/Keras deep learning model
* Multiple audio format support

## 📷 Face Emotion Analysis

* Facial expression recognition using CNN
* Webcam capture support
* Image upload support
* Real-time facial emotion detection

## 🧠 Fusion Analysis

* Combines Text + Audio + Face predictions
* Weighted multimodal emotional analysis
* Enhanced prediction reliability
* Modality agreement analysis

## 💬 AI Chat Assistant

* Emotion-aware conversational AI
* Streaming AI responses
* Emotional progression tracking
* Multi-modal chat support

## 📋 Questionnaire Module

* 15 behavioral assessment questions
* Structured emotional assessment
* Wellness scoring system
* Free-text emotional reflection

## 📊 Dashboard & Analytics

* Emotion radar charts
* Emotional trend analysis
* Session statistics
* Wellness score indicators
* Historical emotional tracking

## 📄 Reports & History

* PDF report generation
* Detailed session reports
* Historical session storage
* Report filtering and deletion

---

# 🏗 System Architecture

C:\Users\prasa\OneDrive\Desktop\BE\data\System Architecture.png
---

# 💻 Technology Stack

## Frontend

| Technology    | Purpose          |
| ------------- | ---------------- |
| React 18      | Frontend UI      |
| TypeScript    | Type safety      |
| Vite          | Build tool       |
| Tailwind CSS  | Styling          |
| shadcn/ui     | UI components    |
| Recharts      | Analytics charts |
| Framer Motion | Animations       |
| Axios         | API handling     |

## Backend

| Technology       | Purpose           |
| ---------------- | ----------------- |
| FastAPI          | Backend framework |
| Python 3.10+     | Backend runtime   |
| SQLAlchemy       | ORM               |
| SQLite           | Database          |
| JWT              | Authentication    |
| TensorFlow/Keras | AI models         |
| Transformers     | NLP model         |
| Librosa          | Audio processing  |
| Pillow           | Image processing  |

---

# 🧠 AI Models

| Model        | Purpose                         |
| ------------ | ------------------------------- |
| Text Model   | NLP-based emotion detection     |
| Audio Model  | Speech emotion recognition      |
| Face Model   | Facial expression analysis      |
| Fusion Model | Multimodal emotional prediction |

### Supported Emotion Classes

* Positive
* Neutral
* Stress
* Anxiety
* Negative
* Depression

---

# 🎯 Concern Level System

| Confidence Range | Concern Level |
| ---------------- | ------------- |
| 91–100           | Positive      |
| 76–90            | Neutral       |
| 61–75            | Stress        |
| 41–60            | Anxiety       |
| 21–40            | Negative      |
| 0–20             | Depression    |

---

# 📁 Project Structure

```text
mindcare-ai/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── lib/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
├── database/
├── models/
└── README.md
```

---

# 🚀 Installation & Setup

## Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --reload --port 8000
```

Backend URL:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5713
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint             |
| ------ | -------------------- |
| POST   | /api/register        |
| POST   | /api/login           |
| POST   | /api/forgot-password |
| POST   | /api/reset-password  |

## Analysis APIs

| Method | Endpoint                   |
| ------ | -------------------------- |
| POST   | /api/analyze-text          |
| POST   | /api/analyze-audio         |
| POST   | /api/analyze-face          |
| POST   | /api/analyze-fusion        |
| POST   | /api/analyze-chat          |
| POST   | /api/analyze-questionnaire |
| POST   | /api/chat/stream           |

## History APIs

| Method | Endpoint          |
| ------ | ----------------- |
| GET    | /api/history      |
| DELETE | /api/history/{id} |

---

# 🔒 Security Features

* JWT authentication
* Password hashing
* Reset token validation
* Rate limiting
* Protected API routes
* Per-user data isolation
* Input validation using Pydantic

---

# 🧪 Testing Status

| Module          | Status   |
| --------------- | -------- |
| Authentication  | ✅ Tested |
| Text Analysis   | ✅ Tested |
| Audio Analysis  | ✅ Tested |
| Face Analysis   | ✅ Tested |
| Fusion Analysis | ✅ Tested |
| Questionnaire   | ✅ Tested |
| Chat System     | ✅ Tested |
| History Module  | ✅ Tested |
| Password Reset  | ✅ Tested |

Overall Backend Test Result:

```text
29/30 Tests Passed (96.7%)
```

---

# 📈 Project Highlights

* Enterprise-style React + FastAPI architecture
* Real-time AI streaming responses
* Explainable AI recommendations
* Multi-modal emotional intelligence
* Research-grade behavioral analysis
* Conference-ready implementation
* Modern responsive UI/UX

---

# ⚠️ Important Note

> MindCare AI is designed for educational and research purposes. The platform provides AI-assisted emotional insights and should not be considered a clinical or medical diagnosis system.

---

# 👨‍💻 Authors

* Prasad Chaudhari
* BE Project Team

---

# 📄 License

This project is licensed under the MIT License.

---
