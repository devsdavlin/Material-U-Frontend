/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Usuario } from '../types/Usuario';
import { loginBackend } from '../services/authService';
import { guardarSedeSeleccionada, limpiarSedeSeleccionada, normalizarSedeId } from '../services/sedeService';
import { STORAGE_KEYS } from '../utils/storage';

const normalizarRol = (rol: unknown): Usuario['rol'] => {
  const valor = String(rol ?? '').trim().toLowerCase();

  if (['administrador', 'admin', 'administrator'].includes(valor)) {
    return 'Administrador';
  }

  return 'Almacenista';
};

const mapUsuarioDesdeBackend = (
  rawUser: Record<string, unknown> | null | undefined,
  fallbackEmail: string
): Usuario => {
  const rol = normalizarRol(rawUser?.rol ?? rawUser?.role);
  const rawSedeValue = rawUser?.sedeId ?? rawUser?.sede_id ?? rawUser?.warehouse_id ?? 's1';
  const sedeValor = typeof rawSedeValue === 'string' || typeof rawSedeValue === 'number'
    ? rawSedeValue
    : 's1';

  return {
    id_user: String(rawUser?.id_user ?? rawUser?.id ?? rawUser?.userId ?? ''),
    name: (rawUser?.name ?? rawUser?.nombre ?? rawUser?.username) as string | undefined,
    nombre: (rawUser?.nombre ?? rawUser?.name ?? rawUser?.username) as string | undefined,
    email: (rawUser?.email as string | undefined) ?? fallbackEmail,
    rol,
    warehouse_id: (rawUser?.warehouse_id as number | null | undefined) ?? (rawUser?.warehouseId as number | null | undefined) ?? null,
    sedeId: normalizarSedeId(sedeValor),
  };
};

const getStoredUser = (): Usuario | null => {
  if (typeof window === 'undefined') return null;

  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);
    return storedUser ? (JSON.parse(storedUser) as Usuario) : null;
  } catch {
    return null;
  }
};

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.token);
};

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  cambiarRolSimulado: (idUsuario: string) => void;
  fetchConToken: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());

  useEffect(() => {
    if (usuario) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(usuario));
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.user);
  }, [usuario]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.token, token);
      // también guardar bajo la clave corta por compatibilidad
      localStorage.setItem('token', token);
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem('token');
  }, [token]);

  const guardarSesion = (user: Usuario | null, authToken: string | null) => {
    setUsuario(user);
    setToken(authToken);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await loginBackend(email, password);
      const token = typeof data.token === 'string' ? data.token : null;
      const rawUser = data.user && typeof data.user === 'object' ? data.user : null;

      if (token && rawUser) {
        const user = mapUsuarioDesdeBackend(rawUser as Record<string, unknown>, email);

        if (user.sedeId) {
          guardarSedeSeleccionada({
            id: String(user.sedeId),
            nombre: user.nombre ?? user.name ?? 'Sede',
            ubicacion: '',
          });
        }

        guardarSesion(user, token);
        return true;
      }
    } catch (error) {
      console.error('Login real falló:', error);
    }

    return false;
  };

  const logout = () => {
    limpiarSedeSeleccionada();
    guardarSesion(null, null);
  };

  const cambiarRolSimulado = (idUsuario: string) => {
    // Sin mocks. El rol lo define el backend real.
    void idUsuario;
    return;
  };

  const fetchConToken = async (
    input: RequestInfo | URL,
    init: RequestInit = {}
  ): Promise<Response> => {
    const authToken = token ?? getStoredToken();
    const headers = new Headers(init.headers || {});

    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }

    if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(input, {
      ...init,
      headers,
    });
  };

  return (
    <AuthContext.Provider
      value={{ usuario, token, login, logout, cambiarRolSimulado, fetchConToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};