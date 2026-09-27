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

  const respuesta = await api.get<RespuestaInventario>(`/inventario?${query.toString()}`);
  return respuesta.data;
};