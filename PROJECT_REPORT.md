# AI-Powered Behavioral & Emotional Analysis Platform

## PROJECT REPORT

**Submitted in partial fulfillment of the requirements for the degree of**

### Bachelor of Engineering

**in**

### Computer Science & Engineering

---

**Submitted by:**

[Your Name]

[University Roll Number]

---

**Under the guidance of:**

[Guide Name]
Department of Computer Science & Engineering

---

**[University/College Name]**
**Department of Computer Science & Engineering**
**[City, State]**
**[Year: 2025-2026]**

---

---

## CERTIFICATE

This is to certify that the project titled **"AI-Powered Behavioral & Emotional Analysis Platform"** is a bonafide work carried out by **[Your Name]** (Roll No: [Your Roll Number]) in partial fulfillment of the requirements for the degree of **Bachelor of Engineering in Computer Science & Engineering** during the academic year 2025-2026.

The project has been completed under my guidance and is the result of the candidate's own research work.

---

**Signature of Guide**  
**Signature of HOD**  
**Signature of Principal**

---

## DECLARATION

I hereby declare that the project work entitled **"AI-Powered Behavioral & Emotional Analysis Platform"** submitted to **[University/College Name]** is my original work and has not been submitted earlier for the award of any degree or diploma.

I further declare that the sources of information used in this project have been duly acknowledged in the references section.

---

**Place:** [City]

**Date:** [Date]

**[Your Name]**

---

## ACKNOWLEDGEMENT

I would like to express my sincere gratitude to my guide **[Guide Name]** for their invaluable guidance, encouragement, and support throughout the development of this project.

I am also thankful to the **Head of Department**, faculty members, and staff of the **Department of Computer Science & Engineering** for providing the necessary resources and facilities.

Finally, I extend my thanks to my family and friends for their constant support and motivation.

---

**[Your Name]**

---

## TABLE OF CONTENTS

1. Introduction
2. Problem Statement
3. Objectives
4. Literature Review
5. Technology Stack
6. System Architecture
7. Module Descriptions
8. Implementation Details
9. Testing & Results
10. Conclusion
11. Future Scope
12. References

---

## 1. INTRODUCTION

Human emotions are complex and multifaceted — they manifest through language, vocal tone, facial expressions, and behavioral patterns. Traditional methods of emotional assessment rely heavily on self-reported questionnaires and clinical observation, which can be subjective, infrequent, and limited in scope.

The **Behavioral & Emotional (BE) Analysis Platform** addresses these limitations by providing an intelligent, AI-driven system that can analyze emotional states through multiple input channels simultaneously. Instead of depending on any single signal, the system combines evidence from:

- **Text Input** — Natural language analysis using transformer-based models
- **Voice/Audio** — Speech tone and acoustic feature extraction
- **Facial Expressions** — Image-based emotion recognition via webcam or upload
- **Questionnaires** — Structured behavioral assessment with automated scoring
- **Multimodal Fusion** — Combined analysis across all modalities for higher accuracy

The system generates comprehensive reports, visual dashboards, historical tracking, and personalized wellness recommendations. It is built as a full-stack web application with a React/TypeScript frontend and a FastAPI Python backend, integrating TensorFlow/Keras deep learning models for inference.

![Landing Page](screenshots/landing_page.png)
*Figure 1: BE Analysis Platform — Landing Page*

This report presents the complete design, implementation, and testing of the BE Analysis Platform, covering the system architecture, technology stack, module descriptions, testing methodology, and results.

---

## 2. PROBLEM STATEMENT

### 2.1 Background

Mental health and emotional wellness are critical aspects of overall well-being, yet accessible tools for self-monitoring remain limited. Many individuals experience stress, anxiety, depression, and mood fluctuations without having systematic ways to track or understand their emotional patterns. Traditional approaches rely on:

- **Manual journaling** — Subjective and inconsistent
- **Clinical assessments** — Expensive, infrequent, and not always accessible
- **Single-modality screening** — Questionnaires alone miss vocal and facial cues

### 2.2 Problem Statement

To design and develop an intelligent, AI-powered platform that can analyze human emotional states through multiple modalities (text, voice, facial expressions, and questionnaires), providing users with actionable insights, historical tracking, and personalized recommendations for mental wellness.

### 2.3 Challenges Addressed

