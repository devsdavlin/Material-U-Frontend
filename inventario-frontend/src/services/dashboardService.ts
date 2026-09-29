import { api } from './api';

export interface DashboardBackend {
  sede: { id_warehouse: number; warehouse_name: string };
  resumen: { total: number; con_stock: number; agotados: number; bajo_minimo: number };
  criticos: Array<{
    material_id: number;
    material_name: string;
    internal_code: string | null;
    unit: string;
    current_stock: number;
    min_stock: number;
    estado: 'agotado' | 'bajo_minimo' | 'ok';
  }>;
  ultimosMovimientos: Array<{
    tipo: 'entrada' | 'salida';
    numero: string;
    fecha: string | null;
    material_name: string;
    internal_code: string | null;
    quantity: number;
    total_value: number;
  }>;
}

export interface DineroBackend {
  sede: { id_warehouse: number; warehouse_name: string };
  plataEntradas: number;
  plataSalidas: number;
  resultante: number;
}

const params = (warehouseId?: number) => (warehouseId ? { warehouse_id: warehouseId } : undefined);

export const obtenerDashboard = async (warehouseId?: number): Promise<DashboardBackend> => {
  const r = await api.get<DashboardBackend>('/dashboard/mi-sede', { params: params(warehouseId) });
  return r.data;
};

export const obtenerDinero = async (warehouseId?: number): Promise<DineroBackend> => {
  const r = await api.get<DineroBackend>('/money/mi-sede', { params: params(warehouseId) });
  return r.data;
};