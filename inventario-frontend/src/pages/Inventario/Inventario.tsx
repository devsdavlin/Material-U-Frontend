import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { guardarSedeSeleccionada, normalizarSedeId, obtenerSedeSeleccionada, obtenerSedesActivas } from '../../services/sedeService';
import {
  obtenerMiInventario,
  type ItemInventarioBackend,
  type EstadoInventario,
} from '../../services/inventarioService';

export const Inventario: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [sedes, setSedes] = useState<Array<{ id: string; nombre: string; ubicacion: string }>>([]);
  const sedePersistida = obtenerSedeSeleccionada();
  const sedeIdActiva = normalizarSedeId(searchParams.get('sedeId') ?? sedePersistida?.id ?? 's1');
  const nombreSede =
    searchParams.get('nombreSede') ??
    sedePersistida?.nombre ??
    sedes.find((sede) => sede.id === sedeIdActiva)?.nombre ??
    'La Vega';

  useEffect(() => {
    void obtenerSedesActivas().then((data) => setSedes(Array.isArray(data) ? data : []));
  }, []);
  const [filtroEstado, setFiltroEstado] = useState<EstadoInventario>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [items, setItems] = useState<ItemInventarioBackend[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    const sedeActual = sedes.find((sede) => sede.id === sedeIdActiva);
    if (sedeActual) {
      guardarSedeSeleccionada(sedeActual);
    }
  }, [sedeIdActiva, sedes]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setCargando(true);
      try {
        const res = await obtenerMiInventario(filtroEstado, busqueda);
        if (res && res.items) {
          const datos = sedeIdActiva
            ? res.items.filter((item) => {
                const itemSede = String((item as any).sedeId ?? (item as any).warehouse_id ?? '');
                return itemSede === sedeIdActiva || itemSede === String(sedeIdActiva);
              })
            : res.items;

          setItems(datos);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.warn('Backend desconectado o error, usando datos de respaldo:', error);
        const fallback: ItemInventarioBackend[] = [
          {
            id_inventory: 1,
            material_id: 1,
            material_name: 'PARRILLA ASADOR A GAS PLUS + BANDEJA LATERAL',
            internal_code: 'MIG 001',
            unit: 'UN',
            category: 'Equipos',
            activo: true,
            current_stock: 15,
            min_stock: 5,
            estado: 'ok',
          },
          {
            id_inventory: 2,
            material_id: 2,
            material_name: 'LAVARROPAS ECO 48X60 CM FIRPLAK',
            internal_code: 'MIG 002',
            unit: 'UN',
            category: 'Grifería',
            activo: true,
            current_stock: 0,
            min_stock: 2,
            estado: 'agotado',
          },
          {
            id_inventory: 3,
            material_id: 3,
            material_name: 'CATALIZADOR EPOXICO X 1/4 TITO PABON',
            internal_code: 'MIG 003',
            unit: 'GL',
            category: 'Pinturas',
            activo: true,
            current_stock: 4,
            min_stock: 10,
            estado: 'bajo_minimo',
          },
        ];

        const filtrados = fallback.filter((item) => {
          const matchQ =
            item.material_name.toLowerCase().includes(busqueda.toLowerCase()) ||
            item.internal_code.toLowerCase().includes(busqueda.toLowerCase());
          const matchE =
            filtroEstado === 'todos' ||
            (filtroEstado === 'con_stock' && item.estado === 'ok') ||
            (filtroEstado === 'bajo_minimo' && item.estado === 'bajo_minimo') ||
            (filtroEstado === 'agotado' && item.estado === 'agotado');
          return matchQ && matchE;
        });

        setItems(filtrados);
      } finally {
        setCargando(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [filtroEstado, busqueda, sedeIdActiva]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#1f2937', margin: 0, fontWeight: 'bold' }}>
          Control de Inventario y Existencias
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
          {sedeIdActiva ? `Mostrando inventario de ${nombreSede}` : 'Existencias en bodega y saldos sincronizados con el servidor'}
        </p>
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
          style={{
            flex: 1,
            minWidth: '240px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            outline: 'none',
            fontSize: '0.9rem',
          }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
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

      <div
        style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '14px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.9rem',
            }}
          >
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
                    <tr
                      key={item.id_inventory || item.internal_code}
                      style={{ borderBottom: '1px solid #f3f4f6' }}
                    >
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#344e41' }}>
                        {item.internal_code}
                      </td>
                      <td style={{ padding: '12px' }}>{item.material_name}</td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>{item.category || '-'}</td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>{item.unit}</td>
                      <td style={{ padding: '12px', color: '#f59e0b', fontWeight: 'bold' }}>
                        {item.min_stock} {item.unit}
                      </td>
                      <td style={{ padding: '12px', fontWeight: '800', fontSize: '1rem', color: '#1f2937' }}>
                        {item.current_stock} {item.unit}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                          }}
                        >
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