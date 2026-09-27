export const STORAGE_KEYS = {
  user: 'inventario_user',
  token: 'inventario_token',
} as const;

export const getStoredAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.token) || localStorage.getItem('token');
};

export const persistAuthToken = (token: string | null) => {
  if (typeof window === 'undefined') return;

  if (token) {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem('token', token);
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem('token');
};
