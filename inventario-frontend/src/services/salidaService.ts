import { api } from './api';

export interface SalidaBackend {
  id_exit: number;
  exit_number: string;
  warehouse_id: number;
  material_id: number;
  cost_center: string | null;
  quantity: number;
  unit_value: number;
  total_value: number;
  exit_date: string | null;
  materials?: {
    material_name: string;
    internal_code: string | null;
    unit: string;
  };
}

export interface NuevaSalidaDTO {
  internal_code: string;
  exit_number: string;
  quantity: number;
  unit_value: number;
  cost_center: string;
  exit_date?: string; // YYYY-MM-DD
}

// El backend responde: { ok, exits: [...], pagination }
export const obtenerSalidas = async (
  limite = 50,
  warehouseId?: number
): Promise<SalidaBackend[]> => {
  const respuesta = await api.get<{ exits?: SalidaBackend[] }>('/exits', {
    params: { limit: limite, ...(warehouseId ? { warehouse_id: warehouseId } : {}) },
  });
  const exits = respuesta.data?.exits;
  return Array.isArray(exits) ? exits : [];
};

export const registrarSalida = async (
  datos: NuevaSalidaDTO,
  warehouseId?: number
): Promise<unknown> => {
  const respuesta = await api.post('/exits', datos, {
    params: warehouseId ? { warehouse_id: warehouseId } : undefined,
  });
  return respuesta.data;
};