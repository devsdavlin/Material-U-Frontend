import { api } from './api';

export interface SalidaBackend {
  id_exit: number;
  exit_number: string;
  warehouse_id: number;
  material_id: number;
  cost_center: string;
  quantity: number;
  unit_value: number;
  total_value: number;
  exit_date: string;
  internal_code?: string;
  materials?: {
    material_name: string;
    internal_code: string;
    unit: string;
  };
}

export interface NuevaSalidaDTO {
  internal_code: string;
  exit_number: string;
  quantity: number;
  unit_value: number;
  cost_center: string;
  exit_date?: string;
}

const coerceArray = (payload: unknown): SalidaBackend[] => {
  if (Array.isArray(payload)) return payload as SalidaBackend[];
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data as SalidaBackend[];
    if (Array.isArray(data.items)) return data.items as SalidaBackend[];
  }
  return [];
};

export const obtenerSalidas = async (limite = 50): Promise<SalidaBackend[]> => {
  try {
    const respuesta = await api.get<SalidaBackend[] | { data?: SalidaBackend[]; items?: SalidaBackend[]; message?: string }>(`/exits?limite=${limite}`);
    return coerceArray(respuesta.data);
  } catch (error) {
    console.warn('No se pudieron cargar las salidas:', error);
    return [];
  }
};

export const registrarSalida = async (datos: NuevaSalidaDTO): Promise<unknown> => {
  const respuesta = await api.post('/exits', datos);
  return respuesta.data;
};
