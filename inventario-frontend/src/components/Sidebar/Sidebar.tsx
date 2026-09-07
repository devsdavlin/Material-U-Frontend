import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { usuario, cambiarRolSimulado, logout } = useContext(AuthContext);

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'block',
    padding: '10px 16px',
    marginBottom: '8px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: isActive ? '#fff' : '#4b5563',
    backgroundColor: isActive ? '#ec4899' : 'transparent',
    fontWeight: isActive ? 'bold' : 'normal',
  });

  return (
    <aside style={{ width: '250px', backgroundColor: '#f9fafb', padding: '20px', borderRight: '1px solid #e5e7eb', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#1f2937' }}>📦 Inventario</h2>
      
      {/* Indicador de Usuario y Conmutador de Rol */}
      <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb', fontSize: '0.85rem' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{usuario?.nombre}</p>
        <p style={{ margin: '4px 0', color: '#6b7280' }}>Rol: {usuario?.rol}</p>
        
        <button
          onClick={() => cambiarRolSimulado(usuario?.rol === 'ADMINISTRADOR' ? 'u2' : 'u1')}
          style={{ marginTop: '8px', width: '100%', padding: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
        >
          🔄 Cambiar a {usuario?.rol === 'ADMINISTRADOR' ? 'Encargado' : 'Admin'}
        </button>
      </div>

      <nav>
        <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/inventario" style={linkStyle}>Inventario</NavLink>
        <NavLink to="/entradas" style={linkStyle}>Entradas</NavLink>
        <NavLink to="/salidas" style={linkStyle}>Salidas</NavLink>
        <NavLink to="/materiales" style={linkStyle}>Materiales</NavLink>

        {usuario?.rol === 'ADMINISTRADOR' && (
          <>
            <hr style={{ margin: '15px 0', borderColor: '#e5e7eb' }} />
            <NavLink to="/sedes" style={linkStyle}>Sedes</NavLink>
            <NavLink to="/usuarios" style={linkStyle}>Usuarios</NavLink>
          </>
        )}
      </nav>

      <button
        onClick={logout}
        style={{ marginTop: '30px', width: '100%', padding: '8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
      >
        Cerrar Sesión
      </button>
    </aside>
  );
};