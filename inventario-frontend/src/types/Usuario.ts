export type RolUsuario = 'ADMINISTRADOR' | 'ENCARGADO_SEDE';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  sedeId?: string;
}