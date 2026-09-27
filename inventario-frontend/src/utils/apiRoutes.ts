export const DEFAULT_API_BASE_URL = 'https://material-u-backend.onrender.com';

const normalizeBaseUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_API_BASE_URL;
  return trimmed.replace(/\/+$/, '').replace(/\/api$/, '');
};

export const API_ROUTES = {
  auth: {
    login: '/users/login',
  },
  materials: {
    buscar: '/materials/buscar',
    base: '/materials',
  },
  inventory: '/inventory',
  entries: '/entries',
  exits: '/exits',
  warehouses: '/warehouses',
  dashboard: '/dashboard/mi-sede',
  money: '/money/mi-sede',
} as const;

export const buildApiUrl = (route: string) => {
  const normalizedBase = normalizeBaseUrl(import.meta.env.VITE_API_URL || '');
  const cleanRoute = normalizeRoute(route.startsWith('/') ? route : `/${route}`);
  return `${normalizedBase}${cleanRoute}`;
};

export const normalizeRoute = (route: string) => {
  const cleaned = (route || '').trim().replace(/\/+/g, '/').replace(/\/+$/, '');
  return cleaned || '/';
};
