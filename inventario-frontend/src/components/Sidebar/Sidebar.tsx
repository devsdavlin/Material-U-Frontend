import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { usuario, logout } = useContext(AuthContext);

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'block',
    padding: '10px 16px',
    marginBottom: '8px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: isActive ? '#fff' : '#4b5563',
    backgroundColor: isActive ? '#344e41' : 'transparent',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'background-color 0.2s',
  });

  return (
    <aside style={{ width: '250px', backgroundColor: '#f9fafb', padding: '20px', borderRight: '1px solid #e5e7eb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#1f2937' }}>
        Inventario
      </h2>
      
      <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937', fontSize: '0.9rem' }}>{usuario?.nombre}</p>
        <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.8rem' }}>
          Rol: <strong style={{ color: '#344e41' }}>{usuario?.rol === 'ADMINISTRADOR' ? 'ADMINISTRADOR' : 'ENCARGADO_SEDE'}</strong>
        </p>
      </div>

      <nav style={{ flex: 1 }}>
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
        style={{ marginTop: 'auto', width: '100%', padding: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Cerrar Sesión
      </button>
    </aside>
  );
};