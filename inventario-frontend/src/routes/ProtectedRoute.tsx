import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import type { RolUsuario } from '../types/Usuario';

interface ProtectedRouteProps {
  children: React.ReactNode;
  rolesPermitidos?: RolUsuario[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, rolesPermitidos }) => {
  const { usuario } = useContext(AuthContext);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};