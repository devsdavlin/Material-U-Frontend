export const DEFAULT_API_BASE_URL = 'https://material-u-backend.onrender.com/api';

const normalizeBaseUrl = (value: string): string => {
  const trimmed = value.trim();
  const cleaned = trimmed.replace(/\/+$/, '');
  if (!cleaned) return DEFAULT_API_BASE_URL;
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
};

export const API_ROUTES = {
  auth: {
    login: '/users/login',
  },
  users: '/users',
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
  const routeWithoutApiPrefix = cleanRoute.startsWith('/api')
    ? cleanRoute.replace(/^\/api/, '')
    : cleanRoute;
  return `${normalizedBase}${routeWithoutApiPrefix}`;
};

export const normalizeRoute = (route: string) => {
  const cleaned = (route || '').trim().replace(/\/+/g, '/').replace(/\/+$/, '');
  return cleaned || '/';
};
