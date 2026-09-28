import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as apiModule from './api';
import { obtenerEntradas } from './entradaService';
import { obtenerSalidas } from './salidaService';

describe('backend array guards', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns an empty list when entries endpoint responds with an object error payload', async () => {
    vi.spyOn(apiModule.api, 'get').mockResolvedValue({
      data: { message: 'Forbidden' },
    } as any);

    await expect(obtenerEntradas(50)).resolves.toEqual([]);
  });

  it('returns an empty list when exits endpoint responds with an object error payload', async () => {
    vi.spyOn(apiModule.api, 'get').mockResolvedValue({
      data: { message: 'Forbidden' },
    } as any);

    await expect(obtenerSalidas(50)).resolves.toEqual([]);
  });
});
