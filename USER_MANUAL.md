# BE Project — User Manual

## AI-Powered Behavioral & Emotional Analysis Platform

> **Version:** 2.0  
> **Last Updated:** May 2026  
> **Base URL:** `http://localhost:5173` (Frontend) | `http://localhost:8000` (Backend API)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [The Landing Page](#3-the-landing-page)
4. [Account Management](#4-account-management)
5. [Workspace Overview](#5-workspace-overview)
6. [Dashboard](#6-dashboard)
7. [Smart Questionnaire](#7-smart-questionnaire)
8. [AI Chat Workspace](#8-ai-chat-workspace)
9. [Fusion Analysis Engine](#9-fusion-analysis-engine)
10. [Session History](#10-session-history)
11. [Reports](#11-reports)
12. [Analytics](#12-analytics)
13. [Settings](#13-settings)
14. [Troubleshooting](#14-troubleshooting)
15. [Appendix: Emotion Classes](#15-appendix-emotion-classes)

---

## 1. Introduction

The **BE (Behavioral & Emotional) Analysis Platform** is a multi-modal AI system that analyzes human emotions through **text**, **voice**, and **facial expressions**. It uses a fusion intelligence engine to combine signals from all three modalities into a unified behavioral assessment.

### Key Capabilities

| Capability | Description |
|---|---|
| **Text Emotion Analysis** | NLP-powered sentiment detection using transformer models (DistilBERT) |
| **Audio Emotion Analysis** | Voice tone and speech pattern analysis via MFCC feature extraction |
| **Facial Expression Analysis** | Real-time micro-expression detection through deep CNN classifiers |
| **Fusion AI Engine** | Weighted multi-modal combination for unified emotional insight |
| **Explainable AI** | Transparent reasoning with detection factors and modality agreement |
| **Behavioral Analytics** | Longitudinal tracking of emotional trends and stability scores |
| **PDF Report Generation** | Professional downloadable reports with charts and recommendations |

### Emotion Classes Detected

The system detects **6 emotional states**:

| Emotion | Color Code | Description |
|---|---|---|
| Positive | `#10B981` (Green) | Content, happy, optimistic |
| Neutral | `#0EA5E9` (Blue) | Calm, balanced, neither positive nor negative |
| Stress | `#F59E0B` (Amber) | Overwhelmed, pressured, tense |
| Anxiety | `#4338CA` (Indigo) | Worried, nervous, apprehensive |
| Negative | `#64748B` (Slate) | Sad, discouraged, unpleasant |
| Depression | `#EF4444` (Red) | Hopeless, withdrawn, deeply low |

---

## 2. Getting Started

### System Requirements

- **Browser:** Google Chrome 90+, Firefox 88+, Edge 90+, or Safari 14+
- **Camera:** Required for facial emotion analysis (optional)
- **Microphone:** Required for voice/audio analysis (optional)
- **Internet:** Required for API communication with the backend server

### Starting the Application

1. **Start the backend server:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
   The API is now available at `http://localhost:8000`.

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   The web application opens at `http://localhost:5173`.

3. **Open your browser** and navigate to `http://localhost:5173`.

### Quick Start Path

1. **Create an account** via the Register page
2. **Complete the Smart Questionnaire** (15 questions + optional webcam)
3. **View your results** on the Dashboard
4. **Explore the AI Chat** for a conversational experience
5. **Try Fusion Analysis** to combine text, audio, and face signals
6. **Download reports** from the Reports page

---

## 3. The Landing Page

When you first visit the application at `http://localhost:5173`, you arrive at the landing page (`/`). This page introduces the platform's capabilities and provides navigation to the main features.

### Sections

| Section | Description |
|---|---|
| **Hero** | Platform tagline, key stats (4 AI Modules, 6 Emotion Classes, 3 Input Modalities), and CTA buttons |
| **Platform Capabilities** | 6 trust cards highlighting core strengths |
| **About the Platform** | Explanation of why multi-modal emotional AI matters |
| **Complete Feature Set** | 10 feature cards covering all analysis modes |
| **How It Works** | 5-step workflow from input to insight |
| **Live Dashboard Preview** | Mock dashboard showing stat cards and charts |
| **Explainable AI** | Example behavioral insight with detection factors |
| **Research & Innovation** | Key metrics (accuracy, inference time, etc.) |
| **Security & Privacy** | JWT authentication, data protection |
| **Call to Action** | Final CTA to create an account or log in |

### Navigation Bar

The top navigation bar contains:
- **Logo** — Links to home
- **Desktop links:** Features, Workflow, Dashboard, Research (anchor links to sections)
- **Auth buttons:** Log in / Get Started (for guests) or Open Console / Logout (for authenticated users)
- **Hamburger menu** (mobile): Collapsible navigation

---

## 4. Account Management

### 4.1 Registration

**Route:** `/register`

To create a new account:

1. Click **"Get Started"** or navigate to `/register`
2. Fill in the registration form:
   - **Full Name** — Your first and last name
   - **Email** — A valid email address
   - **Password** — Minimum 8 characters with strength indicator
   - **Confirm Password** — Must match password
3. Click **"Create account"**

> **Note:** The password strength meter shows 5 levels: Too weak, Weak, Fair, Strong, Excellent. For security, aim for "Strong" or "Excellent."

After successful registration, you are automatically logged in and redirected to the Dashboard.

### 4.2 Login

**Route:** `/login`

To sign in to an existing account:

1. Click **"Log in"** or navigate to `/login`
2. Enter your **Email** and **Password**
3. Toggle **"Remember me on this device"** to save your email
4. Click **"Sign in"**

> **Troubleshooting:** If login fails, check your email/password or use the "Forgot password?" link.

### 4.3 Forgot Password

**Route:** `/forgot-password`

If you forget your password:

1. Click **"Forgot password?"** on the login page
2. Enter your registered email address
3. Click **"Send reset instructions"**
4. Check your email for a secure reset link (valid for 30 minutes)

### 4.4 Reset Password

**Route:** `/reset-password?token=...`

After receiving the reset email:

1. Click the link in your email (opens the reset page with a token)
2. Enter your **New password** (must be at least 8 characters with uppercase, lowercase, and number)
3. **Confirm** the password
4. Click **"Reset password"**
5. You'll be redirected to login after success

### 4.5 Logout

You can log out from:
- The **Sidebar** — Click the Logout icon at the bottom
- The **Landing page navbar** — Click "Logout" when logged in
- **Settings page** — Click "Logout" in the Danger zone

---

## 5. Workspace Overview

After authentication, all features are accessible through the **App Layout**, which includes:

### Sidebar Navigation

The sidebar (collapsible) provides access to:

| Section | Pages |
|---|---|
| **Workspace** | Dashboard, Questionnaire, AI Chat, Fusion Analysis, Reports, History, Analytics |
| **Account** | Settings, Logout |

- Click the **hamburger icon** (top-left) or use the sidebar toggle to collapse/expand
- The currently active page is highlighted in blue
- A **user profile card** at the bottom shows your name and email

### Top Bar

The top bar provides:

| Element | Description |
|---|---|
| **Sidebar Toggle** | Collapse/expand the sidebar |
| **Search Bar** | Search across sessions, reports, and emotions |
| **Secure Session Badge** | Indicates authenticated session |
| **AI Ready Badge** | Indicates AI models are available |
| **Theme Toggle** | Switch between light and dark modes |
| **Notifications Bell** | Notification center (placeholder) |
| **User Profile Badge** | Shows your initial, name, and email |

---

## 6. Dashboard

**Route:** `/app`

The Dashboard is your main hub after login. It shows your latest analysis results and provides quick access to all workspace features.

### Empty State (First Visit)

If you haven't run any analysis yet, the dashboard shows:
- A welcome message with your name
- Quick-start buttons for **Questionnaire** and **AI Chat**

### Dashboard with Data

Once you have analysis results, the dashboard displays:

#### Header Section

- Latest analysis type and timestamp
- "History" button to view all sessions
- "Download PDF" button to export the current report

#### Stats Cards (4-card grid)

| Card | Description |
|---|---|
| **Detected Emotion** | The primary emotion detected in the latest session |
| **Concern Level** | The severity category of the detected emotion |
| **Confidence** | Prediction certainty percentage |
| **Sessions** | Total number of sessions in your history |

#### Module-Specific Detail Card

Depending on your latest analysis type, you'll see additional details:
- **Fusion Analysis:** Shows Text, Audio, and Face signal results with confidence scores
- **Questionnaire:** Shows wellness score with progress bar, completion percentage, and answer count
- **AI Chat:** Shows conversation turn count and latest message preview

#### Charts

| Chart | Description |
|---|---|
| **Emotion Radar** | Radar chart showing the detected emotion values across all 6 classes |
| **Emotion Distribution** | Horizontal stacked bar chart showing session counts per emotion type |

#### AI Recommendation

A contextual wellness recommendation based on your detected emotion.

#### Summary

The detailed analysis summary from your latest session.

---

## 7. Smart Questionnaire

**Route:** `/app/questionnaire`

The Smart Questionnaire is a structured 15-question behavioral assessment that screens for emotional distress across multiple life domains.

### How It Works

The questionnaire evaluates **15 life domains**:

| # | Domain | Question Theme |
|---|--------|----------------|
| 1 | Morning | How you feel waking up |
| 2 | Weekend | Weekend experience recall |
| 3 | Music | Music or silence preference |
| 4 | Messages | Emotional response to messages |
| 5 | Mirror | Self-perception when looking in mirror |
| 6 | Meals | Eating habits and appetite |
| 7 | Task | Task initiation and productivity |
| 8 | Stranger | Social comfort with strangers |
| 9 | Future | Outlook on the future |
| 10 | Compliment | Reaction to compliments |
| 11 | Sleep | Sleep quality and patterns |
| 12 | Cry | Frequency of feeling like crying |
| 13 | Anger | Irritability and anger levels |
| 14 | Social | Social interaction preferences |
| 15 | Hope | Overall sense of hope |

### Taking the Assessment

1. Navigate to **Questionnaire** from the sidebar
2. Read each question and select the option that best describes you
3. Each question has 3-5 answer choices (e.g., "Dread the day" / "Okay" / "Eager" / "Neutral")
4. After answering all 15 questions, the **"Analyze"** button becomes active
5. Optionally turn on your **webcam** for simultaneous facial analysis during the questionnaire
6. Click **"Analyze Responses"** to submit

### Results

After submission, you'll see:

- **Emotion Badge** — The primary detected emotion with color coding
- **Confidence Meter** — How confident the model is in its prediction
- **Severity Score** — A 0-100 scale indicating emotional distress level
- **Wellness Score** — A cumulative score based on your answers (shown as a progress bar)
- **Score Breakdown** — 
  - Score out of max score
  - Percentage
  - Number of questions answered
- **Answers Review** — A textual summary of your response patterns
- **Probabilities** — A distribution chart showing all 6 emotion classes
- **Recommendations** — Personalized wellness recommendations

> **Tip:** For best results, be honest and take your time on each question. The system provides more accurate insights with genuine responses.

---

## 8. AI Chat Workspace

**Route:** `/app/chat`

The AI Chat Workspace is a conversational interface where you can talk to the AI assistant about your feelings and receive real-time emotional analysis.

### Features

| Feature | Description |
|---|---|
| **Real-time Chat** | Conversational AI that responds with emotional awareness |
| **Multi-modal Input** | Type messages, record audio, or capture webcam images |
| **Live Emotion Tracking** | Emotions are detected from your messages and displayed in real-time |
| **Session Emotions Timeline** | Track how your emotions evolve during the conversation |
| **Word-by-word Streaming** | AI responses stream in real-time via SSE (Server-Sent Events) |

### Using the Chat

1. **Type a message** in the input box at the bottom
2. Press **Enter** or click the **Send** button
3. The AI responds with empathetic, contextual replies
4. Your **detected emotion** is shown above the input area
5. The **Session Emotions** section tracks emotion changes throughout the conversation

### Additional Input Methods

#### Audio Recording

1. Click the **microphone icon** to start recording
2. Speak naturally — the recorder captures your voice
3. Click the **stop icon** to end recording
4. The audio is uploaded and analyzed for emotional content
5. Results appear in the chat as analysis messages

> **Tip:** Find a quiet environment for best audio analysis accuracy.

#### Webcam Capture

1. Click the **camera icon** to open the webcam
2. Position your face within the frame
3. Click **"Capture Image"** to take a snapshot
4. The image is analyzed for facial emotion detection
5. Results appear in the chat

> **Tip:** Ensure good lighting and face the camera directly for best results.

### Understanding Chat Results

Each analysis message includes:
- **Emotion detected** with confidence score
- **Severity score** (0-100)
- **Summary** of what was detected
- **Probabilities** across all 6 emotion classes
- **Recommendations** for well-being

---

## 9. Fusion Analysis Engine

**Route:** `/app/fusion-analysis`

The Fusion Analysis Engine is the platform's most advanced feature, combining **text**, **voice**, and **facial expression** inputs into a unified multi-modal emotional assessment.

### Why Fusion?

Single-modality analysis can be misleading. For example:
- A person might smile (face = Positive) while describing a stressful situation (text = Stress)
- Voice tone might reveal anxiety even when words sound neutral

Fusion AI resolves these conflicts by weighting each modality based on confidence, producing a more accurate holistic result.

### How to Use Fusion Analysis

1. Navigate to **Fusion Analysis** from the sidebar
2. You have three input panels:

#### Text Input
- Type or paste text describing how you feel
- The text is analyzed by a DistilBERT NLP model
- Minimum recommended length: 1-2 sentences

#### Audio Input
- Click the **"Start Recording"** button
- Speak for a few seconds about your current state
- Click **"Stop Recording"**
- The audio is processed via MFCC feature extraction

#### Webcam / Face Input
- Click **"Open Camera"** to activate your webcam
- Position your face clearly in the frame
- Click **"Capture Image"** to take a snapshot
- The image is analyzed by the CNN-based face model (48x48 grayscale)

### Submitting Fusion

1. Provide at least **one** input modality (more = better accuracy)
2. Click **"Analyze Fusion"**
3. The system combines all available signals

### Fusion Results

After analysis, you'll see:

- **Fused Emotion** — The unified prediction across all modalities
- **Confidence** — Overall prediction confidence (higher with more modalities)
- **Fused Probabilities** — Combined probability distribution across 6 emotion classes
- **Modalities Used** — Which input types contributed to the result
- **Signal Breakdown** — Individual results from text, audio, and face analyses
- **Summary** — An explainable AI summary explaining the reasoning
- **Recommendations** — Personalized wellness suggestions

> **Tip:** For the most accurate results, provide all three input modalities. The fusion engine works best when it has complete data from text, voice, and face.

---

## 10. Session History

**Route:** `/app/history`

The History page shows a chronological list of all your analysis sessions.

### Viewing History

Each entry displays:

| Column | Description |
|---|---|
| **Type** | Analysis type (Badge: Text, Audio, Face, Chat, Fusion, Questionnaire) |
| **Concern** | Primary detected emotion |
| **Confidence** | Prediction confidence percentage |
| **Summary** | Brief analysis summary (first ~50 characters) |
| **Date** | Timestamp of when the analysis was performed |
| **Actions** | View (eye icon) and Delete (trash icon) buttons |

### Sorting & Searching

- **Sort by date** — Click the "Date" column header to toggle ascending/descending
- **Filter by type** — Use the type dropdown to filter by analysis modality
- **Search** — Use the search bar to find specific sessions by keyword
- **Pagination** — Navigate through pages of results with Previous/Next buttons

### Viewing a Session

Click the **eye icon** to view the full details of any session. You'll be redirected to the Report Detail page.

### Deleting a Session

Click the **trash icon** and confirm deletion. This action cannot be undone.

---

## 11. Reports

**Route:** `/app/reports` and `/app/reports/:id`

### Reports List

The Reports page lists all your analysis sessions in a card-based layout.

Each report card shows:
- **Type icon** — Visual indicator of the analysis type
- **Primary emotion** — Detected emotion with color badge
- **Confidence** — Percentage bar
- **Severity** — Color-coded severity level (Low, Moderate, High, Severe)
- **Date** — When the analysis was performed
- **"View Report"** button — Opens the full report detail

### Report Detail

**Route:** `/app/reports/:id`

The full report page provides:

- **Header** — Analysis type, emotion badge, confidence, severity
- **Metadata** — Session ID, timestamp
- **Probabilities Distribution** — A horizontal bar chart showing all 6 emotion class probabilities
- **Severity Indicator** — Visual gauge from Low to Severe
- **Explainable AI Section** —
  - Key detection factors and their contributions
  - Modality agreement level (for fusion analyses)
  - Confidence variance across modalities
- **Recommendations** — Prioritized wellness recommendations (High/Medium/Low)
- **Concern Level** — Detailed explanation of the detected concern level
- **Summary** — Full analysis summary text

### Downloading a Report (PDF)

1. Open any report detail page
2. Click the **"Download PDF"** button in the top-right corner
3. A professional PDF document is generated client-side with:
   - Full analysis results
   - Probability charts
   - Severity gauge
   - Recommendations
   - Brand header with logo and date
4. The PDF downloads automatically to your computer

> **Tip:** PDF reports are generated entirely in your browser using jsPDF — no data is sent to a server for report generation.

---

## 12. Analytics

**Route:** `/app/analytics`

The Analytics page provides longitudinal insights into your emotional well-being over time, powered by the explainable AI services.

### Analytics Dashboard

| Section | Description |
|---|---|
| **Total Sessions** | Overall count of all analyses performed |
| **Emotion Trends** | Timeline showing how your dominant emotion changes over time |
| **Concern Distribution** | Pie chart showing the proportion of each emotion across all sessions |
| **Modality Usage** | Breakdown of which analysis types you use most |
| **Confidence Trends** | How prediction confidence varies across your sessions |
| **Stability Score** | A measure of emotional consistency over time |
| **Weekly Activity** | Chart showing your analysis frequency by week |
| **Risk Summary** | Overview of potential emotional concerns detected |

### Empty State

If you have fewer than 2 sessions, the analytics will show:
- A friendly message about needing more data
- Links to start using Questionnaire or AI Chat

### Data Interpretation

- **Stability Score (0-100):** Higher scores indicate more consistent emotional patterns. Low scores may suggest emotional variability worth discussing with a professional.
- **Emotion Trends:** Look for patterns — persistent Anxiety or Depression signals may warrant professional attention.
- **Modality Usage:** Using multiple analysis types provides richer data for the system.

> **Note:** Analytics are for informational purposes only. They do not constitute a medical diagnosis.

---

## 13. Settings

**Route:** `/app/settings`

The Settings page lets you manage your account and preferences.

### Profile

- **Name** — Edit your display name
- **Email** — View your registered email (cannot be changed here)
- **Join Date** — When your account was created

### Appearance

- **Theme Toggle** — Switch between Light and Dark mode
  - Light mode: Clean white background with dark text
  - Dark mode: Dark background with light text (easier on the eyes)
  - Click "Switch to Dark Mode" / "Switch to Light Mode" to toggle

### Account Details

- **Account ID** — Your unique user identifier
- **Total Sessions** — How many analyses you've performed
- **Member Since** — Account creation date

### App Information

- **App Version** — Current version of the platform
- **Tech Stack** — Technologies powering the application

### Danger Zone

- **Clear Session** — Clears all application cache (keeps server data intact)
- **Logout** — Immediately logs you out of the application

> **Warning:** Clearing your session will remove local data but does not delete your account or analysis history from the server.

---

## 14. Troubleshooting

### Common Issues and Solutions

| Issue | Possible Cause | Solution |
|---|---|---|
| **Cannot log in** | Incorrect credentials | Use "Forgot password" to reset |
| **Webcam not working** | Browser permissions blocked | Allow camera access in browser settings |
| **Microphone not working** | Browser permissions blocked | Allow microphone access in browser settings |
| **Analysis fails** | Server not running | Ensure backend is running on port 8000 |
| **Analysis fails** | Unsupported file format | Use WAV/MP3 for audio, JPG/PNG for images |
| **Slow response** | Large audio file | Keep audio recordings under 30 seconds |
| **Low confidence score** | Unclear input | Provide clearer text, better lighting, or clearer speech |
| **PDF not downloading** | Pop-up blocker | Disable pop-up blocker for this site |
| **Page not loading** | Server connection | Check backend status at `/api/health` |
| **"Token expired" error** | Session timeout | Log out and log back in |

### Browser Camera/Microphone Permissions

**Chrome:**
1. Click the lock icon in the address bar
2. Find "Camera" and "Microphone"
3. Set to "Allow"
4. Reload the page

**Firefox:**
1. Click the camera/mic icon in the address bar
2. Select "Allow"
3. Reload the page

**Edge:**
1. Click the lock icon in the address bar
2. Set Camera and Microphone to "Allow"
3. Reload the page

**Safari:**
1. Go to Safari > Settings > Websites
2. Find Camera and Microphone
3. Set to "Allow" for this site

### Backend Status Check

To verify the backend is running, open `http://localhost:8000/api/health` in your browser. A healthy response looks like:

```json
{
  "status": "healthy",
  "models": {
    "text": "loaded",
    "audio": "loaded",
    "face": "loaded",
    "fusion": "configured",
    "chat": "available"
  }
}
```

If you see an error or no response, start the backend server:

```bash
cd backend
uvicorn app.main:app --reload
```

---

## 15. Appendix: Emotion Classes

### Detailed Class Descriptions

| Class | Typical Indicators | Common Keywords |
|---|---|---|
| **Positive** | Happiness, satisfaction, optimism, joy | "great", "happy", "wonderful", "excited" |
| **Neutral** | Calm, balanced, composed, neutral | "okay", "fine", "alright", "neutral" |
| **Stress** | Overwhelmed, pressured, tense, burnout | "stressed", "overwhelmed", "pressure" |
| **Anxiety** | Worried, nervous, apprehensive, restless | "anxious", "worried", "nervous", "fear" |
| **Negative** | Sad, discouraged, unpleasant, down | "sad", "bad", "unhappy", "disappointed" |
| **Depression** | Hopeless, withdrawn, empty, despair | "depressed", "hopeless", "empty", "worthless" |

### Severity Scale

| Score Range | Level | Color | Description |
|---|---|---|---|
| 0-20 | Low | Green | Minimal emotional concern |
| 21-40 | Moderate | Amber | Mild emotional concern, monitor situation |
| 41-60 | High | Orange | Significant emotional concern, consider support |
| 61-80 | Severe | Red | Serious emotional distress, seek professional help |
| 81-100 | Critical | Dark Red | Critical emotional state, immediate professional attention recommended |

### Confidence Interpretation

| Confidence Range | Interpretation |
|---|---|
| 0.90 - 1.00 | Very High — Model is highly certain |
| 0.70 - 0.89 | High — Prediction is reliable |
| 0.50 - 0.69 | Moderate — Prediction is plausible |
| 0.30 - 0.49 | Low — Consider running another analysis |
| 0.00 - 0.29 | Very Low — Input may be unclear |

### Modality Details

| Modality | Model Type | Input Format | Processing Time |
|---|---|---|---|
| Text | DistilBERT (Hugging Face) | Raw text string | ~100-300ms |
| Audio | DNN (TensorFlow/Keras) | WAV (16kHz mono) | ~200-500ms |
| Face | CNN (TensorFlow/Keras) | 48x48 grayscale image | ~150-400ms |
| Fusion | DNN + Weighted Averaging | Combined probability vectors | ~50-100ms |

### Data Privacy Notes

- All analysis results are stored securely in the database
- Audio and image files are processed in memory and not permanently stored
- JWT tokens expire after a configurable time (default: 30 minutes)
- Passwords are hashed using bcrypt (12 rounds)
- Your data is isolated — you can only see your own results

---

## Support

For technical support or feature requests, contact the development team.

---

*© 2026 BE Project — AI-Powered Behavioral & Emotional Analysis Platform*
