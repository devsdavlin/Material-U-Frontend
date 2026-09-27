import { api } from './api';
import type { Usuario } from '../types/Usuario';

const normalizarUsuarioBackend = (raw: any): Usuario => {
  const warehouseId = Number(raw?.warehouse_id ?? raw?.warehouseId ?? raw?.warehouse_id ?? 1);
  const sedeId = String(raw?.sedeId ?? raw?.sede_id ?? raw?.warehouse_id ?? raw?.warehouseId ?? '1');

  return {
    id_user: String(raw?.id_user ?? raw?.id ?? raw?.user_id ?? raw?.idUser ?? ''),
    name: String(raw?.name ?? raw?.nombre ?? raw?.username ?? raw?.full_name ?? ''),
    nombre: String(raw?.nombre ?? raw?.name ?? raw?.username ?? raw?.full_name ?? ''),
    email: String(raw?.email ?? ''),
    rol: (String(raw?.rol ?? raw?.role ?? 'Almacenista') as Usuario['rol']) || 'Almacenista',
    warehouse_id: Number.isFinite(warehouseId) ? warehouseId : 1,
    sedeId: sedeId,
    password: raw?.password ? String(raw.password) : undefined,
  };
};

export const obtenerUsuariosActivos = async (): Promise<Usuario[]> => {
  try {
    const respuesta = await api.get('/users');
    const data = Array.isArray(respuesta.data) ? respuesta.data : Array.isArray(respuesta.data?.data) ? respuesta.data.data : [];
    return data.map(normalizarUsuarioBackend).filter((usuario: Usuario) => usuario.id_user);
  } catch (error) {
    console.warn('No se pudieron cargar los usuarios desde el backend.', error);
    return [];
  }
};

export const crearUsuario = async (): Promise<never> => {
  throw new Error('La creación de usuarios aún no está disponible en el backend actual.');
};

export const actualizarUsuario = async (): Promise<never> => {
  throw new Error('La edición de usuarios aún no está disponible en el backend actual.');
};

export const eliminarUsuario = async (): Promise<never> => {
  throw new Error('La eliminación de usuarios aún no está disponible en el backend actual.');
};

export default { obtenerUsuariosActivos };