1. **Multimodal Integration:** Combining heterogeneous data types (text, audio, images) into a unified emotional assessment
2. **Real-time Processing:** Delivering analysis results with low latency for interactive use
3. **Accuracy & Reliability:** Ensuring predictions are consistent and meaningful across different input modalities
4. **User Privacy:** Handling sensitive emotional data with robust security measures
5. **Accessibility:** Providing a web-based interface that works across devices without specialized hardware

---

## 3. OBJECTIVES

### 3.1 Primary Objectives

1. **Text Emotion Analysis:** Develop a transformer-based NLP model capable of detecting emotional states from written text with high accuracy
2. **Speech Emotion Recognition:** Build a deep learning model that analyzes vocal features (tone, pitch, intensity) to classify emotions from audio recordings
3. **Facial Expression Recognition:** Implement a CNN-based model that detects emotions from facial expressions in images and live webcam feeds
4. **Questionnaire Analysis:** Create a structured behavioral assessment system with automated scoring and emotion prediction
5. **Multimodal Fusion:** Combine predictions from all modalities using a fusion model for improved accuracy and reliability
6. **Web Platform:** Develop a modern, responsive web application with secure authentication, dashboard visualization, and historical tracking

### 3.2 Secondary Objectives

- Implement JWT-based authentication for secure user management
- Provide interactive data visualizations (radar charts, pie charts, trend graphs)
- Generate PDF reports for offline access and sharing
- Support real-time streaming chat with AI-powered emotional analysis
- Enable live webcam capture for facial analysis
- Deliver personalized wellness recommendations based on analysis results

---

## 4. LITERATURE REVIEW

### 4.1 Emotion Recognition in Text

Recent advances in Natural Language Processing (NLP) have demonstrated the effectiveness of transformer-based models for emotion classification. Models such as BERT (Devlin et al., 2019), RoBERTa, and DistilBERT have achieved state-of-the-art results on emotion recognition benchmarks. The project leverages a fine-tuned DistilBERT model, which offers a balance between accuracy and computational efficiency, making it suitable for real-time web applications.

### 4.2 Speech Emotion Recognition

Speech emotion recognition has been extensively studied using acoustic features such as MFCCs (Mel-frequency cepstral coefficients), chroma, and spectral features. Deep learning architectures, particularly Convolutional Neural Networks (CNNs) and Long Short-Term Memory (LSTM) networks, have shown strong performance on datasets like RAVDESS (Livingstone & Russo, 2018) and CREMA-D. Our implementation uses a CNN-based approach trained on the RAVDESS dataset.

### 4.3 Facial Emotion Recognition

Facial expression recognition has been a cornerstone of affective computing. Convolutional Neural Networks trained on datasets like RAF-DB (Real-world Affective Faces Database) and FER2013 have achieved human-level performance in controlled environments. Our model uses a CNN architecture trained on RAF-DB to classify seven basic emotions.

### 4.4 Multimodal Fusion

Research by Poria et al. (2017) and others has shown that multimodal emotion recognition consistently outperforms single-modality approaches. Fusion strategies include early fusion (combining features before classification), late fusion (combining predictions), and hybrid approaches. Our system implements a neural network-based fusion model that combines probability distributions from all three modalities for improved accuracy.

---

## 5. TECHNOLOGY STACK

### 5.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | 18.x | UI component library |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 3.x | Utility-first styling |
| Vite | 5.x | Build tool and dev server |
| Recharts | 2.x | Data visualization charts |
| Axios | 1.x | HTTP client for API calls |
| shadcn/ui | latest | Accessible UI components |
| Lucide React | latest | Icon library |

### 5.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.104.x | Python web framework |
| Python | 3.13 | Programming language |
| SQLAlchemy | 2.x | ORM for database access |
| SQLite | — | Relational database |
| TensorFlow/Keras | 2.x | Deep learning framework |
| Hugging Face | latest | Transformer models |
| JWT (PyJWT) | 2.x | Authentication tokens |
| Passlib/bcrypt | latest | Password hashing |
| Uvicorn | latest | ASGI server |
| Librosa | latest | Audio processing |
| OpenCV (cv2) | latest | Image processing |
| Pillow (PIL) | latest | Image handling |
| FFmpeg | latest | Audio format conversion |

### 5.3 Development & Deployment Tools

