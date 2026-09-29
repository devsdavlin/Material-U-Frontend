import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  guardarSedeSeleccionada,
  obtenerSedeSeleccionada,
  obtenerSedesActivas,
} from '../../services/sedeService';
import {
  obtenerDashboard,
  obtenerDinero,
  type DashboardBackend,
  type DineroBackend,
} from '../../services/dashboardService';
import { esAdmin, resolverWarehouseId } from '../../utils/sedeHelpers';
import { getErrorMessage } from '../../utils/apiError';
import { fechaCorta } from '../../utils/fecha';

const green = '#123b2b';
const greenSoft = '#10b981';
const warning = '#f59e0b';
const danger = '#ef4444';

const ArrowBadge = ({ color = '#123b2b' }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17L17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

const StatusDot = ({ color = greenSoft }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
    <circle cx="12" cy="12" r="7" fill={color} />
  </svg>
);

const WarningIcon = ({ color = warning }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l9 16H3L12 3z" />
    <path d="M12 9v4" />
    <circle cx="12" cy="16.5" r="1" fill={color} stroke="none" />
  </svg>
);

const AlertIcon = ({ color = danger }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 9v4" />
    <circle cx="12" cy="16.5" r="1" fill={color} stroke="none" />
    <path d="M12 3L21 19H3L12 3z" />
  </svg>
);

const BoxIcon = ({ color = green }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8.5L12 3l9 5.5-9 5.5L3 8.5z" />
    <path d="M3 8.5V15l9 5.5 9-5.5V8.5" />
    <path d="M12 14v7" />
  </svg>
);

const CoinIcon = ({ color = '#fbbf24' }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7v10M9 9.5c0-1.1 1.3-2 3-2s3 .9 3 2-1.3 2-3 2-3 .9-3 2 1.3 2 3 2 3-.9 3-2" />
  </svg>
);

const kpiBase: React.CSSProperties = {
  backgroundColor: '#fff',
  color: '#0f291e',
  padding: '24px',
  borderRadius: '24px',
  border: '1px solid #e8ece8',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '130px',
};

const cardBase: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '24px',
  border: '1px solid #e8ece8',
};

