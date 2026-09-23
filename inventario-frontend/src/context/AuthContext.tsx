import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Usuario } from '../types/Usuario';
import { MOCK_USUARIOS } from '../mocks/usuarios';
import { loginBackend } from '../services/authService';

const STORAGE_KEYS = {
  user: 'inventario_user',
  token: 'inventario_token',
} as const;

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
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.token);
  }, [token]);

  const guardarSesion = (user: Usuario | null, authToken: string | null) => {
    setUsuario(user);
    setToken(authToken);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await loginBackend(email, password);
      if (data && data.token && data.user) {
        guardarSesion(data.user, data.token);
        return true;
      }
    } catch {
      // Si el backend no está disponible o rechaza, probamos fallback de mocks para pruebas
      const userFound = MOCK_USUARIOS.find(
        (u) => u.email === email && u.password === password
      );

      if (userFound) {
        const generatedToken = `mock-token-${userFound.id_user}`;
        guardarSesion(userFound, generatedToken);
        return true;
      }
    }

    return false;
  };

  const logout = () => {
    guardarSesion(null, null);
  };

  const cambiarRolSimulado = (idUsuario: string) => {
    const userFound = MOCK_USUARIOS.find((u) => u.id_user === idUsuario);
    if (userFound) {
      const nextToken = token ?? `mock-token-${userFound.id_user}`;
      guardarSesion(userFound, nextToken);
    }
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