- **Version Control:** Git
- **Package Management:** npm (frontend), pip (backend)
- **API Testing:** Swagger UI (auto-generated), Postman
- **Database:** SQLite (development), PostgreSQL-ready

---

## 6. SYSTEM ARCHITECTURE

### 6.1 High-Level Architecture

The BE Project follows a decoupled client-server architecture with three main layers:

```
+-------------------+       HTTP/SSE       +-------------------+
|    Frontend       | <------------------> |    Backend        |
|   React + TS      |     REST + SSE       |   FastAPI         |
|   Port 5713       |                      |   Port 8000       |
+-------------------+                      +--------+----------+
                                                     |
                                            +---------v----------+
                                            |    AI Models       |
                                            |   TF/Keras + HF    |
                                            +---------+----------+
                                                     |
                                            +---------v----------+
                                            |    SQLite DB       |
                                            |   (via SQLAlchemy) |
                                            +--------------------+
```

### 6.2 Frontend Architecture

The frontend is organized into a component-based architecture with clear separation of concerns:

- **Pages (10):** Dashboard, Chat, Fusion Analysis, Questionnaire, History, Reports, ReportDetail, Analytics, Settings, Login/Register/ForgotPassword/ResetPassword
- **Components:** AppLayout, AppSidebar, AppTopbar, AudioRecorder, WebcamCapture, ResultsPanel, StatCard, Navbar, Footer
- **Context:** AuthContext — manages authentication state across the entire application
- **Services:** API client layer with typed endpoints for all backend communication
- **UI Library:** 40+ shadcn/ui components (buttons, cards, dialogs, forms, charts, etc.)
- **Styling:** Tailwind CSS with custom theme configuration

### 6.3 Backend Architecture

The backend follows a modular FastAPI structure:

- **Routes Layer:** auth.py (authentication), analysis.py (all analysis endpoints), history.py (result retrieval & deletion)
- **AI Models Layer:** text_model.py (DistilBERT), audio_model.py (CNN), face_model.py (CNN), fusion.py (neural fusion model)
- **Services Layer:** concern_level.py (severity computation), explainability.py (prediction explanations), recommendations.py (personalized suggestions)
- **Data Layer:** models.py (SQLAlchemy ORM schemas), schemas.py (Pydantic validation), database.py (connection management)
- **Security Layer:** security.py (JWT token creation/verification, password hashing), dependencies.py (auth dependency injection)

### 6.4 Data Flow

#### Authentication Flow:
```
User -> Login Form -> POST /api/login -> FastAPI -> Verify Password (bcrypt) -> Generate JWT -> Return Token
User -> Register Form -> POST /api/register -> Hash Password -> Store in DB -> Return JWT
```

#### Analysis Flow:
```
User Input -> Frontend Form -> POST /api/analyze-{type} with Bearer Token
  -> FastAPI Route -> Validate Token -> Process Input
    -> AI Model Inference -> Predict Emotion Class + Confidence
    -> Save Result to DB -> Return Response
  -> Frontend -> Display Charts + Summary + Recommendations
```

#### SSE Chat Flow:
```
User Message -> Frontend -> POST /api/chat/stream (multipart)
  -> FastAPI -> Process Text/Audio/Face
    -> AI Model Analysis -> Generate Streaming Response
    -> SSE Stream -> Frontend renders words in real-time
```

#### Fusion Flow:
```
Text Probabilities + Audio Probabilities + Face Probabilities
  -> Fusion Model (TF/Keras Neural Network)
    -> Weighted Combination of Modalities
      -> Final Emotion Prediction + Confidence
```

---

## 7. MODULE DESCRIPTIONS

### 7.1 Authentication Module

**Files:** backend/app/routes/auth.py, backend/app/security.py, frontend/src/context/AuthContext.tsx

The authentication module provides secure user registration and login using JWT tokens with bcrypt password hashing. It includes rate limiting on the login endpoint (10 requests per 5 minutes) to prevent brute-force attacks.

**Endpoints:**
- `POST /api/register` — Create new user account (name, email, password)
- `POST /api/login` — Authenticate and receive JWT token
- `POST /api/forgot-password` — Generate password reset token
- `POST /api/reset-password` — Reset password with token

![Login Page](screenshots/login_page.png)
*Figure 2: Secure Login Interface with Email/Password Authentication*

