import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useMemo, useState } from 'react';
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
import { crearSede, eliminarSede, guardarSedeSeleccionada, obtenerSedesActivas } from '../mocks/sedes';
import { actualizarUsuario, crearUsuario, eliminarUsuario, obtenerUsuariosActivos } from '../mocks/usuarios';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState(() => obtenerUsuariosActivos());
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [sedeAsignada, setSedeAsignada] = useState('s1');

  const sedes = useMemo(() => obtenerSedesActivas(), []);

  const resetFormulario = () => {
    setNombre('');
    setCorreo('');
    setPassword('');
    setSedeAsignada('s1');
    setModoEdicion(false);
    setUsuarioSeleccionadoId(null);
  };

  const abrirCrearUsuario = () => {
    resetFormulario();
    setModalAbierto(true);
  };

  const abrirEditarUsuario = (usuario: (typeof usuarios)[number]) => {
    setUsuarioSeleccionadoId(usuario.id_user);
    setNombre(usuario.name ?? '');
    setCorreo(usuario.email ?? '');
    setPassword(usuario.password ?? '');
    setSedeAsignada(usuario.sedeId ?? 's1');
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const guardarUsuario = () => {
    const nombreTrim = nombre.trim();
    const correoTrim = correo.trim();
    const passwordTrim = password.trim();

    if (!nombreTrim || !correoTrim || !passwordTrim) return;

    if (modoEdicion && usuarioSeleccionadoId) {
      const actualizado = actualizarUsuario(usuarioSeleccionadoId, {
        name: nombreTrim,
        email: correoTrim,
        password: passwordTrim,
        sedeId: sedeAsignada,
        warehouse_id: Number.parseInt(sedeAsignada.replace('s', ''), 10) || 1,
      });

      if (actualizado) {
        setUsuarios(obtenerUsuariosActivos());
      }
    } else {
      const nuevoUsuario = crearUsuario({
        name: nombreTrim,
        email: correoTrim,
        password: passwordTrim,
        rol: 'Almacenista',
        warehouse_id: Number.parseInt(sedeAsignada.replace('s', ''), 10) || 1,
        sedeId: sedeAsignada,
      });

      setUsuarios([...usuarios, nuevoUsuario]);
    }

    setModalAbierto(false);
    resetFormulario();
  };

  const eliminarSeleccionado = () => {
    if (!usuarioSeleccionadoId) return;

    const ok = eliminarUsuario(usuarioSeleccionadoId);
    if (ok) {
      setUsuarios(obtenerUsuariosActivos());
      setUsuarioSeleccionadoId(null);
    }
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#f6f7f5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: '2.6rem', fontWeight: 800, color: '#0f291e' }}>Gestión de Usuarios</h1>

        {usuarioSeleccionadoId && (
          <button
            onClick={eliminarSeleccionado}
            style={{
              backgroundColor: '#b91c1c',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Eliminar usuario
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {usuarios
          .filter((usuario) => usuario.rol !== 'Administrador')
          .map((usuario) => {
            const seleccionada = usuario.id_user === usuarioSeleccionadoId;
            const sedeUsuario = sedes.find((sede) => sede.id === usuario.sedeId)?.nombre ?? 'Sin sede';

            return (
              <div
                key={usuario.id_user}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '22px',
                  border: seleccionada ? '2px solid #123b2b' : '1px solid #e7ece8',
                  padding: '22px 18px',
                  boxShadow: seleccionada ? '0 12px 28px rgba(18, 59, 43, 0.12)' : '0 10px 25px rgba(15, 41, 30, 0.05)',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#eaf4ef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#123b2b', fontWeight: 800 }}>U</div>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', fontWeight: 700 }}>Usuario</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUsuarioSeleccionadoId((prev) => prev === usuario.id_user ? null : usuario.id_user)}
                      style={{
                        border: '1px solid #d7dfdb',
                        backgroundColor: seleccionada ? '#123b2b' : '#f5f7f6',
                        color: seleccionada ? '#fff' : '#123b2b',
                        borderRadius: '999px',
                        padding: '6px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {seleccionada ? 'Seleccionado' : 'Seleccionar'}
                    </button>
                  </div>

                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.45rem', color: '#0f291e' }}>{usuario.name}</h3>
                  <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.5 }}>{usuario.email}</p>
                  <p style={{ margin: '8px 0 0 0', color: '#6b7280', lineHeight: 1.5 }}>Sede: {sedeUsuario}</p>
                </div>

                <button
                  onClick={() => abrirEditarUsuario(usuario)}
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
                  Editar
                </button>
              </div>
            );
          })}

        <button
          onClick={abrirCrearUsuario}
          style={{
            backgroundColor: '#ffffff',
            border: '2px dashed #c9d7d0',
            borderRadius: '22px',
            minHeight: '180px',
            padding: '20px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#123b2b',
            fontSize: '1.1rem',
            fontWeight: 700,
            gap: '10px',
            boxShadow: '0 10px 25px rgba(15, 41, 30, 0.05)',
          }}
        >
          <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>+</span>
          Agregar usuario
        </button>
      </div>

      {modalAbierto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: '100%', maxWidth: '460px', backgroundColor: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.18)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f291e', fontSize: '1.8rem' }}>
              {modoEdicion ? 'Editar almacenero' : 'Nuevo almacenero'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#123b2b' }}>Nombre completo</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: José Muñoz"
                  style={{ width: '100%', border: '1px solid #d6ddd9', borderRadius: '12px', padding: '12px 14px', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#123b2b' }}>Correo</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Ej: almacenista@correo.com"
                  style={{ width: '100%', border: '1px solid #d6ddd9', borderRadius: '12px', padding: '12px 14px', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#123b2b' }}>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese contraseña"
                  style={{ width: '100%', border: '1px solid #d6ddd9', borderRadius: '12px', padding: '12px 14px', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#123b2b' }}>Asignar sede</label>
                <select
                  value={sedeAsignada}
                  onChange={(e) => setSedeAsignada(e.target.value)}
                  style={{ width: '100%', border: '1px solid #d6ddd9', borderRadius: '12px', padding: '12px 14px', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: '#fff' }}
                >
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => {
                setModalAbierto(false);
                resetFormulario();
              }} style={{ backgroundColor: '#eef2f1', color: '#123b2b', border: 'none', borderRadius: '12px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={guardarUsuario} style={{ backgroundColor: '#123b2b', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
                {modoEdicion ? 'Guardar cambios' : 'Guardar usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Sedes = () => {
  const [sedes, setSedes] = useState(() => obtenerSedesActivas());
  const [modalAbierto, setModalAbierto] = useState(false);
  const [sedeSeleccionadaId, setSedeSeleccionadaId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');

  const cards = useMemo(() => sedes, [sedes]);

  const guardarSede = () => {
    const nombreTrim = nombre.trim();
    const direccionTrim = direccion.trim();

    if (!nombreTrim || !direccionTrim) return;

    const nuevaSede = crearSede(nombreTrim, direccionTrim);
    setSedes([...cards, nuevaSede]);
    setNombre('');
    setDireccion('');
    setModalAbierto(false);
  };

  const borrarSedeSeleccionada = () => {
    if (!sedeSeleccionadaId) return;

    const eliminada = eliminarSede(sedeSeleccionadaId);
    if (eliminada) {
      setSedes(obtenerSedesActivas());
      setSedeSeleccionadaId(null);
    }
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#f6f7f5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: '2.6rem', fontWeight: 800, color: '#0f291e' }}>Gestión de Sedes</h1>

        {sedeSeleccionadaId && (
          <button
            onClick={borrarSedeSeleccionada}
            style={{
              backgroundColor: '#b91c1c',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Eliminar sede seleccionada
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {cards.map((sede) => {
          const seleccionada = sede.id === sedeSeleccionadaId;

          return (
            <div
              key={sede.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '22px',
                border: seleccionada ? '2px solid #123b2b' : '1px solid #e7ece8',
                padding: '22px 18px',
                boxShadow: seleccionada ? '0 12px 28px rgba(18, 59, 43, 0.12)' : '0 10px 25px rgba(15, 41, 30, 0.05)',
                minHeight: '170px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#eaf4ef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#123b2b', fontWeight: 800 }}>S</div>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', fontWeight: 700 }}>Sede</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSedeSeleccionadaId((prev) => prev === sede.id ? null : sede.id)}
                    style={{
                      border: '1px solid #d7dfdb',
                      backgroundColor: seleccionada ? '#123b2b' : '#f5f7f6',
                      color: seleccionada ? '#fff' : '#123b2b',
                      borderRadius: '999px',
                      padding: '6px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {seleccionada ? 'Seleccionada' : 'Seleccionar'}
                  </button>
                </div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: '#0f291e' }}>{sede.nombre}</h3>
                <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.5 }}>{sede.ubicacion}</p>
              </div>
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
          );
        })}

        <button
          onClick={() => setModalAbierto(true)}
          style={{
            backgroundColor: '#ffffff',
            border: '2px dashed #c9d7d0',
            borderRadius: '22px',
            minHeight: '170px',
            padding: '20px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#123b2b',
            fontSize: '1.1rem',
            fontWeight: 700,
            gap: '10px',
            boxShadow: '0 10px 25px rgba(15, 41, 30, 0.05)',
          }}
        >
          <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>+</span>
          Crear una nueva sede
        </button>
      </div>

      {modalAbierto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.18)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f291e', fontSize: '1.8rem' }}>Nueva sede</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#123b2b' }}>Nombre de la sede</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Sede Sur"
                  style={{ width: '100%', border: '1px solid #d6ddd9', borderRadius: '12px', padding: '12px 14px', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#123b2b' }}>Dirección</label>
                <input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Calle 12 #45-67"
                  style={{ width: '100%', border: '1px solid #d6ddd9', borderRadius: '12px', padding: '12px 14px', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setModalAbierto(false)} style={{ backgroundColor: '#eef2f1', color: '#123b2b', border: 'none', borderRadius: '12px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={guardarSede} style={{ backgroundColor: '#123b2b', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
                Guardar sede
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Redireccionador automático al iniciar sesión
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
        {/* Ruta base que dispara la lógica de redirección */}
        <Route path="/" element={<RutaInicial />} />
        
        {/* Pantalla 1 exclusiva del Admin */}
        <Route 
          path="/seleccion-sede" 
          element={<ProtectedRoute rolesPermitidos={['Administrador', 'ADMINISTRADOR']}><SeleccionSede /></ProtectedRoute>} 
        />
        
        {/* El Dashboard de métricas (ahora dinámico para ambos roles) */}
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