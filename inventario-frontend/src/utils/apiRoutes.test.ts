import { describe, expect, it } from 'vitest';
import { API_ROUTES, buildApiUrl, normalizeRoute } from './apiRoutes';

describe('API route conventions', () => {
  it('uses the exact backend contract exposed by the live API', () => {
    expect(API_ROUTES.auth.login).toBe('/api/users/login');
    expect(API_ROUTES.materials.buscar).toBe('/api/materials/buscar');
    expect(API_ROUTES.inventory).toBe('/api/inventory');
    expect(API_ROUTES.entries).toBe('/api/entries');
    expect(API_ROUTES.exits).toBe('/api/exits');
    expect(API_ROUTES.warehouses).toBe('/api/warehouses');
  });

  it('builds clean URLs without duplicate slashes', () => {
    expect(buildApiUrl('/api/materials/buscar')).toContain('/api/materials/buscar');
    expect(normalizeRoute('//api///materials//buscar')).toBe('/api/materials/buscar');
  });
});