**Key Features:**
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with configurable expiry (default 30 minutes)
- Token contains user_id, email, issued_at, expires_at
- Frontend stores token in localStorage and attaches to all API requests via AuthContext
- Protected routes verify token on every request

### 7.2 Text Analysis Module

**Files:** backend/app/ai/text_model.py, backend/app/routes/analysis.py

**Model:** Fine-tuned DistilBERT transformer model (6 emotion classes)

**Classes Detected:**
- Positive, Neutral, Stress, Anxiety, Negative, Depression

**Process:**
1. User submits text via form or direct API call
2. Text is tokenized using DistilBERT tokenizer
3. Model predicts probability distribution across 6 emotion classes
4. Highest probability class is selected as the emotion
5. Confidence score and severity level are computed
6. Personalized recommendations are generated based on the emotion
7. Result is saved to the database with timestamp

**Accuracy:** ~78% on test data

![Text Analysis Results Dashboard](screenshots/text_analysis_results.png)
*Figure 11: Dashboard Showing Text Analysis Results with Emotion Radar and Distribution Charts*

### 7.3 Audio/Speech Analysis Module

**Files:** backend/app/ai/audio_model.py

**Model:** CNN-based deep learning model trained on RAVDESS dataset

**Process:**
1. User uploads or records audio file
2. Backend saves file with unique filename (prevents overwrites)
3. Audio is converted to WAV format using FFmpeg (16kHz, mono)
4. Features extracted: MFCCs, chroma, mel-spectrogram, spectral contrast, tonnetz
5. CNN model processes features and predicts emotion
6. Result saved to database

**Supported Formats:** WAV, MP3, M4A, OGG, FLAC

![Audio & Face Upload Interface](screenshots/fusion_upload_interface.png)
*Figure 12: Fusion Analysis Page with Audio Recorder and Webcam Capture Interfaces for Multimodal Input*

### 7.4 Face/Facial Analysis Module

**Files:** backend/app/ai/face_model.py

**Model:** CNN-based model trained on RAF-DB dataset

**Process:**
1. User uploads image or captures via webcam
2. Image is preprocessed (resized to 100x100, normalized)
3. CNN model extracts facial features and predicts emotion
4. Confidence score computed from softmax probabilities
5. Result saved to database

**Supported Formats:** JPG, JPEG, PNG

The Fusion Analysis page (Figure 12) provides a unified interface for both audio recording and webcam-based facial capture, enabling seamless multimodal data collection for combined analysis.

### 7.5 Questionnaire Module

**Files:** frontend/src/pages/Questionnaire.tsx, backend/app/routes/analysis.py

**Structure:** 15 behavioral questions covering:
- Morning feelings, weekend patterns, music preferences
- Social interactions, self-perception, eating habits
- Task management, future outlook, emotional responses
- Sleep patterns, social media impact, coping mechanisms
- Energy levels, concentration, overall wellbeing

![Questionnaire Page with Answers Filled](screenshots/questionnaire_filled.png)
*Figure 4: Questionnaire Page with All 15 Behavioral Questions Answered — Responses Generate Structured Text for AI Analysis*

**Process:**
1. User answers 15 multiple-choice questions
2. Each response maps to an emotional dimension with a score (-2 to +2)
3. Total wellness score computed (0-100 scale)
4. Responses combined into analyzable text
5. Text model predicts emotion from structured text
6. Detailed report with per-question breakdown generated

### 7.6 Chat Module

**Files:** frontend/src/pages/Chat.tsx, backend/app/routes/analysis.py

**Features:**
- Conversational AI interface with real-time responses
- Optional audio recording and webcam capture within chat
- Server-Sent Events (SSE) for streaming word-by-word responses
- Full conversation transcript analyzed at end of session
- Final comprehensive report generated after chat completion

![Chat Interface](screenshots/chat_interface.png)
*Figure 5: AI Chat Interface with Real-Time Streaming Responses*

### 7.7 Fusion Analysis Module

**Files:** backend/app/ai/fusion.py, frontend/src/pages/FusionAnalysis.tsx

**Model:** Neural network fusion model combining all three modalities

**Process:**
1. User submits text + audio + face input (or selects available modalities)
2. Each modality's model produces probability distributions
3. Fusion model takes combined probability vector as input
4. Neural network learns optimal weighting of each modality
5. Final fused prediction provides more accurate and robust results

