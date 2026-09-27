import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { guardarSedeSeleccionada, obtenerSedesActivas, type Sede } from '../../services/sedeService';

export const SeleccionSede: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sedes, setSedes] = useState<Sede[]>([]);

  useEffect(() => {
    void obtenerSedesActivas().then(setSedes);
  }, []);

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
            onClick={() => {
              guardarSedeSeleccionada(sede);
              navigate(`/dashboard?sedeId=${sede.id}&nombreSede=${encodeURIComponent(sede.nombre)}`);
            }}
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
            <div style={{ backgroundColor: '#fdf2f8', width: '90px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', marginBottom: '20px' }}>
              <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="#123b2b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 20V7l8-4 8 4v13" />
                <path d="M9 20v-6h6v6M8 10h.01M12 10h.01M16 10h.01" />
              </svg>
            </div>
            <h2 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '1.5rem' }}>{sede.nombre}</h2>
            <p style={{ margin: '0 0 24px 0', color: '#9ca3af', fontSize: '0.95rem' }}>{sede.ubicacion}</p>
            
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