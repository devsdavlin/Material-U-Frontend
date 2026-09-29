import { api } from './api';
import { API_ROUTES } from '../utils/apiRoutes';
import type { Usuario } from '../types/Usuario';
import { getErrorMessage } from '../utils/apiError';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizarUsuarioBackend = (raw: any): Usuario => {
  const wid = raw?.warehouse_id ?? raw?.warehouseId ?? null;
  const warehouseId = wid === null || wid === undefined ? null : Number(wid);

  return {
    id_user: String(raw?.id_user ?? raw?.id ?? raw?.user_id ?? raw?.idUser ?? ''),
    name: String(raw?.name ?? raw?.nombre ?? raw?.username ?? ''),
    nombre: String(raw?.nombre ?? raw?.name ?? raw?.username ?? ''),
    email: String(raw?.email ?? ''),
    rol: (String(raw?.rol ?? raw?.role ?? 'Almacenista') as Usuario['rol']) || 'Almacenista',
    warehouse_id: warehouseId,
    sedeId: warehouseId === null ? undefined : String(warehouseId),
    sedeNombre: raw?.warehouse?.warehouse_name ? String(raw.warehouse.warehouse_name) : undefined,
  };
};

export const obtenerUsuariosActivos = async (): Promise<Usuario[]> => {
  try {
    const respuesta = await api.get(API_ROUTES.users);
    const data = coerceArray(respuesta.data) as unknown[];
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
      ...(payload.warehouse_id ? { warehouse_id: Number(payload.warehouse_id) } : {}),
    });
    return normalizarUsuarioBackend(respuesta.data?.user ?? respuesta.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo crear el usuario'));
  }
};

// Solo se envían los campos que se quieren cambiar (contraseña vacía = no se cambia).
export const actualizarUsuario = async (
  id: string,
  cambios: {
    username?: string;
    email?: string;
    password?: string;
    warehouse_id?: number | null;
  }
): Promise<Usuario> => {
  try {
    const respuesta = await api.put(`${API_ROUTES.users}/${id}`, cambios);
    return normalizarUsuarioBackend(respuesta.data?.user ?? respuesta.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo actualizar el usuario'));
  }
};

export const eliminarUsuario = async (id: string): Promise<void> => {
  try {
    await api.delete(`${API_ROUTES.users}/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo eliminar el usuario'));
  }
};

export default { obtenerUsuariosActivos, crearUsuario, actualizarUsuario, eliminarUsuario };