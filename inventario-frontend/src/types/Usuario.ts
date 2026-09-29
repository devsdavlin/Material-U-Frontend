export type RolUsuario = 'Administrador' | 'ADMINISTRADOR' | 'Almacenista';

export interface Usuario {
  id_user: string;
  name?: string;
  nombre?: string;
  email: string;
  rol: RolUsuario;
  warehouse_id?: number | null;
  sedeId?: string;
  sedeNombre?: string;
  password?: string;
}