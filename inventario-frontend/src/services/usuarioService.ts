import { api } from './api';
import { API_ROUTES } from '../utils/apiRoutes';
import type { Usuario } from '../types/Usuario';

const coerceArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.users)) return data.users;
    if (Array.isArray(data.items)) return data.items;
  }
  return [];
};

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
    const respuesta = await api.get(API_ROUTES.users);
    const data = coerceArray(respuesta.data) as any[];
    return data.map(normalizarUsuarioBackend).filter((usuario: Usuario) => usuario.id_user);
  } catch (error) {
    console.warn('No se pudieron cargar los usuarios desde el backend.', error);
    return [];
  }
};

export const crearUsuario = async (payload: {
  username: string;
  email: string;
  password: string;
  rol: string;
  warehouse_id?: number | string | null;
}): Promise<Usuario> => {
  try {
    const respuesta = await api.post(API_ROUTES.users, {
      username: payload.username,
      email: payload.email,
      password: payload.password,
      rol: payload.rol,
      warehouse_id: payload.warehouse_id ?? null,
    });
    return normalizarUsuarioBackend(respuesta.data);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'No se pudo crear el usuario');
  }
};

export const actualizarUsuario = async (): Promise<never> => {
  throw new Error('La edición de usuarios aún no está disponible en el backend actual.');
};

export const eliminarUsuario = async (): Promise<never> => {
  throw new Error('La eliminación de usuarios aún no está disponible en el backend actual.');
};

export default { obtenerUsuariosActivos };
