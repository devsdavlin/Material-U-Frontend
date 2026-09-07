import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../layouts/MainLayout/MainLayout';
import { Login } from '../pages/Login/Login';

const Dashboard = () => <div><h1>Dashboard Principal</h1></div>;
const Inventario = () => <div><h1>Control de Inventario</h1></div>;
const Entradas = () => <div><h1>Registro de Entradas</h1></div>;
const Salidas = () => <div><h1>Registro de Salidas</h1></div>;
const Materiales = () => <div><h1>Catálogo de Materiales</h1></div>;
const Sedes = () => <div><h1>Gestión de Sedes</h1></div>;
const Usuarios = () => <div><h1>Gestión de Usuarios</h1></div>;

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rutas integradas con la barra lateral */}
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