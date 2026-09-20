import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from '../pages/Login/Login';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Inventario } from '../pages/Inventario/Inventario';
import { Entradas } from '../pages/Entradas/Entradas';
import { Salidas } from '../pages/Salidas/Salidas';
import { Materiales } from '../pages/Materiales/Materiales';
import { MainLayout } from '../layouts/MainLayout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';

const Sedes = () => <div><h1>Gestión de Sedes</h1></div>;
const Usuarios = () => <div><h1>Gestión de Usuarios</h1></div>;

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/entradas" element={<Entradas />} />
        <Route path="/salidas" element={<Salidas />} />
        <Route path="/materiales" element={<Materiales />} />

        <Route
          path="/sedes"
          element={
            <ProtectedRoute rolesPermitidos={['ADMINISTRADOR']}>
              <Sedes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute rolesPermitidos={['ADMINISTRADOR']}>
              <Usuarios />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};