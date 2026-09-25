import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../layouts/MainLayout/MainLayout';

// Importa todas tus vistas
import { Login } from '../pages/Login/Login';
import { SeleccionSede } from '../pages/SeleccionSede/SeleccionSede';
import { Dashboard } from '../pages/Dashboard/Dashboard'; // Este ahora es solo para el almacenista
import { Inventario } from '../pages/Inventario/Inventario';
import { Entradas } from '../pages/Entradas/Entradas';
import { Salidas } from '../pages/Salidas/Salidas';
import { Materiales } from '../pages/Materiales/Materiales';

const Sedes = () => <div><h1>Gestión de Sedes</h1></div>;
const Usuarios = () => <div><h1>Gestión de Usuarios</h1></div>;

// 🔀 Componente policía: Revisa quién entró y le da la vista correcta
const InicioInteligente = () => {
  const { usuario } = useContext(AuthContext);
  
  if (usuario?.rol === 'Administrador') { 
  return <SeleccionSede />;
}
  
  return <Dashboard />; // Muestra los KPIs del encargado 📋
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        
        {/* Usamos el componente inteligente en la ruta principal */}
        <Route path="/dashboard" element={<InicioInteligente />} />
        
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/entradas" element={<Entradas />} />
        <Route path="/salidas" element={<Salidas />} />
        <Route path="/materiales" element={<Materiales />} />

        {/* Rutas protegidas exclusivas del Admin */}
        <Route path="/sedes" element={<ProtectedRoute rolesPermitidos={['Administrador']}><Sedes /></ProtectedRoute>} />
<Route path="/usuarios" element={<ProtectedRoute rolesPermitidos={['Administrador']}><Usuarios /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};