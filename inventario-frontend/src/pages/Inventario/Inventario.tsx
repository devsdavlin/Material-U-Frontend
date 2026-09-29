import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  guardarSedeSeleccionada,
  obtenerSedeSeleccionada,
  obtenerSedesActivas,
} from '../../services/sedeService';
import {
  obtenerMiInventario,
  type ItemInventarioBackend,
  type EstadoInventario,
  type ResumenInventario,
} from '../../services/inventarioService';
import { resolverWarehouseId } from '../../utils/sedeHelpers';
import { getErrorMessage } from '../../utils/apiError';

const RESUMEN_VACIO: ResumenInventario = { total: 0, con_stock: 0, agotados: 0, bajo_minimo: 0 };

export const Inventario: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const sedePersistida = obtenerSedeSeleccionada();
  const warehouseId = resolverWarehouseId(usuario, searchParams.get('sedeId'));
  const nombreSede = searchParams.get('nombreSede') ?? sedePersistida?.nombre ?? 'tu sede';

  // Guarda la sede elegida (solo administrador) para las demás pantallas
  useEffect(() => {
    if (!warehouseId) return;
    void obtenerSedesActivas().then((sedes) => {
      const actual = sedes.find((s) => s.id === String(warehouseId));
      if (actual) guardarSedeSeleccionada(actual);
    });
  }, [warehouseId]);

  const [filtroEstado, setFiltroEstado] = useState<EstadoInventario>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [items, setItems] = useState<ItemInventarioBackend[]>([]);
  const [resumen, setResumen] = useState<ResumenInventario>(RESUMEN_VACIO);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      // El backend ya filtra por sede: NO se vuelve a filtrar aquí
      const res = await obtenerMiInventario(filtroEstado, busqueda, warehouseId);
      setItems(res.items);
      setResumen(res.resumen);
      setError(null);
    } catch (err) {
      setItems([]);
      setResumen(RESUMEN_VACIO);
      setError(getErrorMessage(err, 'No se pudo cargar el inventario'));
    } finally {
      setCargando(false);
    }
  }, [filtroEstado, busqueda, warehouseId]);

  useEffect(() => {
    const timer = setTimeout(() => void cargar(), 250);
    return () => clearTimeout(timer);
  }, [cargar]);

  const getBadgeStyle = (estado: 'ok' | 'agotado' | 'bajo_minimo') => {
    switch (estado) {
      case 'ok':
        return { bg: '#dcfce7', text: '#15803d', label: 'Con Stock' };
      case 'bajo_minimo':
        return { bg: '#fef3c7', text: '#b45309', label: 'Bajo Mínimo' };
      case 'agotado':
      default:
        return { bg: '#fee2e2', text: '#b91c1c', label: 'Agotado' };
    }
  };

  const kpis = [
    { label: 'Total', valor: resumen.total, color: '#1f2937' },
    { label: 'Con stock', valor: resumen.con_stock, color: '#15803d' },
    { label: 'Bajo mínimo', valor: resumen.bajo_minimo, color: '#b45309' },
    { label: 'Agotados', valor: resumen.agotados, color: '#b91c1c' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#1f2937', margin: 0, fontWeight: 'bold' }}>
            Control de Inventario y Existencias
          </h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            Mostrando inventario de {nombreSede} (datos en vivo del servidor)
          </p>
        </div>
        <button
          onClick={() => void cargar()}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #344e41', backgroundColor: '#fff', color: '#344e41', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: k.color }}>{k.valor}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '14px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o código en inventario..."
          style={{ flex: 1, minWidth: '240px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem' }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['todos', 'con_stock', 'bajo_minimo', 'agotado'] as EstadoInventario[]).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                cursor: 'pointer',
                backgroundColor: filtroEstado === estado ? '#344e41' : '#f3f4f6',
                color: filtroEstado === estado ? '#fff' : '#4b5563',
              }}
            >
              {estado === 'todos' && 'Todos'}
              {estado === 'con_stock' && 'Con Stock'}
              {estado === 'bajo_minimo' && 'Bajo Mínimo'}
              {estado === 'agotado' && 'Agotados'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>Código</th>
                <th style={{ padding: '12px' }}>Descripción del Material</th>
                <th style={{ padding: '12px' }}>Categoría</th>
                <th style={{ padding: '12px' }}>U.M.</th>
                <th style={{ padding: '12px' }}>Stock Mínimo</th>
                <th style={{ padding: '12px' }}>Stock Actual</th>
                <th style={{ padding: '12px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    Consultando existencias de la bodega...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                    No hay productos en bodega con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const badge = getBadgeStyle(item.estado);
                  return (
                    <tr key={item.id_inventory} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#344e41' }}>{item.internal_code}</td>
                      <td style={{ padding: '12px' }}>{item.material_name}</td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>{item.category || '-'}</td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>{item.unit}</td>
                      <td style={{ padding: '12px', color: '#f59e0b', fontWeight: 'bold' }}>
                        {item.min_stock} {item.unit}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 800, fontSize: '1rem', color: '#1f2937' }}>
                        {item.current_stock} {item.unit}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ backgroundColor: badge.bg, color: badge.text, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};