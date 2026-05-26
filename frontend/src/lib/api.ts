import { AxiosError } from "axios";
import { apiClient } from "./apiClient";
import { STORAGE_TOKEN_KEY } from "@/context/AuthContext";
import * as ApiTypes from "@/types/api";

// ===========================
// Error Handling
// ===========================

const getErrorMessage = (err: unknown): string => {
  if (err instanceof AxiosError) {
    const detail = err.response?.data?.detail;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
      return detail[0]?.msg || "Request failed";
    }

    return err.message || "Request failed";
  }

  if (err instanceof Error) return err.message;

  return "Request failed";
};

// ===========================
// Authentication APIs
// ===========================

export const registerUser = async (data: ApiTypes.RegisterPayload): Promise<ApiTypes.AuthResponse> => {
  try {
    const res = await apiClient.post<ApiTypes.AuthResponse>("/api/register", data);
    const token = res.data.token || res.data.access_token;

    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
    }

    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const loginUser = async (data: ApiTypes.LoginPayload): Promise<ApiTypes.AuthResponse> => {
  try {
    const res = await apiClient.post<ApiTypes.AuthResponse>("/api/login", data);
    const token = res.data.token || res.data.access_token;

    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
    }

    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

// ===========================
// Text Analysis APIs
// ===========================

export const analyzeText = async (text: string): Promise<ApiTypes.AnalysisResult> => {
  try {
    const res = await apiClient.post<ApiTypes.AnalysisResult>("/api/analyze-text", null, {
      params: { text },
    });

    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

// ===========================
// Questionnaire APIs
// ===========================

export const analyzeQuestionnaire = async (
  payload: ApiTypes.QuestionnairePayload
): Promise<ApiTypes.AnalysisResult> => {
  try {
    const res = await apiClient.post<ApiTypes.AnalysisResult>(
      "/api/analyze-questionnaire",
      payload
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

// ===========================
// Chat APIs
// ===========================

export const analyzeChat = async (payload: ApiTypes.ChatPayload): Promise<ApiTypes.AnalysisResult> => {
  try {
    const res = await apiClient.post<ApiTypes.AnalysisResult>("/api/analyze-chat", payload);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const analyzeChatMultiModal = async (
  payload: ApiTypes.ChatMultiModalPayload
): Promise<ApiTypes.AnalysisResult> => {
  try {
    const form = new FormData();
    form.append("message", payload.message);
    form.append("transcript_json", JSON.stringify(payload.transcript));
    form.append(
      "session_emotions_json",
      JSON.stringify(payload.sessionEmotions || [])
    );

    if (payload.audioFile) {
      form.append("audio", payload.audioFile);
    }

    if (payload.faceFile) {
      form.append("face_image", payload.faceFile);
    }

    const res = await apiClient.post<ApiTypes.AnalysisResult>(
      "/api/analyze-chat-multimodal",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const finalizeChat = async (
  payload: ApiTypes.ChatFinalizePayload
): Promise<ApiTypes.AnalysisResult> => {
  try {
    const formData = new FormData();
    formData.append("latest_message", payload.latest_message);
    formData.append("transcript_json", JSON.stringify(payload.transcript));

    if (payload.audio_summary) {
      formData.append("audio_summary", payload.audio_summary);
    }

    if (payload.facial_emotion) {
      formData.append("facial_emotion", payload.facial_emotion);
    }

    if (payload.audioFile) {
      formData.append("audio", payload.audioFile);
    }

    if (payload.faceFile) {
      formData.append("face_image", payload.faceFile);
    }

    const res = await apiClient.post<ApiTypes.AnalysisResult>(
      "/api/finalize-chat",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

// ===========================
// Audio & Face APIs
// ===========================

export const analyzeAudio = async (
  file: File,
  persist = true
): Promise<ApiTypes.AnalysisResult> => {
  try {
    const form = new FormData();
    form.append("audio", file);

    const res = await apiClient.post<ApiTypes.AnalysisResult>(
      "/api/analyze-audio",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        params: { persist },
      }
    );

    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const analyzeFace = async (
  file: File,
  persist = true
): Promise<ApiTypes.AnalysisResult> => {
  try {
    const form = new FormData();
    form.append("image", file);

    const res = await apiClient.post<ApiTypes.AnalysisResult>(
      "/api/analyze-face",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        params: { persist },
      }
    );

    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

// ===========================
// Fusion Analysis APIs
// ===========================

export const analyzeFusion = async (
  text: string,
  audioFile: File,
  imageFile: File
): Promise<ApiTypes.AnalysisResult> => {
  try {
    const form = new FormData();
    form.append("text", text);
    form.append("audio", audioFile);
    form.append("face", imageFile);

    const res = await apiClient.post<ApiTypes.AnalysisResult>(
      "/api/analyze-fusion",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

// ===========================
// History & Session APIs
// ===========================

export const getHistory = async (): Promise<ApiTypes.HistoryResponse> => {
  try {
    const res = await apiClient.get<ApiTypes.HistoryResponse>("/api/history");
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const listSessions = async (_userId?: number): Promise<ApiTypes.SessionReport[]> => {
  const data = await getHistory();
  return data.results || [];
};

export const getLatest = async (): Promise<ApiTypes.SessionReport | null> => {
  const data = await getHistory();
  return data.results && data.results.length > 0 ? data.results[0] : null;
};

export const getSessionById = async (id: number): Promise<ApiTypes.SessionReport | null> => {
  const sessions = await listSessions();
  return sessions.find((session) => session.id === id) || null;
};

export const deleteSession = async (id: number): Promise<ApiTypes.DeleteResponse> => {
  try {
    const res = await apiClient.delete<ApiTypes.DeleteResponse>(`/api/history/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

// ===========================
// Utility APIs
// ===========================

export const analyze = async (payload: { text?: string; message?: string }): Promise<ApiTypes.AnalysisResult> => {
  const text = payload?.text || payload?.message || "No input";
  return await analyzeText(text);
};

// Export types for backwards compatibility
export * from "@/types/api";

// ===========================
// Forgot / Reset Password APIs
// ===========================

export const forgotPassword = async (
  payload: ApiTypes.ForgotPasswordPayload
): Promise<ApiTypes.ForgotPasswordResponse> => {
  try {
    const res = await apiClient.post<ApiTypes.ForgotPasswordResponse>(
      "/api/forgot-password",
      payload
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const resetPassword = async (
  payload: ApiTypes.ResetPasswordPayload
): Promise<ApiTypes.ResetPasswordResponse> => {
  try {
    const res = await apiClient.post<ApiTypes.ResetPasswordResponse>(
      "/api/reset-password",
      payload
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

// Default export
export default apiClient;
