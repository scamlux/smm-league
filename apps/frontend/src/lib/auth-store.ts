import { create } from "zustand";
import { api } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "BRAND" | "INFLUENCER" | "ADMIN";
}

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (
    email: string,
    password: string,
    name: string,
    role: "BRAND" | "INFLUENCER",
  ) => Promise<User | null>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set: any) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/auth/login", { email, password });
      const payload = response?.data ? response.data : response;
      const { user, token } = payload;
      if (!user || !token) {
        throw new Error("Invalid login response");
      }
      localStorage.setItem("token", token);
      set({ user, token, loading: false });
      return user;
    } catch (error: any) {
      set({
        error:
          error?.error?.message || error?.message || "Login failed",
        loading: false,
      });
      return null;
    }
  },

  register: async (
    email: string,
    password: string,
    name: string,
    role: "BRAND" | "INFLUENCER",
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        name,
        role,
      });
      const payload = response?.data ? response.data : response;
      const { user, token } = payload;
      if (!user || !token) {
        throw new Error("Invalid register response");
      }
      localStorage.setItem("token", token);
      set({ user, token, loading: false });
      return user;
    } catch (error: any) {
      set({
        error:
          error?.error?.message || error?.message || "Registration failed",
        loading: false,
      });
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  checkAuth: () => {
    const token = localStorage.getItem("token");
    if (token) {
      set({ token });
    }
  },
}));
