import { describe, expect, it } from 'vitest';
import { obtenerSedesActivas } from './sedes';

describe('sedes', () => {
  it('incluye la sede de La Vega', () => {
    const sedes = obtenerSedesActivas();
    expect(sedes.some((sede) => sede.nombre.toLowerCase().includes('vega'))).toBe(true);
  });
});
