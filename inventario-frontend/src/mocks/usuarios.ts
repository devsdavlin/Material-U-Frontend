import type { Usuario } from '../types/Usuario';

export const MOCK_USUARIOS: Usuario[] = [
  {
    id_user: 'u1',
    name: 'Administrador General',
    email: 'admin@empresa.com',
    password: 'admin123',
    rol: 'Administrador',
    warehouse_id: 1,
  },
  {
    id_user: 'u2',
    name: 'Encargado',
    email: 'almacenista.prueba@gmail.com',
    password: 'Almacen123',
    rol: 'Almacenista',
    warehouse_id: 1,
  },
];