const formatoCOP = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`;

export const Dashboard: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sedeIdURL = searchParams.get('sedeId');
  const nombreSedeURL = searchParams.get('nombreSede');
  const warehouseId = resolverWarehouseId(usuario, sedeIdURL);

  const [dash, setDash] = useState<DashboardBackend | null>(null);
  const [dinero, setDinero] = useState<DineroBackend | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Guarda la sede elegida (solo administrador) para las demás pantallas
  useEffect(() => {
    if (!warehouseId) return;
    void obtenerSedesActivas().then((sedes) => {
      const actual = sedes.find((s) => s.id === String(warehouseId));
      if (actual) guardarSedeSeleccionada(actual);
    });
  }, [warehouseId]);

  // TODO viene del backend: /dashboard/mi-sede y /money/mi-sede
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [d, m] = await Promise.all([obtenerDashboard(warehouseId), obtenerDinero(warehouseId)]);
      setDash(d);
      setDinero(m);
      setError(null);
    } catch (err) {
      setDash(null);
      setDinero(null);
      setError(getErrorMessage(err, 'No se pudo cargar el dashboard'));
    } finally {
      setCargando(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const sedeNombre =
    dash?.sede.warehouse_name || nombreSedeURL || obtenerSedeSeleccionada()?.nombre || 'tu sede';
  const resumen = dash?.resumen ?? { total: 0, con_stock: 0, agotados: 0, bajo_minimo: 0 };
  const porcDisponible = resumen.total > 0 ? Math.round((resumen.con_stock / resumen.total) * 100) : 0;
  const movimientos = dash?.ultimosMovimientos ?? [];
  const criticos = dash?.criticos ?? [];
  const admin = esAdmin(usuario);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#f8faf8', minHeight: '100vh', padding: '10px 0', animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: '#0f291e', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Dashboard Local
          </h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            Gestiona, monitorea y controla los insumos de <strong>{sedeNombre}</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => void cargar()}
            style={{ backgroundColor: '#fff', color: '#123b2b', border: '1px solid #123b2b', padding: '12px 20px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            {cargando ? 'Actualizando...' : 'Actualizar'}
          </button>
          {!admin && (
            <>
              <button
                onClick={() => navigate('/entradas')}
                style={{ backgroundColor: '#123b2b', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(18, 59, 43, 0.15)' }}
              >
                <span>+</span> Nuevo Ingreso
              </button>
              <button
                onClick={() => navigate('/salidas')}
                style={{ backgroundColor: '#fff', color: '#123b2b', border: '1px solid #123b2b', padding: '12px 20px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Generar Salida
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ ...kpiBase, backgroundColor: '#123b2b', color: '#fff', border: 'none', boxShadow: '0 10px 20px rgba(18, 59, 43, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 500 }}>Total Materiales</span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowBadge color="#fff" />
            </span>
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1 }}>{resumen.total}</div>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', width: 'fit-content' }}>
            Con movimiento en la sede
          </div>
        </div>

        <div style={kpiBase}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}>Con Stock</span>
            <span style={{ border: '1px solid #e5e7eb', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowBadge color={green} /></span>
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1 }}>{resumen.con_stock}</div>
          <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <StatusDot color={greenSoft} /> Disponibles en bodega
          </div>
        </div>

        <div style={kpiBase}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}>Bajo Mínimo</span>
            <span style={{ border: '1px solid #e5e7eb', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowBadge color={green} /></span>
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1 }}>{resumen.bajo_minimo}</div>
          <div style={{ color: warning, fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <WarningIcon color={warning} /> Conviene reponer
          </div>
        </div>

        <div style={kpiBase}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}>Agotados</span>
            <span style={{ border: '1px solid #e5e7eb', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowBadge color={green} /></span>
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1 }}>{resumen.agotados}</div>
          <div style={{ color: danger, fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertIcon color={danger} /> Requiere compra
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Dinero real de la sede */}
            <div style={cardBase}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f291e', fontWeight: 700 }}>Dinero de la Sede</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Entró (entradas)</span>
                  <strong style={{ color: '#065f46' }}>{formatoCOP(dinero?.plataEntradas ?? 0)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Salió (salidas)</span>
                  <strong style={{ color: '#991b1b' }}>{formatoCOP(dinero?.plataSalidas ?? 0)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e8ece8', paddingTop: '12px' }}>
                  <span style={{ color: '#0f291e', fontWeight: 'bold' }}>Resultante</span>
                  <strong style={{ color: '#123b2b' }}>{formatoCOP(dinero?.resultante ?? 0)}</strong>
                </div>
              </div>
            </div>

            {/* Sede */}
            <div style={{ ...cardBase, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>TU SEDE ACTUAL</span>
                <h3 style={{ margin: '6px 0', fontSize: '1.4rem', color: '#123b2b', fontWeight: 800 }}>{sedeNombre}</h3>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
                  Encargado: <strong>{usuario?.nombre ?? usuario?.name ?? 'Operador'}</strong>
                </p>
              </div>
              <button
                onClick={() =>
                  navigate(
                    warehouseId
                      ? `/inventario?sedeId=${warehouseId}&nombreSede=${encodeURIComponent(sedeNombre)}`
                      : '/inventario'
                  )
                }
                style={{ backgroundColor: '#123b2b', color: '#fff', border: 'none', padding: '12px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '0.9rem', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <BoxIcon color="#fff" /> Ver Tabla de Inventario
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Últimos movimientos reales */}
            <div style={cardBase}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f291e', fontWeight: 700 }}>Últimos Movimientos</h3>
                <span style={{ fontSize: '0.75rem', color: '#123b2b', fontWeight: 'bold' }}>{cargando ? 'Cargando...' : 'En vivo'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {movimientos.slice(0, 6).map((mv) => (
                  <div key={`${mv.tipo}-${mv.numero}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#0f291e' }}>{mv.material_name}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        {mv.tipo === 'entrada' ? 'Ingreso' : 'Despacho'} • {mv.numero} • {fechaCorta(mv.fecha)}
                      </div>
                    </div>
                    <span
                      style={{
                        backgroundColor: mv.tipo === 'entrada' ? '#d1fae5' : '#fee2e2',
                        color: mv.tipo === 'entrada' ? '#065f46' : '#991b1b',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {mv.tipo === 'entrada' ? '+' : '-'}{mv.quantity}
                    </span>
                  </div>
                ))}
                {!cargando && movimientos.length === 0 && (
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', margin: '10px 0' }}>Sin registros recientes.</p>
                )}
              </div>
            </div>

            {/* Medidor */}
            <div style={{ ...cardBase, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#0f291e', fontWeight: 700, alignSelf: 'flex-start' }}>Disponibilidad de Stock</h3>
              <div style={{ position: 'relative', width: '150px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                <svg width="140" height="80" viewBox="0 0 100 50">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e8ece8" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#123b2b" strokeWidth="12" strokeLinecap="round" strokeDasharray="126" strokeDashoffset={126 - (126 * porcDisponible) / 100} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                </svg>
                <div style={{ position: 'absolute', bottom: 0, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#123b2b' }}>{porcDisponible}%</div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '10px', fontWeight: 500 }}>Materiales con stock sobre el mínimo</span>
            </div>
          </div>
        </div>

        {/* Derecha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ ...cardBase, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f291e', fontWeight: 700 }}>Materiales Críticos</h3>
              <button onClick={() => navigate('/inventario')} style={{ background: 'none', border: 'none', color: '#123b2b', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                + Ver Todos
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {criticos.map((item) => (
                <div key={item.material_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f0f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BoxIcon color={green} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#0f291e' }}>{item.internal_code}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.material_name}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: item.estado === 'agotado' ? danger : warning, whiteSpace: 'nowrap' }}>
                    {item.current_stock} <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>{item.unit} (mín. {item.min_stock})</span>
                  </span>
                </div>
              ))}
              {!cargando && criticos.length === 0 && (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>Sin materiales críticos.</p>
              )}
            </div>
          </div>

          <div style={{ color: '#fff', padding: '24px', borderRadius: '24px', background: 'linear-gradient(135deg, #123b2b 0%, #081f16 100%)', boxShadow: '0 10px 20px rgba(18, 59, 43, 0.25)' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
              Saldo de la sede (entradas − salidas)
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '12px 0 16px 0' }}>
              {formatoCOP(dinero?.resultante ?? 0)} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', opacity: 0.8 }}>COP</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '12px', width: 'fit-content' }}>
              <CoinIcon color="#fbbf24" /> Calculado con los movimientos reales
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};