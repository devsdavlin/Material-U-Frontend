import type { Usuario } from '../types/Usuario';

export const MOCK_USUARIOS: Usuario[] = [
  {
    id: 'u1',
    nombre: 'Administrador General',
    email: 'admin@empresa.com',
    password: 'admin123',
    rol: 'ADMINISTRADOR',
  },
  {
    id: 'u2',
    nombre: 'Encargado',
    email: 'encargado@empresa.com',
    password: 'encargado123',
    rol: 'ENCARGADO_SEDE',
    sedeId: '1',
  },
];