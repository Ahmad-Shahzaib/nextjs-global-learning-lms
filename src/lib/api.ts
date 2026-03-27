// Lightweight UI-only API shim
// This file removes remote API endpoints and network logic so the app
// can run purely as a UI/navigation shell. Networked features are disabled.

// Use API base URL from environment variable, fallback to default
export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/?$/, "/")
    : "https://api.globallearnerseducation.com/api/";

export function resolveStorageUrl(path?: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (typeof window === "undefined") return path.startsWith("/") ? path : `/${path}`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${normalized}`;
}

// Auth token helpers (local-only) — used by `useAuth`
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

export type ApiInit = RequestInit & {
  timeoutMs?: number;
  skipAuthHeader?: boolean;
  token?: string | null;
};

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/* =========================
   In-memory mock data router
   - Provides canned responses for common endpoints used by the UI
   - Supports simple CRUD for lists: GET, POST, PATCH, DELETE
   - Keeps state in module-scope so pages can interact with it
========================= */

// Mock users
const USERS = [
  { id: "u1", full_name: "Alice Johnson", email: "alice@example.com" },
  { id: "u2", full_name: "Bob Smith", email: "bob@example.com" }
];

// Static auth users (email + password) for local UI-only auth
const AUTH_USERS: Array<{
  id: string;
  email: string;
  password: string;
  full_name?: string;
  avatar_url?: string | null;
  is_blocked?: boolean;
  roles?: string[];
}> = [
  {
    id: "admin",
    email: "admin@example.com",
    password: "adminpass",
    full_name: "Site Administrator",
    roles: ["admin"],
    avatar_url: null,
    is_blocked: false,
  },
  {
    id: "student",
    email: "student@example.com",
    password: "studentpass",
    full_name: "Sample Student",
    roles: ["student"],
    avatar_url: null,
    is_blocked: false,
  },
  {
    id: "teacher",
    email: "teacher@example.com",
    password: "teacherpass",
    full_name: "Sample Teacher",
    roles: ["teacher"],
    avatar_url: null,
    is_blocked: false,
  }
];

// Mock assignments
const ASSIGNMENTS: any[] = [
  {
    id: "a1",
    title: "Intro to React",
    course: "Web Dev",
    course_code: "WD101",
    due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    priority: "medium",
    hours_left: 72,
    points: 100,
    description: "Build a small React component",
    status: "pending",
    submitted_date: null,
    grade: null,
    feedback: null,
    attempts: 2,
    custom_deadline: null
  }
];

// Mock submissions
const SUBMISSIONS: any[] = [
  {
    id: "s1",
    assignment_id: "a1",
    user_id: "u1",
    submitted_at: new Date().toISOString(),
    profiles: { full_name: "Alice Johnson", email: "alice@example.com" },
    marks_obtained: null,
    feedback: null,
    submitted_file: null
  }
];

// Mock softwares
const SOFTWARES: any[] = [
  { id: "sw1", title: "Visual Studio Code", description: "Code editor", cover_image_url: null, download_url: "https://code.visualstudio.com/", version: "1.0", category: "Development", created_at: new Date().toISOString() }
];

// Helper: parse path and id
function splitPath(path: string) {
  const cleaned = path.replace(/^\//, "");
  const parts = cleaned.split("/").filter(Boolean);
  return parts;
}

async function delay<T>(value: T, ms = 100) {
  return new Promise<T>(res => setTimeout(() => res(value), ms));
}

export async function apiFetch<T = any>(path: string, options: ApiInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  // If API_BASE_URL is set, use real network request
  if (API_BASE_URL) {
    const url = path.startsWith("http") ? path : API_BASE_URL.replace(/\/$/, "") + (path.startsWith("/") ? path : "/" + path);
    const headers: Record<string, string> = options.headers ? { ...(options.headers as Record<string, string>) } : {};
    // mirror axiosInstance default API key header
    if (!headers['x-api-key']) {
      headers['x-api-key'] = '1234';
    }

    if (!options.skipAuthHeader) {
      const token = options.token || getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const isFormData = options.body instanceof FormData;
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions: RequestInit = {
      ...options,
      method,
      headers,
    };
    // Remove custom fields not valid for fetch
    delete (fetchOptions as any).timeoutMs;
    delete (fetchOptions as any).skipAuthHeader;
    delete (fetchOptions as any).token;
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch { errorData = await response.text(); }
      throw new ApiError(response.statusText, response.status, errorData);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  }
  // ...existing code...
}
