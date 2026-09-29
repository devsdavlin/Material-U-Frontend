import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { guardarSedeSeleccionada, obtenerSedesActivas, type Sede } from '../../services/sedeService';

export const SeleccionSede: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sedes, setSedes] = useState<Sede[]>([]);

  useEffect(() => {
    void obtenerSedesActivas().then((data) => setSedes(Array.isArray(data) ? data : []));
  }, []);

  const listaSedes = Array.isArray(sedes) ? sedes : [];

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3.2rem', color: '#0f291e', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-0.06em' }}>
          Bienvenido, {usuario?.nombre}
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: 0 }}>
          Selecciona la sede a la que deseas ingresar.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
        {listaSedes.map((sede) => (
          <div
            key={sede.id}
            onClick={() => {
              guardarSedeSeleccionada(sede);
              navigate(`/dashboard?sedeId=${sede.id}&nombreSede=${encodeURIComponent(sede.nombre)}`);
            }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '22px',
              padding: '22px 18px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e5e7eb',
              transition: 'all 0.25s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 16px 28px rgba(15, 23, 42, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.06)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#edf6f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#123b2b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 20V7l8-4 8 4v13" />
                  <path d="M9 20v-6h6v6M8 10h.01M12 10h.01M16 10h.01" />
                </svg>
              </div>
              <button
                type="button"
                style={{
                  backgroundColor: '#eef6f5',
                  border: '1px solid #dfeae8',
                  color: '#123b2b',
                  borderRadius: '999px',
                  padding: '8px 14px',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  pointerEvents: 'none',
                }}
              >
                Seleccionar
              </button>
            </div>

            <h2 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '2.1rem', fontWeight: '800', lineHeight: 1.2 }}>{sede.nombre}</h2>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '1rem', minHeight: '36px' }}>{sede.ubicacion || 'Sin dirección registrada'}</p>

            <button style={{
              backgroundColor: '#123b2b',
              color: '#fff',
              border: 'none',
              padding: '12px 18px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: 'auto',
            }}>
              Ingresar a Sede →
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