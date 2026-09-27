import { api } from './api';

const coerceArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
  }
  return [];
};

export type EstadoInventario = 'todos' | 'con_stock' | 'bajo_minimo' | 'agotado';

export interface ItemInventarioBackend {
  id_inventory: number;
  material_id: number;
  material_name: string;
  internal_code: string;
  unit: string;
  category: string;
  activo: boolean;
  current_stock: number;
  min_stock: number;
  estado: 'ok' | 'agotado' | 'bajo_minimo';
}

export interface ResumenInventario {
  total: number;
  con_stock: number;
  agotados: number;
  bajo_minimo: number;
}

export interface RespuestaInventario {
  ok: boolean;
  items: ItemInventarioBackend[];
  resumen: ResumenInventario;
}

export const obtenerMiInventario = async (
  filtroEstado: EstadoInventario = 'todos',
  busqueda = ''
): Promise<RespuestaInventario> => {
  const query = new URLSearchParams();
  if (filtroEstado && filtroEstado !== 'todos') {
    query.set('estado', filtroEstado);
  }
  if (busqueda.trim()) {
    query.set('q', busqueda.trim());
  }
  query.set('limite', '100');

  const respuesta = await api.get<RespuestaInventario | { items?: unknown[]; resumen?: Partial<ResumenInventario>; ok?: boolean }>(`/inventory?${query.toString()}`);
  const data = respuesta.data ?? { ok: true, items: [], resumen: {} };
  const itemsArray = coerceArray(data.items ?? data) as ItemInventarioBackend[];

  return {
    ok: Boolean(data.ok ?? true),
    items: itemsArray,
    resumen: {
      total: Number(data.resumen?.total ?? itemsArray.length),
      con_stock: Number(data.resumen?.con_stock ?? 0),
      agotados: Number(data.resumen?.agotados ?? 0),
      bajo_minimo: Number(data.resumen?.bajo_minimo ?? 0),
    },
  };
};