import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../layouts/MainLayout/MainLayout';

import { Login } from '../pages/Login/Login';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { DashboardAdmin } from '../pages/DashboardAdmin/DashboardAdmin';
import { esAdmin } from '../utils/sedeHelpers';
import { Inventario } from '../pages/Inventario/Inventario';
import { Entradas } from '../pages/Entradas/Entradas';
import { Salidas } from '../pages/Salidas/Salidas';
import { Materiales } from '../pages/Materiales/Materiales';
import { Sedes } from '../pages/Sedes/Sedes';
import { Usuarios } from '../pages/Usuarios/Usuarios';

const ADMIN = ['Administrador', 'ADMINISTRADOR'] as const;

// El administrador arranca en Sedes; el almacenista en su dashboard.
const RutaInicial = () => {
  const { usuario } = useContext(AuthContext);

  if (usuario?.rol === 'Administrador' || usuario?.rol === 'ADMINISTRADOR') {
    return <Navigate to="/sedes" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

const DashboardPorRol = () => {
  const { usuario } = useContext(AuthContext);
  return esAdmin(usuario) ? <DashboardAdmin /> : <Dashboard />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<RutaInicial />} />
        <Route path="/dashboard" element={<DashboardPorRol />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/entradas" element={<Entradas />} />
        <Route path="/salidas" element={<Salidas />} />
        <Route path="/materiales" element={<Materiales />} />
        <Route path="/sedes" element={<ProtectedRoute rolesPermitidos={[...ADMIN]}><Sedes /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute rolesPermitidos={[...ADMIN]}><Usuarios /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<RutaInicial />} />
    </Routes>
  );
};