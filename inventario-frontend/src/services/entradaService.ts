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
  entry_date: string;
  internal_code?: string;
  materials?: {
    material_name: string;
    internal_code: string;
    unit: string;
  };
}

export interface NuevaEntradaDTO {
  internal_code: string;
  entry_number: string;
  quantity: number;
  unit_value: number;
  provider?: string;
  entry_date?: string;
}

const coerceArray = (payload: unknown): EntradaBackend[] => {
  if (Array.isArray(payload)) return payload as EntradaBackend[];
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data as EntradaBackend[];
    if (Array.isArray(data.items)) return data.items as EntradaBackend[];
  }
  return [];
};

export const obtenerEntradas = async (limite = 50): Promise<EntradaBackend[]> => {
  try {
    const respuesta = await api.get<EntradaBackend[] | { data?: EntradaBackend[]; items?: EntradaBackend[]; message?: string }>(`/entries?limite=${limite}`);
    return coerceArray(respuesta.data);
  } catch (error) {
    console.warn('No se pudieron cargar las entradas:', error);
    return [];
  }
};

export const registrarEntrada = async (datos: NuevaEntradaDTO): Promise<unknown> => {
  const respuesta = await api.post('/entries', datos);
  return respuesta.data;
};
