// ===========================
// Chat & Message Types
// ===========================
export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type ChatMessage = ChatTurn;

// ===========================
// Modality & Analysis Results
// ===========================
export type ModalityResult = {
  emotion: string;
  confidence: number;
  quality?: number;
  notes?: string[];
  probabilities?: number[];
};

export type ExplanationPayload = {
  reasons: string[];
  model_agreement?: string;
  limitations?: string;
};

export type RecommendationPayload = {
  items: string[];
  risk_level?: string;
};

export type AnalysisResult = {
  id?: number;
  type: string;
  emotion?: string;
  concern?: string;
  confidence: number;
  summary?: string;
  final?: ModalityResult;
  modalities?: {
    text?: ModalityResult;
    audio?: ModalityResult;
    face?: ModalityResult;
  };
  weights?: {
    text: number;
    audio: number;
    face: number;
  };
  explanation?: ExplanationPayload;
  recommendations?: RecommendationPayload;
  risk_level?: string;
  wellness_status?: string;
  concern_level?: string;
  severity_color?: string;
  created_at?: string;
  structured_data?: Record<string, unknown> | null;
  ai_response?: string;
};

// ===========================
// Session & History Types
// ===========================
export type SessionReport = {
  id: number;
  type: string;
  emotion?: string;
  concern: string;
  confidence: number;
  summary: string;
  created_at: string;
  explanation?: ExplanationPayload;
  recommendations?: RecommendationPayload;
  risk_level?: string;
  structured_data?: {
    type: string;
    answers?: Record<string, { value: string; label: string }>;
    free_text?: string;
    facial_emotion?: string | null;
    emotion?: string;
    concern_level?: string;
    confidence?: number;
    wellness_status?: string;
    message?: string;
    transcript?: ChatTurn[];
    audio_summary?: string | null;
    turn_count?: number;
    score?: number;
    completion_pct?: number;
    total_answers?: number;
    // Fusion-specific fields
    modalities_used?: string[];
    fusion_weights?: {
      text: number;
      audio: number;
      face: number;
    };
    text_result?: {
      emotion: string;
      confidence: number;
    };
    audio_result?: {
      emotion: string;
      confidence: number;
    };
    face_result?: {
      emotion: string;
      confidence: number;
    };
    fusion_method?: string;
    text?: string;
  } | null;
};

// ===========================
// Authentication Types
// ===========================
export type AuthResponse = {
  id: number;
  name: string;
  email: string;
  token?: string;
  access_token?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

// ===========================
// Analysis Payload Types
// ===========================
export type TextAnalysisPayload = {
  text: string;
};

export type QuestionnairePayload = {
  answers: Record<string, { value: string; label: string }>;
  free_text: string;
  facial_emotion: string | null;
};

export type ChatPayload = {
  message: string;
  transcript: ChatTurn[];
  audio_summary?: string | null;
  facial_emotion?: string | null;
};

export type ChatFinalizePayload = {
  latest_message: string;
  transcript: ChatTurn[];
  audio_summary?: string | null;
  facial_emotion?: string | null;
  audioFile?: File | null;
  faceFile?: File | null;
};

export type ChatEmotionEntry = {
  emotion: string;
  confidence: number;
  concern_level: string;
  timestamp: string;
};

export type ChatMultiModalPayload = {
  message: string;
  transcript: ChatTurn[];
  audioFile?: File | null;
  faceFile?: File | null;
  sessionEmotions?: ChatEmotionEntry[];
};

// ===========================
// History Response Types
// ===========================
export type HistoryResponse = {
  results: SessionReport[];
  total_results: number;
  user_id?: number;
};

export type DeleteResponse = {
  success: boolean;
  id: number;
};

// ===========================
// Forgot / Reset Password Types
// ===========================
export type ForgotPasswordPayload = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export type ResetPasswordResponse = {
  message: string;
};

// ===========================
// API Error Types
// ===========================
export type ApiErrorDetail = string | { msg?: string }[];

export type ApiError = {
  message: string;
  status?: number;
  shouldRetry?: boolean;
};