**Fallback:** If trained fusion model file is missing, the system uses average-based fusion across available modalities.

![Fusion Analysis Page](screenshots/fusion_analysis.png)
*Figure 3: Multimodal Fusion Analysis Interface*

### 7.8 Dashboard & Visualization Module

![Dashboard](screenshots/dashboard.png)
*Figure 6: Main Dashboard with Emotional Radar Chart and Statistics*

**Files:** frontend/src/pages/Dashboard.tsx, frontend/src/components/ResultsPanel.tsx

**Components:**
- **Stat Cards:** Concern type, confidence percentage, session count, analysis type
- **Emotion Radar Chart:** Radial visualization across all 6 emotion classes
- **Distribution Pie Chart:** Emotional class distribution breakdown
- **Summary Section:** Readable explanation of results with recommendations
- **PDF Export:** Download complete report as PDF

![Analytics Page](screenshots/analytics.png)
*Figure 7: Analytics Dashboard with Historical Trends*

### 7.9 History Module

**Files:** frontend/src/pages/History.tsx, backend/app/routes/history.py

**Features:**
- Lists all past analysis sessions sorted by date (newest first)
- Shows session type, detected emotion, confidence, and timestamp
- Click to open and view full report details
- Delete individual records with confirmation dialog
- Pagination for large histories

![History Page](screenshots/history.png)
*Figure 8: History Module — Past Analysis Sessions*

![Reports Page](screenshots/reports.png)
*Figure 9: Reports Overview with Detailed Analysis View*

![Report Detail Page](screenshots/report_detail.png)
*Figure 13: Detailed Analysis View Showing Per-Question Breakdown, Emotion Classification, and Confidence Scores*

### 7.10 Recommendation & Explainability Module

**Files:** backend/app/services/recommendations.py, backend/app/services/explainability.py, backend/app/services/concern_level.py

**Concern Level:** Computes severity on a scale based on emotion class and confidence
- High concern: Depression, Negative (rule-based escalation)
- Medium concern: Stress, Anxiety
- Low concern: Neutral, Positive

**Recommendations:** Context-aware suggestions based on detected emotion
- Stress: "Practice deep breathing exercises. Take short breaks."
- Anxiety: "Try mindfulness meditation. Write down your worries."
- Depression: "Reach out to a trusted friend. Consider professional help."
- Positive: "Great! Keep maintaining your positive outlook."

**Explainability:** Generates human-readable explanations of why the AI made its prediction, including confidence levels and contributing factors.

---

## 8. IMPLEMENTATION DETAILS

### 8.1 Backend Implementation

The backend is built with FastAPI — a modern Python web framework that automatically generates OpenAPI documentation. Key implementation details:

**Project Structure:**
```
backend/
  app/
    __init__.py
    main.py              # FastAPI app entry point, CORS, middleware
    config.py            # Environment configuration
    database.py          # SQLAlchemy engine and session management
    models.py            # SQLAlchemy ORM models (User, Result)
    schemas.py           # Pydantic request/response validation
    security.py          # JWT creation, verification, password hashing
    dependencies.py      # Auth dependency injection for protected routes
    ai/
      __init__.py
      text_model.py      # DistilBERT text emotion classifier
      audio_model.py     # CNN audio emotion classifier
      face_model.py      # CNN facial emotion classifier
      fusion.py          # Multimodal fusion model
    routes/
      __init__.py
      auth.py            # Registration, login, password reset
      analysis.py        # All analysis endpoints (text, audio, face, chat, fusion, questionnaire)
      history.py         # Result retrieval and deletion
    services/
      __init__.py
      concern_level.py   # Severity computation
      explainability.py  # Prediction explanation generation
      recommendations.py # Personalized wellness suggestions
```

**Key Implementation Patterns:**
- **Dependency Injection:** FastAPI's `Depends()` for auth verification
- **Error Handling:** Try-except blocks with proper HTTP status codes
- **File Upload Safety:** UUID-based filenames to prevent collisions and path traversal
- **FFmpeg Integration:** Subprocess calls for audio format conversion
- **CORS Configuration:** Restricted to frontend origin only
- **Rate Limiting:** Token bucket approach on login endpoint

![Settings Page](screenshots/settings.png)
*Figure 10: User Settings and Profile Management Section*

