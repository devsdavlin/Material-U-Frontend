import { describe, expect, it, vi } from 'vitest';
import { API_ROUTES, buildApiUrl, normalizeRoute } from './apiRoutes';

describe('API route conventions', () => {
  it('uses the exact backend contract exposed by the live API', () => {
    expect(API_ROUTES.auth.login).toBe('/users/login');
    expect(API_ROUTES.materials.buscar).toBe('/materials/buscar');
    expect(API_ROUTES.inventory).toBe('/inventory');
    expect(API_ROUTES.entries).toBe('/entries');
    expect(API_ROUTES.exits).toBe('/exits');
    expect(API_ROUTES.warehouses).toBe('/warehouses');
  });

  it('builds clean URLs without duplicate slashes', () => {
    expect(buildApiUrl('/materials/buscar')).toContain('/materials/buscar');
    expect(normalizeRoute('//materials///buscar//')).toBe('/materials/buscar');
  });

  it('falls back to the Render backend when VITE_API_URL is missing', () => {
    vi.stubEnv('VITE_API_URL', '');

    expect(buildApiUrl('/users/login')).toBe(
      'https://material-u-backend.onrender.com/users/login'
    );

    vi.unstubAllEnvs();
  });
});
