/**
 * Centralized Axios instance for all API calls.
 *
 * Features:
 *  - Base URL resolved from VITE_API_BASE_URL env variable (falls back to production URL)
 *  - Auth token automatically attached from the Redux store via lazy store injection
 *  - Exponential-backoff retry (up to 2 retries) for network errors and 5xx responses
 *
 * Usage in thunks:
 *   import apiClient from '@/lib/axiosInstance';
 *   const response = await apiClient.get('/v2/some/endpoint');
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { RootState } from '../store/redux/store';

// ---------------------------------------------------------------------------
// Base URL — single source of truth across the entire app
// ---------------------------------------------------------------------------
export const API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/?$/, '')
    : 'https://api.globallearnerseducation.com/api';

// ---------------------------------------------------------------------------
// Lazy store injection
// Keeps this module free of circular dependencies.
// Call `injectStore(store)` once after the Redux store is created.
// ---------------------------------------------------------------------------
type StoreRef = { getState: () => RootState };
let storeRef: StoreRef | null = null;

export function injectStore(store: StoreRef): void {
  storeRef = store;
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '1234',
  },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token from Redux auth state
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storeRef?.getState().auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor — retry on network errors / 5xx with exponential backoff
// ---------------------------------------------------------------------------
const MAX_RETRIES = 2;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { __retryCount?: number };
    const status = error.response?.status;
    const isRetryable = !status || (status >= 500 && status < 600);

    if (!config || !isRetryable) {
      return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount ?? 0;

    if (config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      const delayMs = Math.min(1_500 * 2 ** (config.__retryCount - 1), 4_000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return apiClient(config);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
