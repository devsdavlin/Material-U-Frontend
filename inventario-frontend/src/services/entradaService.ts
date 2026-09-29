import { api } from './api';

export interface EntradaBackend {
  id_entry: number;
  entry_number: string;
  warehouse_id: number;
  material_id: number;
  provider?: string | null;
  quantity: number;
  unit_value: number;
  total_value: number;
  entry_date: string | null;
  materials?: {
    material_name: string;
    internal_code: string | null;
    unit: string;
  };
}

export interface NuevaEntradaDTO {
  internal_code: string;
  entry_number: string;
  quantity: number;
  unit_value: number;
  provider?: string;
  entry_date?: string; // YYYY-MM-DD
}

// El backend responde: { ok, entries: [...], pagination }
export const obtenerEntradas = async (
  limite = 50,
  warehouseId?: number
): Promise<EntradaBackend[]> => {
  const respuesta = await api.get<{ entries?: EntradaBackend[] }>('/entries', {
    params: { limit: limite, ...(warehouseId ? { warehouse_id: warehouseId } : {}) },
  });
  const entries = respuesta.data?.entries;
  return Array.isArray(entries) ? entries : [];
};

export const registrarEntrada = async (
  datos: NuevaEntradaDTO,
  warehouseId?: number
): Promise<unknown> => {
  const respuesta = await api.post('/entries', datos, {
    params: warehouseId ? { warehouse_id: warehouseId } : undefined,
  });
  return respuesta.data;
};