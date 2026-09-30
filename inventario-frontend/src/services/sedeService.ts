import { api } from './api';
import { API_ROUTES } from '../utils/apiRoutes';
import type { Sede as SedeTipo } from '../types/Sede';
import { getErrorMessage } from '../utils/apiError';

export type Sede = SedeTipo & {
  id: string;
  nombre: string;
  ubicacion?: string;
  descripcion?: string;
  activo?: boolean;
};

const STORAGE_KEY_SEDE_SELECCIONADA = 'inventario_sede_seleccionada';

const coerceArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.warehouses)) return data.warehouses;
    if (Array.isArray(data.sedes)) return data.sedes;
    if (Array.isArray(data.items)) return data.items;
  }
  return [];
};

const normalizarSedeBackend = (raw: any): Sede => {
  const id = String(
    raw?.id_warehouse ?? raw?.warehouse_id ?? raw?.id ?? raw?.warehouseId ?? raw?.id_sede ?? ''
  );

  return {
    id: id || '0',
    nombre: String(raw?.nombre ?? raw?.name ?? raw?.warehouse_name ?? raw?.nombre_sede ?? 'Sede'),
    ubicacion: String(raw?.ubicacion ?? raw?.address ?? raw?.direccion ?? raw?.location ?? ''),
    activo: raw?.activo !== false,
  };
};

export const normalizarSedeId = (valor: string | number | null | undefined): string => {
  const raw = String(valor ?? '').trim().toLowerCase();

  if (!raw) return 's1';
  if (['3', 's3', 'la vega', 'vega', 'sede la vega'].includes(raw)) return 's3';
  if (['4', 's4', 'prueba', 'sede prueba'].includes(raw)) return 's4';

  return raw;
};

export const obtenerSedesActivas = async (): Promise<Sede[]> => {
  try {
    const respuesta = await api.get(API_ROUTES.warehouses);
    const data = coerceArray(respuesta.data) as any[];
    return data.map(normalizarSedeBackend).filter((sede) => sede.id && sede.id !== '0' && sede.activo !== false);
  } catch (error) {
    console.warn('No se pudieron cargar las sedes.', error);
    return [];
  }
};

export const crearSede = async (nombre: string): Promise<Sede> => {
  try {
    const respuesta = await api.post(API_ROUTES.warehouses, {
      warehouse_name: nombre.trim(),
    });
    return normalizarSedeBackend(respuesta.data?.sede ?? respuesta.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo crear la sede'));
  }
};

export const obtenerSedeSeleccionada = (): Sede | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEDE_SELECCIONADA);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Sede>;
    if (!parsed?.id || !parsed?.nombre) return null;

    return {
      id: String(parsed.id),
      nombre: String(parsed.nombre),
      ubicacion: String(parsed.ubicacion ?? ''),
    };
  } catch {
    return null;
  }
};

export const guardarSedeSeleccionada = (sede: Pick<Sede, 'id' | 'nombre' | 'ubicacion'>): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(
    STORAGE_KEY_SEDE_SELECCIONADA,
    JSON.stringify({
      id: String(sede.id),
      nombre: String(sede.nombre),
      ubicacion: String(sede.ubicacion ?? ''),
    })
  );
};

export const limpiarSedeSeleccionada = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_SEDE_SELECCIONADA);
};

export const obtenerSedePorId = async (id: string): Promise<Sede | null> => {
  try {
    const respuesta = await api.get(`${API_ROUTES.warehouses}/${id}`);
    return normalizarSedeBackend(respuesta.data);
  } catch {
    return null;
  }
};

export default { obtenerSedesActivas, obtenerSedePorId, guardarSedeSeleccionada, obtenerSedeSeleccionada, crearSede };