import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Usuario } from '../types/Usuario';
import { MOCK_USUARIOS } from '../mocks/usuarios';

interface AuthContextType {
  usuario: Usuario | null;
  login: (email: string) => boolean;
  logout: () => void;
  cambiarRolSimulado: (idUsuario: string) => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicializamos con el Administrador por defecto para desarrollar rápido
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const login = (email: string): boolean => {
    const userFound = MOCK_USUARIOS.find((u) => u.email === email);
    if (userFound) {
      setUsuario(userFound);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUsuario(null);
  };

  const cambiarRolSimulado = (idUsuario: string) => {
    const userFound = MOCK_USUARIOS.find((u) => u.id === idUsuario);
    if (userFound) setUsuario(userFound);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cambiarRolSimulado }}>
      {children}
    </AuthContext.Provider>
  );
};