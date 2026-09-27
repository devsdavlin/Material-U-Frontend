import type { Usuario } from '../types/Usuario';

let usuarioStore: Usuario[] = [
  {
    id_user: 'u1',
    name: 'Administrador General',
    email: 'admin@empresa.com',
    password: 'admin123',
    rol: 'Administrador',
    warehouse_id: 1,
    sedeId: 's1',
  },
  {
    id_user: 'u2',
    name: 'Encargado Central',
    email: 'almacenista.central@gmail.com',
    password: 'Almacen123',
    rol: 'Almacenista',
    warehouse_id: 1,
    sedeId: 's1',
  },
  {
    id_user: 'u3',
    name: 'Encargado Norte',
    email: 'almacenista.norte@gmail.com',
    password: 'Almacen123',
    rol: 'Almacenista',
    warehouse_id: 2,
    sedeId: 's2',
  },
  {
    id_user: 'u4',
    name: 'Almacenista Prueba',
    email: 'almacenista.prueba@gmail.com',
    password: 'Almacen123',
    rol: 'Almacenista',
    warehouse_id: 4,
    sedeId: 's4',
  },
];

export const MOCK_USUARIOS: Usuario[] = [...usuarioStore];

export const obtenerUsuariosActivos = (): Usuario[] => [...usuarioStore];

export const crearUsuario = (usuario: Omit<Usuario, 'id_user'> & { id_user?: string }): Usuario => {
  const nuevoUsuario: Usuario = {
    id_user: usuario.id_user ?? `u${Date.now()}`,
    name: usuario.name?.trim() || 'Nuevo usuario',
    email: usuario.email.trim(),
    password: usuario.password ?? '123456',
    rol: usuario.rol ?? 'Almacenista',
    warehouse_id: usuario.warehouse_id ?? 1,
    sedeId: usuario.sedeId ?? 's1',
  };

  usuarioStore = [...usuarioStore, nuevoUsuario];
  return nuevoUsuario;
};

export const actualizarUsuario = (
  idUsuario: string,
  cambios: Partial<Pick<Usuario, 'name' | 'email' | 'password' | 'sedeId' | 'warehouse_id'>>
): Usuario | null => {
  const usuarioEncontrado = usuarioStore.find((usuario) => usuario.id_user === idUsuario);
  if (!usuarioEncontrado) return null;

  const actualizado: Usuario = {
    ...usuarioEncontrado,
    ...cambios,
    name: cambios.name?.trim() || usuarioEncontrado.name || 'Nuevo usuario',
    email: (cambios.email ?? usuarioEncontrado.email).trim(),
    password: cambios.password ?? usuarioEncontrado.password ?? '123456',
    sedeId: cambios.sedeId ?? usuarioEncontrado.sedeId ?? 's1',
    warehouse_id: cambios.warehouse_id ?? usuarioEncontrado.warehouse_id ?? 1,
  };

  usuarioStore = usuarioStore.map((usuario) => (usuario.id_user === idUsuario ? actualizado : usuario));
  return actualizado;
};

export const eliminarUsuario = (idUsuario: string): boolean => {
  const existe = usuarioStore.some((usuario) => usuario.id_user === idUsuario);
  if (!existe) return false;

  usuarioStore = usuarioStore.filter((usuario) => usuario.id_user !== idUsuario);
  return true;
};

export const resetUsuarios = (): void => {
  usuarioStore = [
    {
      id_user: 'u1',
      name: 'Administrador General',
      email: 'admin@empresa.com',
      password: 'admin123',
      rol: 'Administrador',
      warehouse_id: 1,
      sedeId: 's1',
    },
    {
      id_user: 'u2',
      name: 'Encargado Central',
      email: 'almacenista.central@gmail.com',
      password: 'Almacen123',
      rol: 'Almacenista',
      warehouse_id: 1,
      sedeId: 's1',
    },
    {
      id_user: 'u3',
      name: 'Encargado Norte',
      email: 'almacenista.norte@gmail.com',
      password: 'Almacen123',
      rol: 'Almacenista',
      warehouse_id: 2,
      sedeId: 's2',
    },
    {
      id_user: 'u4',
      name: 'Almacenista Prueba',
      email: 'almacenista.prueba@gmail.com',
      password: 'Almacen123',
      rol: 'Almacenista',
      warehouse_id: 4,
      sedeId: 's4',
    },
  ];
};