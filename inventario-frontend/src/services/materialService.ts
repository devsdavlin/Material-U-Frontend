import { api } from './api';
import { API_ROUTES } from '../utils/apiRoutes';

const coerceArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.materials)) return data.materials;
  }
  return [];
};

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

const mapMaterialBackendToFrontend = (item: MaterialBackend): Material => ({
  id: String(item.id_material),
  codigo: item.internal_code,
  descripcion: item.material_name,
  unidadMedida: item.unit,
  categoria: item.category,
  stockMinimo: Number(item.min_stock ?? 0),
});

const parseError = (error: unknown, fallback: string): Error => {
  if (error instanceof Error) {
    return new Error(error.message || fallback);
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String((error as { message?: string }).message ?? fallback);
    return new Error(message);
  }

  return new Error(fallback);
};

export const obtenerMateriales = async (): Promise<MaterialBackend[]> => {
  try {
    const respuesta = await api.get<MaterialBackend[]>(`${API_ROUTES.materials.buscar}?q=&limite=50`);
    const data = coerceArray(respuesta.data) as MaterialBackend[];
    return data;
  } catch (error) {
    console.warn('Backend de materiales no disponible.', error);
    return [];
  }
};

export const crearMaterial = async (payload: {
  internal_code: string;
  material_name: string;
  category: string;
  unit: string;
  min_stock?: number;
}): Promise<MaterialBackend> => {
  try {
    const respuesta = await api.post<MaterialBackend>(API_ROUTES.materials.base, {
      ...payload,
      min_stock: payload.min_stock ?? 0,
    });
    return respuesta.data;
  } catch (error) {
    throw parseError(error, 'No se pudo crear el material');
  }
};

export const desactivarMaterial = async (id: number | string): Promise<void> => {
  try {
    await api.patch(`${API_ROUTES.materials.base}/${id}/desactivar`);
  } catch (error) {
    throw parseError(error, 'No se pudo desactivar el material');
  }
};

export const materialService = {
  obtenerTodos: async (): Promise<Material[]> => {
    try {
      const respuesta = await api.get<MaterialBackend[]>(`${API_ROUTES.materials.buscar}?q=&limite=50`);
      const data = coerceArray(respuesta.data) as MaterialBackend[];
      return data.map(mapMaterialBackendToFrontend);
    } catch (error) {
      console.warn('Backend de materiales no disponible.', error);
      return [];
    }
  },

  subirExcel: async (archivo: File): Promise<{ mensaje: string; insertados: number }> => {
    const formData = new FormData();
    formData.append('file', archivo);

    try {
      const respuesta = await api.post('/materials/importar-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return respuesta.data;
    } catch (error) {
      throw parseError(error, 'No se pudo subir el archivo Excel');
    }
  },
};