import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../layouts/MainLayout/MainLayout';

import { Login } from '../pages/Login/Login';
import { SeleccionSede } from '../pages/SeleccionSede/SeleccionSede';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Inventario } from '../pages/Inventario/Inventario';
import { Entradas } from '../pages/Entradas/Entradas';
import { Salidas } from '../pages/Salidas/Salidas';
import { Materiales } from '../pages/Materiales/Materiales';
import { obtenerSedesActivas, guardarSedeSeleccionada, type Sede } from '../services/sedeService';
import { obtenerUsuariosActivos } from '../services/usuarioService';
import type { Usuario } from '../types/Usuario';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data = await obtenerUsuariosActivos();
        if (activo) {
          setUsuarios(data);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    void cargar();
    return () => {
      activo = false;
    };
  }, []);

  const usuariosActivos = usuarios.filter((usuario: Usuario) => usuario.rol !== 'Administrador' && usuario.rol !== 'ADMINISTRADOR');

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#f6f7f5' }}>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '2.6rem', fontWeight: 800, color: '#0f291e' }}>Gestión de Usuarios</h1>

      {cargando ? (
        <p style={{ color: '#6b7280' }}>Cargando usuarios del backend...</p>
      ) : usuariosActivos.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '24px', color: '#6b7280' }}>
          No hay usuarios disponibles desde el backend real.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {usuariosActivos.map((usuario) => (
            <div key={usuario.id_user} style={{ backgroundColor: '#fff', borderRadius: '22px', padding: '22px 18px', border: '1px solid #e7ece8' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.45rem', color: '#0f291e' }}>{usuario.name ?? usuario.nombre ?? 'Usuario'}</h3>
              <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.5 }}>{usuario.email}</p>
              <p style={{ margin: '8px 0 0 0', color: '#6b7280', lineHeight: 1.5 }}>Rol: {usuario.rol}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Sedes = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data = await obtenerSedesActivas();
        if (activo) {
          setSedes(data);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    void cargar();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#f6f7f5' }}>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '2.6rem', fontWeight: 800, color: '#0f291e' }}>Gestión de Sedes</h1>

      {cargando ? (
        <p style={{ color: '#6b7280' }}>Cargando sedes del backend...</p>
      ) : sedes.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '24px', color: '#6b7280' }}>
          No hay sedes disponibles desde el backend real.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {sedes.map((sede) => (
            <div key={sede.id} style={{ backgroundColor: '#fff', borderRadius: '22px', padding: '22px 18px', border: '1px solid #e7ece8' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: '#0f291e' }}>{sede.nombre}</h3>
              <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.5 }}>{sede.ubicacion ?? 'Sin dirección'}</p>
              <button
                onClick={() => {
                  guardarSedeSeleccionada(sede);
                  window.location.href = `/dashboard?sedeId=${sede.id}&nombreSede=${encodeURIComponent(sede.nombre)}`;
                }}
                style={{
                  marginTop: '18px',
                  backgroundColor: '#123b2b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Ingresar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RutaInicial = () => {
  const { usuario } = useContext(AuthContext);

  if (usuario?.rol === 'Administrador' || usuario?.rol === 'ADMINISTRADOR') {
    return <Navigate to="/seleccion-sede" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<RutaInicial />} />
        <Route
          path="/seleccion-sede"
          element={<ProtectedRoute rolesPermitidos={['Administrador', 'ADMINISTRADOR']}><SeleccionSede /></ProtectedRoute>}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/entradas" element={<Entradas />} />
        <Route path="/salidas" element={<Salidas />} />
        <Route path="/materiales" element={<Materiales />} />
        <Route path="/sedes" element={<ProtectedRoute rolesPermitidos={['Administrador', 'ADMINISTRADOR']}><Sedes /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute rolesPermitidos={['Administrador', 'ADMINISTRADOR']}><Usuarios /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<RutaInicial />} />
    </Routes>
  );
};