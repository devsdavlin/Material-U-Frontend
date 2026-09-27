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

export const obtenerSalidas = async (limite = 50): Promise<SalidaBackend[]> => {
  const respuesta = await api.get<SalidaBackend[]>(`/exits?limite=${limite}`);
  return respuesta.data || [];
};

export const registrarSalida = async (datos: NuevaSalidaDTO): Promise<unknown> => {
  const respuesta = await api.post('/exits', datos);
  return respuesta.data;
};