### 8.2 Frontend Implementation

The frontend is built with React 18 and TypeScript, using Vite for fast development and optimized production builds.

**Project Structure:**
```
frontend/
  src/
    App.tsx              # Root component with routing
    main.tsx             # Application entry point
    index.css            # Global styles with Tailwind
    context/
      AuthContext.tsx    # Authentication state management
    pages/
      Index.tsx          # Landing/home page
      Login.tsx          # User login form
      Register.tsx       # User registration form
      ForgotPassword.tsx # Password recovery
      ResetPassword.tsx  # Password reset
      Dashboard.tsx      # Main dashboard with charts
      Chat.tsx           # AI chat interface
      FusionAnalysis.tsx # Multimodal fusion input
      Questionnaire.tsx  # Behavioral assessment
      History.tsx        # Past results list
      Reports.tsx        # Reports overview
      ReportDetail.tsx   # Single report view
      Analytics.tsx      # Trend analysis
      Settings.tsx       # User settings
      NotFound.tsx       # 404 page
    components/
      AppLayout.tsx      # Main layout wrapper
      AppSidebar.tsx     # Navigation sidebar
      AppTopbar.tsx      # Top navigation bar
      AudioRecorder.tsx  # Voice recording UI
      WebcamCapture.tsx  # Camera capture UI
      ResultsPanel.tsx   # Analysis results display
      StatCard.tsx       # Metric stat cards
      Navbar.tsx         # Navigation bar
      Footer.tsx         # Page footer
      ui/                # 40+ shadcn/ui components
    lib/
      api.ts             # API client with typed methods
      apiClient.ts       # Axios instance with auth interceptor
      utils.ts           # Utility functions
      productInsights.ts # Product insight data
    types/
      api.ts             # TypeScript interfaces for API
    hooks/
      use-mobile.tsx     # Responsive detection hook
      use-toast.ts       # Toast notification hook
```

**Key Implementation Patterns:**
- **Auth Guard:** Protected routes redirect to login if not authenticated
- **API Interceptor:** Axios interceptor automatically attaches JWT token
- **Responsive Design:** Mobile-first with sidebar collapse
- **Real-time Updates:** SSE for streaming chat responses
- **Error Boundaries:** Graceful error handling in components

### 8.3 Database Schema

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Results table
CREATE TABLE results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,          -- 'text', 'audio', 'face', 'chat', 'fusion', 'questionnaire'
    concern VARCHAR(50) NOT NULL,       -- 'Positive', 'Neutral', 'Stress', 'Anxiety', 'Negative', 'Depression'
    confidence FLOAT NOT NULL,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 9. TESTING & RESULTS

### 9.1 Testing Methodology

Comprehensive testing was performed on all system components:

- **Unit Testing:** Individual model inference, authentication, API endpoints
- **Integration Testing:** Frontend-backend communication, database operations
- **End-to-End Testing:** Complete user workflows (register → analyze → view results)
- **API Testing:** All 16+ endpoints tested with valid and invalid inputs

### 9.2 Test Results Summary

| # | Test | Status | Details |
|---|------|--------|---------|
| 1 | Backend Server | ✅ PASS | Running on port 8000 with all routes registered |
| 2 | Health Check | ✅ PASS | All AI models configured: text, audio, face, fusion |
| 3 | User Registration | ✅ PASS | User created with hashed password, JWT token issued |
| 4 | User Login | ✅ PASS | Authentication with valid credentials verified |
| 5 | Text Analysis | ✅ PASS | Detected "Anxiety" @ 78.77% confidence with recommendations |
| 6 | Chat Analysis | ✅ PASS | Detected "Neutral" with contextual AI response |
| 7 | Streaming Chat (SSE) | ✅ PASS | 43 SSE lines streamed in real-time |
| 8 | Questionnaire | ✅ PASS | 15/15 responses analyzed → "Anxiety" @ 51.02%, Score: 20/100 |
| 9 | History Retrieval | ✅ PASS | All user results returned with structured data |
| 10 | Frontend | ✅ PASS | Serving on port 5713 with all pages rendering correctly |

### 9.3 AI Model Performance

