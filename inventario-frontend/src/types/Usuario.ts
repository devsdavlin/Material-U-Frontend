export type RolUsuario = 'Administrador' | 'Almacenista';

export interface Usuario {
  id_user: string;
  name: string;
  email: string;
  rol: RolUsuario;
  warehouse_id?: number | null;
  password?: string;
}