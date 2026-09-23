import { apiFetch } from './api';

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
  const res = await apiFetch(`/entries?limite=${limite}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al obtener entradas');
  }
  return data.entries || [];
};

export const registrarEntrada = async (datos: NuevaEntradaDTO): Promise<any> => {
  const res = await apiFetch('/entries', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al registrar entrada');
  }
  return data;
};
