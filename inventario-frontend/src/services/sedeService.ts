import { api } from './api';
import type { Sede as SedeTipo } from '../types/Sede';

export type Sede = SedeTipo & {
  id: string;
  nombre: string;
  ubicacion?: string;
  descripcion?: string;
};

const STORAGE_KEY_SEDE_SELECCIONADA = 'inventario_sede_seleccionada';

const normalizarSedeBackend = (raw: any): Sede => {
  const id = String(
    raw?.id_warehouse ?? raw?.warehouse_id ?? raw?.id ?? raw?.warehouseId ?? raw?.id_sede ?? ''
  );

  return {
    id: id || '0',
    nombre: String(raw?.nombre ?? raw?.name ?? raw?.warehouse_name ?? raw?.nombre_sede ?? 'Sede'),
    ubicacion: String(raw?.ubicacion ?? raw?.address ?? raw?.direccion ?? raw?.location ?? ''),
  };
};

export const normalizarSedeId = (valor: string | number | null | undefined): string => {
  const raw = String(valor ?? '').trim().toLowerCase();

  if (!raw) return 's1';
  if (['1', 's1', 'central', 'sede central', 'centro'].includes(raw)) return 's1';
  if (['2', 's2', 'norte', 'sede norte'].includes(raw)) return 's2';
  if (['3', 's3', 'la vega', 'vega', 'sede la vega'].includes(raw)) return 's3';
  if (['4', 's4', 'prueba', 'sede prueba'].includes(raw)) return 's4';

  return raw;
};

export const obtenerSedesActivas = async (): Promise<Sede[]> => {
  try {
    const respuesta = await api.get('/warehouses');
    const data = Array.isArray(respuesta.data) ? respuesta.data : [];
    return data.map(normalizarSedeBackend).filter((sede) => sede.id && sede.id !== '0');
  } catch (error) {
    console.warn('No se pudieron cargar las sedes desde el backend.', error);
    return [];
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
    const respuesta = await api.get(`/warehouses/${id}`);
    return normalizarSedeBackend(respuesta.data);
  } catch {
    return null;
  }
};

export default { obtenerSedesActivas, obtenerSedePorId, guardarSedeSeleccionada, obtenerSedeSeleccionada };
