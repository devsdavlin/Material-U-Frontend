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
import { obtenerSedesActivas, guardarSedeSeleccionada, crearSede, type Sede } from '../services/sedeService';
import { obtenerUsuariosActivos, crearUsuario } from '../services/usuarioService';
import type { Usuario } from '../types/Usuario';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '', rol: 'Almacenista', warehouse_id: '' });
  const [enviando, setEnviando] = useState(false);

  const cargar = async () => {
    try {
      const data = await obtenerUsuariosActivos();
      setUsuarios(data);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const usuariosActivos = usuarios.filter((usuario: Usuario) => usuario.rol !== 'Administrador' && usuario.rol !== 'ADMINISTRADOR');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) return;

    setEnviando(true);
    try {
      await crearUsuario({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        rol: form.rol,
        warehouse_id: form.warehouse_id ? Number(form.warehouse_id) : null,
      });
      setForm({ username: '', email: '', password: '', rol: 'Almacenista', warehouse_id: '' });
      await cargar();
    } catch (error) {
      console.error('No se pudo crear el usuario:', error);
      alert(error instanceof Error ? error.message : 'No se pudo crear el usuario');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#f6f7f5' }}>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '2.6rem', fontWeight: 800, color: '#0f291e' }}>Gestión de Usuarios</h1>

      <div style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '20px', marginBottom: '24px', border: '1px solid #e7ece8' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#0f291e' }}>Crear usuario</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Nombre de usuario" style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d5db' }} required />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Correo" style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d5db' }} required />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Contraseña" style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d5db' }} required />
          <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Usuario['rol'] })} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d5db' }}>
            <option value="Almacenista">Almacenista</option>
            <option value="Administrador">Administrador</option>
          </select>
          <input type="number" value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })} placeholder="ID sede (opcional)" style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
          <button type="submit" disabled={enviando} style={{ backgroundColor: '#123b2b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}>
            {enviando ? 'Guardando...' : 'Crear usuario'}
          </button>
        </form>
      </div>

      {cargando ? (
        <p style={{ color: '#6b7280' }}>Cargando usuarios del backend...</p>
      ) : usuariosActivos.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '24px', color: '#6b7280' }}>
          No hay usuarios en este momento.
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
  const [nombreSede, setNombreSede] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = async () => {
    try {
      const data = await obtenerSedesActivas();
      setSedes(data);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nombreSede.trim()) return;

    setEnviando(true);
    try {
      await crearSede(nombreSede.trim());
      setNombreSede('');
      await cargar();
    } catch (error) {
      console.error('No se pudo crear la sede:', error);
      alert(error instanceof Error ? error.message : 'No se pudo crear la sede');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#f6f7f5' }}>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '2.6rem', fontWeight: 800, color: '#0f291e' }}>Gestión de Sedes</h1>

      <div style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '20px', marginBottom: '24px', border: '1px solid #e7ece8' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#0f291e' }}>Crear sede</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input value={nombreSede} onChange={(e) => setNombreSede(e.target.value)} placeholder="Nombre de la sede" style={{ flex: '1 1 280px', padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d5db' }} required />
          <button type="submit" disabled={enviando} style={{ backgroundColor: '#123b2b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}>
            {enviando ? 'Guardando...' : 'Crear sede'}
          </button>
        </form>
      </div>

      {cargando ? (
        <p style={{ color: '#6b7280' }}>Cargando sedes del backend...</p>
      ) : sedes.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '24px', color: '#6b7280' }}>
          No hay sedes disponibles.
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