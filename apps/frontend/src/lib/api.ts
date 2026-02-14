import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

const isProduction = process.env.NODE_ENV === "production";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isProduction
    ? "https://api.smm-league.lovable.app"
    : "http://localhost:3001");

// Create axios instance with default config
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    // If response has our wrapper format, return data directly
    if (response.data?.success !== undefined) {
      return response.data;
    }
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;

    // Handle different error types
    let errorMessage = "An unexpected error occurred";
    let errorCode = "UNKNOWN_ERROR";

    if (response) {
      switch (response.status) {
        case 400:
          errorCode = "BAD_REQUEST";
          errorMessage =
            (response.data as any)?.error?.message || "Invalid request data";
          break;
        case 401:
          errorCode = "UNAUTHORIZED";
          errorMessage = "Session expired. Please login again.";
          // Clear invalid token
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
          }
          break;
        case 403:
          errorCode = "FORBIDDEN";
          errorMessage =
            (response.data as any)?.error?.message ||
            "You don't have permission for this action";
          break;
        case 404:
          errorCode = "NOT_FOUND";
          errorMessage =
            (response.data as any)?.error?.message || "Resource not found";
          break;
        case 422:
          errorCode = "VALIDATION_ERROR";
          errorMessage =
            (response.data as any)?.error?.message || "Validation failed";
          break;
        case 429:
          errorCode = "RATE_LIMIT_EXCEEDED";
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
          errorCode = "INTERNAL_ERROR";
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage =
            (response.data as any)?.error?.message ||
            `Error: ${response.status}`;
      }
    } else if (error.request) {
      errorCode = "NETWORK_ERROR";
      errorMessage =
        "Unable to connect to server. Please check your connection.";
    }

    // Create standardized error object
    const apiError: ApiError = {
      success: false,
      data: null,
      error: {
        code: errorCode,
        message: errorMessage,
        details:
          process.env.NODE_ENV === "development"
            ? (error.response?.data as any)?.error?.details || error.message
            : undefined,
      },
      timestamp: new Date().toISOString(),
    };

    return Promise.reject(apiError);
  },
);

// Helper types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface ApiError {
  success: boolean;
  data: null;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API helper functions with typed responses
export const apiHelpers = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<ApiResponse<T>>(url, config);
    return response.data as T;
  },

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await api.post<ApiResponse<T>>(url, data, config);
    return response.data as T;
  },

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await api.put<ApiResponse<T>>(url, data, config);
    return response.data as T;
  },

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await api.patch<ApiResponse<T>>(url, data, config);
    return response.data as T;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data as T;
  },
};

export default api;
