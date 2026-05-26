import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import {
  loginUser,
  registerUser,
  type AuthResponse,
} from "@/lib/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

type AuthResult = Promise<{
  ok: boolean;
  error?: string;
}>;

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => AuthResult;
  register: (
    name: string,
    email: string,
    password: string
  ) => AuthResult;
  logout: () => void;
}

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

// Shared token key — must stay in sync with apiClient.ts
const STORAGE_TOKEN_KEY = "token";
const STORAGE_USER = "be.auth.user";
export { STORAGE_TOKEN_KEY };

const readStoredUser = (): AuthUser | null => {
  const raw =
    localStorage.getItem(
      STORAGE_USER
    );

  if (!raw) return null;

  try {
    const parsed =
      JSON.parse(raw);

    return {
      id: Number(parsed.id),
      name:
        parsed.name || "User",
      email:
        parsed.email || "",
    };
  } catch {
    localStorage.removeItem(
      STORAGE_USER
    );

    return null;
  }
};

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(
      readStoredUser
    );

  const login = async (
    email: string,
    password: string
  ) => {
    try {
      const data: AuthResponse =
        await loginUser({
          email,
          password,
        });

      const authUser: AuthUser = {
        id: data.id,
        name:
          data.name || "User",
        email:
          data.email || email,
      };

      setUser(authUser);

      localStorage.setItem(
        STORAGE_USER,
        JSON.stringify(authUser)
      );

      const token = data.token || data.access_token;
      if (token) {
        localStorage.setItem(
          STORAGE_TOKEN_KEY,
          token
        );
      }

      return { ok: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed";
      return {
        ok: false,
        error: message,
      };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      const data: AuthResponse =
        await registerUser({
          name,
          email,
          password,
        });

      const authUser: AuthUser = {
        id: data.id,
        name:
          data.name || name,
        email:
          data.email || email,
      };

      setUser(authUser);

      localStorage.setItem(
        STORAGE_USER,
        JSON.stringify(authUser)
      );

      const token = data.token || data.access_token;
      if (token) {
        localStorage.setItem(
          STORAGE_TOKEN_KEY,
          token
        );
      }

      return { ok: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Register failed";
      return {
        ok: false,
        error: message,
      };
    }
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem(
      STORAGE_USER
    );

    localStorage.removeItem(
      STORAGE_TOKEN_KEY
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated:
          !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx =
    useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}
