const normalizeBaseUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.replace(/\/+$/, '').replace(/\/api$/, '');
};

export const API_ROUTES = {
  auth: {
    login: '/api/users/login',
  },
  materials: {
    buscar: '/api/materials/buscar',
    base: '/api/materials',
  },
  inventory: '/api/inventory',
  entries: '/api/entries',
  exits: '/api/exits',
  warehouses: '/api/warehouses',
  dashboard: '/api/dashboard/mi-sede',
  money: '/api/money/mi-sede',
} as const;

export const buildApiUrl = (route: string) => {
  const normalizedBase = normalizeBaseUrl(import.meta.env.VITE_API_URL || '');
  const cleanRoute = normalizeRoute(route.startsWith('/') ? route : `/${route}`);
  const routeWithApiPrefix = cleanRoute.startsWith('/api/') ? cleanRoute : `/api${cleanRoute}`;
  return `${normalizedBase}${routeWithApiPrefix}`;
};

export const normalizeRoute = (route: string) => route.replace(/\/+/g, '/');
