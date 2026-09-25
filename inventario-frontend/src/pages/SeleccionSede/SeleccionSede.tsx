import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const SeleccionSede: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const sedes = [
    { id: '1', nombre: 'Almacén La Vega', descripcion: 'Sede Principal' },
    { id: '2', nombre: 'Almacén Progres', descripcion: 'Sede Norte' },
    { id: '3', nombre: 'Almacén Central', descripcion: 'Sede Sur' },
  ];

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#0f291e', fontWeight: '800', margin: '0 0 10px 0' }}>
          Bienvenido, {usuario?.nombre}
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: 0 }}>
          Selecciona la sede a la que deseas ingresar.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        {sedes.map((sede) => (
          <div
            key={sede.id}
            onClick={() => navigate(`/inventario?sede=${sede.id}&nombre=${encodeURIComponent(sede.nombre)}`)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '40px 20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '2px solid transparent',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.border = '2px solid #fadc51'; // Borde rosadito 
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(236, 72, 153, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.border = '2px solid transparent';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ fontSize: '3.5rem', backgroundColor: '#fdf2f8', width: '90px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', marginBottom: '20px', color: '#ec4899' }}>
              🏢
            </div>
            <h2 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '1.5rem' }}>{sede.nombre}</h2>
            <p style={{ margin: '0 0 24px 0', color: '#9ca3af', fontSize: '0.95rem' }}>{sede.descripcion}</p>
            
            <button style={{
              backgroundColor: '#123b2b', color: '#fff', border: 'none',
              padding: '12px 28px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem',
              pointerEvents: 'none' // El click lo recibe la tarjeta completa
            }}>
              Ingresar a Sede ➔
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};