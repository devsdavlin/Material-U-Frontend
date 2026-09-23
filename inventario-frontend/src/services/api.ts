// API configuration with environment variable
// Vite will replace VITE_API_BASE_URL at build time. If not set, defaults to empty string (relative URLs).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('inventario_token');
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  // Only add Authorization header if we have a token (real or dummy) and it's not already set
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  return fetch(url, {
    ...options,
    headers,
  });
};
