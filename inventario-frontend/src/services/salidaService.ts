import { apiFetch } from './api';

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
  const res = await apiFetch(`/exits?limite=${limite}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al obtener salidas');
  }
  return data.exits || [];
};

export const registrarSalida = async (datos: NuevaSalidaDTO): Promise<any> => {
  const res = await apiFetch('/exits', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al registrar salida');
  }
  return data;
};
