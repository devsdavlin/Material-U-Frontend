import type { Usuario } from '../types/Usuario';

export const MOCK_USUARIOS: Usuario[] = [
  {
    id: 'u1',
    nombre: 'Administrador General',
    email: 'admin@empresa.com',
    rol: 'ADMINISTRADOR',
  },
  {
    id: 'u2',
    nombre: 'Carlos Encargado',
    email: 'lavega@empresa.com',
    rol: 'ENCARGADO_SEDE',
    sedeId: '1',
  },
];