| Model | Type | Dataset | Accuracy |
|-------|------|---------|----------|
| Text Emotion | DistilBERT (fine-tuned) | Custom parquet dataset | ~78% |
| Speech Emotion | CNN | RAVDESS | ~75% |
| Facial Emotion | CNN | RAF-DB | ~70% |
| Multimodal Fusion | Neural Network | Combined outputs | ~80% |

### 9.4 Error Handling & Fixes

During development, the following issues were identified and resolved:
- CORS configuration errors — Fixed by proper origin restriction
- Token validation edge cases — Fixed with comprehensive error handling
- File upload collisions — Fixed with UUID-based filenames
- FFmpeg conversion failures — Fixed with better error detection and format validation
- Missing model fallback — Added graceful degradation when model files are absent
- Dashboard rendering issues — Fixed with proper null checks and loading states

---

## 10. CONCLUSION

The AI-Powered Behavioral & Emotional Analysis Platform successfully demonstrates the integration of multiple AI models into a cohesive, full-stack web application for mental wellness monitoring.

**Key Achievements:**

1. **Multimodal Analysis:** The system successfully analyzes emotions through text, voice, facial expressions, and questionnaires — providing a comprehensive view of user emotional state

2. **AI Integration:** Transformer-based NLP, CNN-based audio and facial recognition, and neural network fusion models are seamlessly integrated into the backend

3. **Full-Stack Implementation:** A modern React/TypeScript frontend communicates with a FastAPI Python backend through well-defined REST APIs

4. **Security:** JWT-based authentication with bcrypt password hashing ensures user data is protected

5. **User Experience:** Interactive dashboard with radar charts, pie charts, PDF export, and real-time streaming chat provides an intuitive user experience

6. **Scalability:** Modular architecture allows easy addition of new models, analysis types, or features

The project demonstrates practical application of artificial intelligence in mental health technology, combining deep learning with modern web development to create a tool that can genuinely help users monitor and understand their emotional wellbeing.

---

## 11. FUTURE SCOPE

The BE Project has significant potential for expansion:

### Short-term Enhancements

- **Real-time Emotion Monitoring:** Continuous monitoring through periodic analysis
- **Email/SMS Alerts:** Automatic notifications for high-concern detections
- **Trend Analytics:** Long-term emotional pattern analysis with monthly/quarterly reports
- **Mobile App:** React Native or Flutter mobile application

### Medium-term Features

- **Doctor/Admin Dashboard:** Clinician portal for patient monitoring
- **Peer Support Network:** Anonymous community support features
- **Advanced NLP Models:** GPT-integrated conversational analysis
- **Improved Fusion Training:** Larger multimodal datasets for better fusion accuracy

### Long-term Vision

- **Cloud Deployment:** Scalable cloud infrastructure (AWS, GCP, Azure)
- **Personalized Recommendations:** ML-based adaptive suggestions based on user history
- **Integration with Wearables:** Smartwatch and fitness tracker data integration
- **Multi-language Support:** Emotion analysis in multiple languages
- **Therapeutic Tools:** CBT (Cognitive Behavioral Therapy) exercise integration
- **Clinical Validation:** Partnership with mental health professionals for clinical trials

---

## 12. REFERENCES

1. Devlin, J., Chang, M. W., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding. NAACL-HLT.

2. Livingstone, S. R., & Russo, F. A. (2018). The Ryerson Audio-Visual Database of Emotional Speech and Song (RAVDESS). PLOS ONE.

3. Li, S., Deng, W., & Du, J. (2017). Reliable Crowdsourcing and Deep Locality-Preserving Learning for Expression Recognition in the Wild. CVPR (RAF-DB).

4. Poria, S., Cambria, E., Bajpai, R., & Hussain, A. (2017). A review of affective computing: From unimodal analysis to multimodal fusion. Information Fusion.

5. Sanh, V., Debut, L., Chaumond, J., & Wolf, T. (2019). DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter. arXiv preprint.

6. FastAPI Documentation. https://fastapi.tiangolo.com/

7. React Documentation. https://react.dev/

8. TensorFlow Documentation. https://www.tensorflow.org/

9. SQLAlchemy Documentation. https://www.sqlalchemy.org/

10. Tailwind CSS Documentation. https://tailwindcss.com/docs

---

---

*This project report was prepared as part of the Bachelor of Engineering in Computer Science & Engineering curriculum.*

**[Your Name]**  
**[University/College Name]**  
**[Year: 2025-2026]**
