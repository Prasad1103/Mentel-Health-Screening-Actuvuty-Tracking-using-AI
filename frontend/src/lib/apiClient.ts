import axios, { AxiosInstance, AxiosError } from "axios";
import { STORAGE_TOKEN_KEY } from "@/context/AuthContext";

export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
    timeout: 30000,
  });

  // Request interceptor: Inject JWT token
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: Handle errors and token expiration
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem("be.auth.user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();
