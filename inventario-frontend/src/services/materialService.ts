import { api } from './api';

export interface Material {
  id: string;
  codigo: string;
  descripcion: string;
  unidadMedida: string;
  categoria: string;
  stockMinimo: number;
}

export interface MaterialBackend {
  id_material: number;
  internal_code: string;
  material_name: string;
  unit: string;
  category: string;
  min_stock: number;
}

export const obtenerMateriales = async (): Promise<MaterialBackend[]> => {
  const respuesta = await api.get<MaterialBackend[]>('/materiales');
  return respuesta.data;
};

export const crearMaterial = async (payload: {
  internal_code: string;
  material_name: string;
  category: string;
  unit: string;
  min_stock?: number;
}): Promise<MaterialBackend> => {
  const respuesta = await api.post<MaterialBackend>('/materiales', payload);
  return respuesta.data;
};

export const desactivarMaterial = async (id: number | string): Promise<void> => {
  await api.delete(`/materiales/${id}`);
};

export const materialService = {
  obtenerTodos: async (): Promise<Material[]> => {
    const respuesta = await api.get<MaterialBackend[]>('/materiales');
    return respuesta.data.map((item) => ({
      id: String(item.id_material),
      codigo: item.internal_code,
      descripcion: item.material_name,
      unidadMedida: item.unit,
      categoria: item.category,
      stockMinimo: item.min_stock,
    }));
  },

  subirExcel: async (archivo: File): Promise<{ mensaje: string; insertados: number }> => {
    const formData = new FormData();
    formData.append('file', archivo);

    const respuesta = await api.post('/materiales/migrar-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return respuesta.data;
  },
};