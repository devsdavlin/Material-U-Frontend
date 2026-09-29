import { api } from './api';

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

const RESUMEN_VACIO: ResumenInventario = { total: 0, con_stock: 0, agotados: 0, bajo_minimo: 0 };

// El backend responde: { ok, items, resumen }. Los errores se propagan (no se inventan datos).
export const obtenerMiInventario = async (
  filtroEstado: EstadoInventario = 'todos',
  busqueda = '',
  warehouseId?: number
): Promise<RespuestaInventario> => {
  const respuesta = await api.get<Partial<RespuestaInventario>>('/inventory', {
    params: {
      limite: 200,
      ...(filtroEstado !== 'todos' ? { estado: filtroEstado } : {}),
      ...(busqueda.trim() ? { q: busqueda.trim() } : {}),
      ...(warehouseId ? { warehouse_id: warehouseId } : {}),
    },
  });
  const data = respuesta.data ?? {};
  return {
    ok: Boolean(data.ok ?? true),
    items: Array.isArray(data.items) ? data.items : [],
    resumen: { ...RESUMEN_VACIO, ...(data.resumen ?? {}) },
  };
};