"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useAuthStore } from "./auth-store";
import { api, ApiError } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "BRAND" | "INFLUENCER" | "ADMIN";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: "BRAND" | "INFLUENCER",
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async (authToken: string) => {
    try {
      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data);
    } catch (err: any) {
      console.error("Failed to fetch user:", err);
      // Token might be expired
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      await fetchUser(storedToken);
    }
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { user: userData, token: authToken } = response.data;

      localStorage.setItem("token", authToken);
      setToken(authToken);
      setUser(userData);
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: "BRAND" | "INFLUENCER",
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post("/auth/register", {
          email,
          password,
          name,
          role,
        });
        const { user: userData, token: authToken } = response.data;

        localStorage.setItem("token", authToken);
        setToken(authToken);
        setUser(userData);
      } catch (err: any) {
        const message =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Registration failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
