import axios from 'axios';
import { setOfflineMode } from '../utils/offlineMode';
import { STORAGE_KEYS } from '../utils/storage';

export const DEFAULT_API_BASE_URL = 'https://material-u-backend.onrender.com/api';

const normalizeBaseUrl = (value = ''): string => {
  const trimmed = value.trim();
  const cleaned = trimmed.replace(/\/+$/, '');
  if (!cleaned) return DEFAULT_API_BASE_URL;
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL || '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token) || localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  setOfflineMode(false);
  return config;
});

api.interceptors.response.use(
  (response) => {
    setOfflineMode(false);
    return response;
  },
  (error) => {
    setOfflineMode(true);
    return Promise.reject(error);
  }
);

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const normalizedEndpoint = endpoint.trim().replace(/\/+$/, '');
  const safeEndpoint = normalizedEndpoint.startsWith('/api')
    ? normalizedEndpoint.replace(/^\/api/, '')
    : normalizedEndpoint;
  const url = `${API_BASE_URL}${safeEndpoint.startsWith('/') ? safeEndpoint : `/${safeEndpoint}`}`;

  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem(STORAGE_KEYS.token) || localStorage.getItem('token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
};