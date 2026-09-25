import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { usuario, logout } = useContext(AuthContext);
  // Estado que controla si el mouse está encima de la barra
  const [isHovered, setIsHovered] = useState(false);

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '12px',
    textDecoration: 'none',
    color: isActive ? '#ffffff' : '#6b7280',
    backgroundColor: isActive ? '#123b2b' : 'transparent', // Verde oscuro del dashboard 🌲
    fontWeight: isActive ? 'bold' : '500',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap', // Evita que el texto baje de línea al encogerse
    overflow: 'hidden',
  });

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: isHovered ? '250px' : '80px', // Animación de ancho ↔️
        backgroundColor: '#ffffff',
        padding: '20px 14px',
        borderRight: '1px solid #e8ece8',
        minHeight: '100vh',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: isHovered ? '4px 0 20px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      {/* 1. Logo y Título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', padding: '0 6px', overflow: 'hidden' }}>
        <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>📦</div>
        <h2 style={{ fontSize: '1.3rem', margin: 0, color: '#0f291e', fontWeight: '800', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>
          Inventario
        </h2>
      </div>

      {/* 2. Tarjeta del Usuario (Se oculta suavemente) */}
      <div style={{
        padding: isHovered ? '12px' : '0',
        backgroundColor: '#f8faf8',
        borderRadius: '12px',
        marginBottom: '20px',
        border: isHovered ? '1px solid #e8ece8' : 'none',
        overflow: 'hidden',
        height: isHovered ? '60px' : '0',
        opacity: isHovered ? 1 : 0,
        transition: 'all 0.3s ease',
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.85rem', color: '#123b2b', whiteSpace: 'nowrap' }}>{usuario?.nombre}</p>
        <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Rol: {usuario?.rol}</p>
      </div>

      {/* 3. Menú de Navegación con Iconitos */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NavLink to="/dashboard" style={linkStyle}>
          <span style={{ fontSize: '1.3rem', minWidth: '32px', textAlign: 'center' }}>📊</span>
          <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Dashboard</span>
        </NavLink>
        <NavLink to="/inventario" style={linkStyle}>
          <span style={{ fontSize: '1.3rem', minWidth: '32px', textAlign: 'center' }}>📋</span>
          <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Inventario</span>
        </NavLink>
        <NavLink to="/entradas" style={linkStyle}>
          <span style={{ fontSize: '1.3rem', minWidth: '32px', textAlign: 'center' }}>📥</span>
          <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Entradas</span>
        </NavLink>
        <NavLink to="/salidas" style={linkStyle}>
          <span style={{ fontSize: '1.3rem', minWidth: '32px', textAlign: 'center' }}>📤</span>
          <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Salidas</span>
        </NavLink>
        <NavLink to="/materiales" style={linkStyle}>
          <span style={{ fontSize: '1.3rem', minWidth: '32px', textAlign: 'center' }}>🧩</span>
          <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Materiales</span>
        </NavLink>

        {usuario?.rol === 'Administrador' && (
          <>
            <hr style={{ margin: '15px 0', borderColor: '#e8ece8', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />
            <NavLink to="/sedes" style={linkStyle}>
              <span style={{ fontSize: '1.3rem', minWidth: '32px', textAlign: 'center' }}>🏢</span>
              <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Sedes</span>
            </NavLink>
            <NavLink to="/usuarios" style={linkStyle}>
              <span style={{ fontSize: '1.3rem', minWidth: '32px', textAlign: 'center' }}>👥</span>
              <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Usuarios</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* 4. Botón de Cerrar Sesión */}
      <button
        onClick={logout}
        style={{
          display: 'flex', alignItems: 'center', padding: '12px',
          backgroundColor: '#fee2e2', color: '#ef4444', border: 'none',
          borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease',
          overflow: 'hidden', whiteSpace: 'nowrap', marginTop: 'auto'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
      >
        <span style={{ fontSize: '1.3rem', minWidth: '32px', textAlign: 'center' }}>🚪</span>
        <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px', fontWeight: 'bold' }}>Cerrar Sesión</span>
      </button>
    </aside>
  );
};