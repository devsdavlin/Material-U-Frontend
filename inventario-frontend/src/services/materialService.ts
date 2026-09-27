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

const FALLBACK_MATERIALES_BACKEND: MaterialBackend[] = [
  {
    id_material: 1,
    internal_code: 'MAT-001',
    material_name: 'Cemento Portland',
    unit: 'bolsa',
    category: 'Construcción',
    min_stock: 10,
  },
  {
    id_material: 2,
    internal_code: 'MAT-002',
    material_name: 'Ladrillo hueco',
    unit: 'unidad',
    category: 'Cerámica',
    min_stock: 20,
  },
  {
    id_material: 3,
    internal_code: 'MAT-003',
    material_name: 'Varilla de acero',
    unit: 'kg',
    category: 'Metales',
    min_stock: 15,
  },
];

const FALLBACK_MATERIALES_FRONTEND: Material[] = FALLBACK_MATERIALES_BACKEND.map((item) => ({
  id: String(item.id_material),
  codigo: item.internal_code,
  descripcion: item.material_name,
  unidadMedida: item.unit,
  categoria: item.category,
  stockMinimo: Number(item.min_stock ?? 0),
}));

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
    const respuesta = await api.get<MaterialBackend[]>(`/materials/buscar?limite=50`);
    return respuesta.data ?? FALLBACK_MATERIALES_BACKEND;
  } catch (error) {
    console.warn('Backend de materiales no disponible. Usando datos de respaldo.', error);
    return FALLBACK_MATERIALES_BACKEND;
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
    const respuesta = await api.post<MaterialBackend>('/materials', {
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
    await api.delete(`/materials/${id}`);
  } catch (error) {
    throw parseError(error, 'No se pudo desactivar el material');
  }
};

export const materialService = {
  obtenerTodos: async (): Promise<Material[]> => {
    try {
      const respuesta = await api.get<MaterialBackend[]>(`/materials/buscar?limite=50`);
      return (respuesta.data ?? FALLBACK_MATERIALES_BACKEND).map(mapMaterialBackendToFrontend);
    } catch (error) {
      console.warn('Backend de materiales no disponible. Usando fallback local.', error);
      return FALLBACK_MATERIALES_FRONTEND;
    }
  },

  subirExcel: async (archivo: File): Promise<{ mensaje: string; insertados: number }> => {
    const formData = new FormData();
    formData.append('file', archivo);

    try {
      const respuesta = await api.post('/materials/migrar-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return respuesta.data;
    } catch (error) {
      throw parseError(error, 'No se pudo subir el archivo Excel');
    }
  },
};