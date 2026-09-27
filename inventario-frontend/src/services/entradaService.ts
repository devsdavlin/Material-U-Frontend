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

export const obtenerEntradas = async (limite = 50): Promise<EntradaBackend[]> => {
  const respuesta = await api.get<EntradaBackend[]>(`/entries?limite=${limite}`);
  return respuesta.data || [];
};

export const registrarEntrada = async (datos: NuevaEntradaDTO): Promise<unknown> => {
  const respuesta = await api.post('/entries', datos);
  return respuesta.data;
};
