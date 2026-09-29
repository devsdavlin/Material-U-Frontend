import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearSede, guardarSedeSeleccionada, obtenerSedesActivas, type Sede } from '../../services/sedeService';

const input: React.CSSProperties = { padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d5db', flex: '1 1 260px' };

export const Sedes: React.FC = () => {
  const navigate = useNavigate();
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombreSede, setNombreSede] = useState('');
  const [direccion, setDireccion] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = async () => {
    try {
      setSedes(await obtenerSedesActivas());
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nombreSede.trim() || !direccion.trim()) return;

    setEnviando(true);
    try {
      await crearSede(nombreSede, direccion);
      setNombreSede('');
      setDireccion('');
      await cargar();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo crear la sede');
    } finally {
      setEnviando(false);
    }
  };

  const abrirDashboard = (sede: Sede) => {
    guardarSedeSeleccionada(sede);
    navigate(`/dashboard?sedeId=${sede.id}&nombreSede=${encodeURIComponent(sede.nombre)}`);
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#f6f7f5' }}>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '2.6rem', fontWeight: 800, color: '#0f291e' }}>Gestión de Sedes</h1>

      <div style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '20px', marginBottom: '24px', border: '1px solid #e7ece8' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#0f291e' }}>Crear sede</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input value={nombreSede} onChange={(e) => setNombreSede(e.target.value)} placeholder="Nombre de la sede" style={input} required minLength={3} />
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección de la sede" style={input} required minLength={5} />
          <button type="submit" disabled={enviando} style={{ backgroundColor: '#123b2b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}>
            {enviando ? 'Guardando...' : 'Crear sede'}
          </button>
        </form>
      </div>

      {cargando ? (
        <p style={{ color: '#6b7280' }}>Cargando sedes...</p>
      ) : sedes.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '24px', color: '#6b7280' }}>
          Aún no hay sedes. Crea la primera con el formulario de arriba.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {sedes.map((sede) => (
            <div
              key={sede.id}
              onClick={() => abrirDashboard(sede)}
              style={{ backgroundColor: '#fff', borderRadius: '22px', padding: '22px 18px', border: '1px solid #e7ece8', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 28px rgba(15, 23, 42, 0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: '#0f291e' }}>{sede.nombre}</h3>
              <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.5, minHeight: '36px' }}>{sede.ubicacion || 'Sin dirección'}</p>
              <span style={{ marginTop: '18px', backgroundColor: '#123b2b', color: '#fff', borderRadius: '12px', padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>
                Ver dashboard →
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};