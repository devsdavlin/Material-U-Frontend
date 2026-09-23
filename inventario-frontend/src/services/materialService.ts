import { apiFetch } from './api';

export interface MaterialBackend {
  id_material: number;
  internal_code: string;
  material_name: string;
  category: string;
  unit: string;
  activo?: boolean;
  min_stock?: number;
}

export interface NuevoMaterialDTO {
  internal_code: string;
  material_name: string;
  category: string;
  unit: string;
}

export const obtenerMateriales = async (busqueda = ''): Promise<MaterialBackend[]> => {
  const query = busqueda ? `?q=${encodeURIComponent(busqueda)}&limite=100` : '?limite=100';
  const res = await apiFetch(`/materials/buscar${query}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al obtener materiales');
  }
  return data.materials || [];
};

export const crearMaterial = async (datos: NuevoMaterialDTO): Promise<MaterialBackend> => {
  const res = await apiFetch('/materials', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al crear material');
  }
  return data.material;
};

export const desactivarMaterial = async (id: number): Promise<void> => {
  const res = await apiFetch(`/materials/${id}/desactivar`, {
    method: 'PATCH',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al desactivar el material');
  }
};