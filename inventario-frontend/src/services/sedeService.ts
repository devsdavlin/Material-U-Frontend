import { api } from './api';

export interface Sede {
  id: string;
  nombre: string;
  descripcion?: string;
}

export const obtenerSedes = async (): Promise<Sede[]> => {
  const resp = await api.get<Sede[]>('/warehouses');
  return resp.data;
};

export const obtenerSedePorId = async (id: string): Promise<Sede | null> => {
  try {
    const resp = await api.get<Sede>(`/warehouses/${id}`);
    return resp.data;
  } catch {
    return null;
  }
};

export default { obtenerSedes, obtenerSedePorId };
