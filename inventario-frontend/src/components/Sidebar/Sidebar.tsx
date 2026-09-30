import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const green = '#123b2b';

type IconProps = {
  size?: number;
  color?: string;
};

const DashboardIcon = ({ size = 22, color = green }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 13.5h7V20H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 4h7v7H4z" />
  </svg>
);

const InventoryIcon = ({ size = 22, color = green }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 3h8l4 4v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2z" />
    <path d="M8 3v5h8V3" />
    <path d="M8 12h8M8 16h8" />
  </svg>
);

const EntryIcon = ({ size = 22, color = green }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12" />
    <path d="M7 18l5 5 5-5" />
    <path d="M4 7h16" />
  </svg>
);

const ExitIcon = ({ size = 22, color = green }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12" />
    <path d="M7 18l5 5 5-5" />
    <path d="M4 7h16" />
  </svg>
);

const PackageIcon = ({ size = 22, color = green }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8l9-5 9 5-9 5-9-5zm0 0v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

const BuildingIcon = ({ size = 22, color = green }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20V7l8-4 8 4v13" />
    <path d="M9 20v-6h6v6M8 10h.01M12 10h.01M16 10h.01" />
  </svg>
);

const UsersIcon = ({ size = 22, color = green }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 19a4 4 0 0 0-8 0" />
    <circle cx="12" cy="8" r="4" />
    <path d="M20 19a4 4 0 0 0-2.7-3.7M4 19a4 4 0 0 1 2.7-3.7" />
  </svg>
);

const LogoutIcon = ({ size = 22, color = '#ef4444' }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const AvatarIcon = ({ size = 44 }: { size?: number }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
    <defs>
      <clipPath id="avatar-clip">
        <circle cx="20" cy="20" r="20" />
      </clipPath>
    </defs>
    <circle cx="20" cy="20" r="20" fill="#e8ece8" />
    <g clipPath="url(#avatar-clip)" fill="#838a96">
      <circle cx="20" cy="15" r="7" />
      <ellipse cx="20" cy="38" rx="14" ry="11" />
    </g>
  </svg>
);

export const Sidebar: React.FC = () => {
  const { usuario, logout } = useContext(AuthContext);
  // Estado que controla si el mouse está encima de la barra
  const [isHovered, setIsHovered] = useState(false);
  const esAdminRol = usuario?.rol === 'Administrador' || usuario?.rol === 'ADMINISTRADOR';

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '12px',
    textDecoration: 'none',
    color: isActive ? '#ffffff' : '#6b7280',
    backgroundColor: isActive ? '#123b2b' : 'transparent',
    fontWeight: isActive ? 'bold' : '500',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  });

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: isHovered ? '250px' : '80px',
        background: 'rgba(255, 255, 255, 0.38)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        padding: '20px 14px',
        borderRight: '1px solid rgba(18, 59, 43, 0.12)',
        height: '100vh',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        boxShadow: isHovered
          ? '0 18px 40px rgba(18, 59, 43, 0.12), inset 0 1px 0 rgba(255,255,255,0.45)'
          : '0 10px 25px rgba(18, 59, 43, 0.08)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Cabecera: avatar cuando la barra está contraída, tarjeta del usuario cuando se expande */}
      <div style={{ position: 'relative', height: '60px', marginBottom: '20px', flexShrink: 0 }}>
        {/* Avatar (solo visible contraída) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isHovered ? 0 : 1,
            transition: 'opacity 0.25s ease',
            pointerEvents: 'none',
          }}
        >
          <AvatarIcon size={44} />
        </div>

        {/* Tarjeta del usuario (solo visible expandida) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxSizing: 'border-box',
            padding: '0 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#f8faf8',
            borderRadius: '12px',
            border: '1px solid #e8ece8',
            overflow: 'hidden',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.85rem', color: '#123b2b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {usuario?.nombre || usuario?.name}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
            Rol: {esAdminRol ? 'Administrador(a)' : usuario?.rol}
          </p>
        </div>
      </div>

      {/* 3. Menú de Navegación con Iconitos */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 2. Lo que ve SOLO EL ALMACENISTA (Su módulo operativo completo) */}
        {usuario?.rol !== 'Administrador' && usuario?.rol !== 'ADMINISTRADOR' && (
          <>
        
        <NavLink to="/dashboard" style={linkStyle}>
          {({ isActive }) => (
            <>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', color: isActive ? '#ffffff' : green, flexShrink: 0 }}>
                <DashboardIcon size={20} color={isActive ? '#ffffff' : green} />
              </span>
              <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Dashboard</span>
            </>
          )}
        </NavLink>
        <NavLink to="/inventario" style={linkStyle}>
          {({ isActive }) => (
            <>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', color: isActive ? '#ffffff' : green, flexShrink: 0 }}>
                <InventoryIcon size={20} color={isActive ? '#ffffff' : green} />
              </span>
              <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Inventario</span>
            </>
          )}
        </NavLink>

            <NavLink to="/entradas" style={linkStyle}>
              {({ isActive }) => (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', color: isActive ? '#ffffff' : green, flexShrink: 0 }}>
                    <EntryIcon size={20} color={isActive ? '#ffffff' : green} />
                  </span>
                  <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Entradas</span>
                </>
              )}
            </NavLink>
            <NavLink to="/salidas" style={linkStyle}>
              {({ isActive }) => (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', color: isActive ? '#ffffff' : green, flexShrink: 0 }}>
                    <ExitIcon size={20} color={isActive ? '#ffffff' : green} />
                  </span>
                  <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Salidas</span>
                </>
              )}
            </NavLink>
            <NavLink to="/materiales" style={linkStyle}>
              {({ isActive }) => (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', color: isActive ? '#ffffff' : green, flexShrink: 0 }}>
                    <PackageIcon size={20} color={isActive ? '#ffffff' : green} />
                  </span>
                  <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Materiales</span>
                </>
              )}
            </NavLink>
          </>
        )}

        {/* 3. Lo que ve SOLO EL ADMINISTRADOR (Su módulo de auditoría) 👑 */}
        {(usuario?.rol === 'Administrador' || usuario?.rol === 'ADMINISTRADOR') && (
          <>
            <hr style={{ margin: '15px 0', borderColor: '#e5e7eb' }} />
            <NavLink to="/sedes" style={linkStyle}>
              {({ isActive }) => (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', color: isActive ? '#ffffff' : green, flexShrink: 0 }}>
                    <BuildingIcon size={20} color={isActive ? '#ffffff' : green} />
                  </span>
                  <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Sedes</span>
                </>
              )}
            </NavLink>
            <NavLink to="/usuarios" style={linkStyle}>
              {({ isActive }) => (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', color: isActive ? '#ffffff' : green, flexShrink: 0 }}>
                    <UsersIcon size={20} color={isActive ? '#ffffff' : green} />
                  </span>
                  <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px' }}>Usuarios</span>
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* 4. Botón de Cerrar Sesión */}
      <button
        onClick={logout}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '12px',
          backgroundColor: '#fee2e2',
          color: '#ef4444',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          marginTop: 'auto',
          justifyContent: 'flex-start',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', flexShrink: 0 }}>
          <LogoutIcon size={20} color="#ef4444" />
        </span>
        <span style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s', marginLeft: '12px', fontWeight: 'bold' }}>Cerrar Sesión</span>
      </button>
    </aside>
  );
};