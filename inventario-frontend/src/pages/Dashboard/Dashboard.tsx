import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  obtenerMiInventario,
  type ItemInventarioBackend,
  type ResumenInventario,
} from '../../services/inventarioService';
import { MOCK_SEDES } from '../../mocks/sedes';

export const Dashboard: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [items, setItems] = useState<ItemInventarioBackend[]>([]);
  const [resumen, setResumen] = useState<ResumenInventario>({
    total: 0,
    con_stock: 0,
    agotados: 0,
    bajo_minimo: 0,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await obtenerMiInventario('todos');
        if (res) {
          if (res.items) setItems(res.items);
          if (res.resumen) setResumen(res.resumen);
        }
      } catch (err) {
        console.warn('Backend desconectado o error, usando fallback para Dashboard:', err);
        // Fallback para visualización local
        const fallbackItems: ItemInventarioBackend[] = [
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
        setItems(fallbackItems);
        setResumen({
          total: fallbackItems.length,
          con_stock: fallbackItems.filter((i) => i.estado === 'ok').length,
          agotados: fallbackItems.filter((i) => i.estado === 'agotado').length,
          bajo_minimo: fallbackItems.filter((i) => i.estado === 'bajo_minimo').length,
        });
      }
    };

    cargarDatos();
  }, []);

  const resultadosBusqueda = useMemo(() => {
    if (!debouncedSearch.trim()) return [];
    const term = debouncedSearch.toLowerCase();
    return items.filter(
      (item) =>
        item.material_name.toLowerCase().includes(term) ||
        item.internal_code.toLowerCase().includes(term)
    );
  }, [debouncedSearch, items]);

  const top10Stock = useMemo(() => {
    return [...items]
      .sort((a, b) => b.current_stock - a.current_stock)
      .slice(0, 10);
  }, [items]);

  const sedeIdActiva = String(usuario?.warehouse_id ?? '1');
  const sedeNombre = MOCK_SEDES.find((s) => s.id === sedeIdActiva)?.nombre || 'Almacén Principal';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Encabezado */}
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#1f2937', margin: 0, fontWeight: 'bold' }}>
          Dashboard Principal
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
          Vista de {usuario?.rol || 'Almacenista'} ({sedeNombre})
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar material por nombre o código en tiempo real..."
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            fontSize: '0.95rem',
            boxSizing: 'border-box',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            outline: 'none',
          }}
        />

        {debouncedSearch.trim() !== '' && (
          <div
            style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              zIndex: 10,
              maxHeight: '250px',
              overflowY: 'auto',
            }}
          >
            {resultadosBusqueda.length > 0 ? (
              resultadosBusqueda.map((item) => (
                <div
                  key={item.id_inventory || item.internal_code}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    <strong>{item.internal_code}</strong> - {item.material_name}
                  </span>
                  <span style={{ fontWeight: 'bold', color: '#344e41' }}>
                    {item.current_stock} {item.unit}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px 16px', color: '#9ca3af', textAlign: 'center' }}>
                No se encontraron materiales en el inventario
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <Card title="Total Materiales" value={resumen.total} color="#3b82f6" />
        <Card title="Con Stock" value={resumen.con_stock} color="#10b981" />
        <Card title="Agotados" value={resumen.agotados} color="#f59e0b" />
        <Card title="Bajo Mínimo" value={resumen.bajo_minimo} color="#ef4444" />
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
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '16px' }}>
          🏆 Top 10 Materiales por Stock en Bodega
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {top10Stock.length > 0 ? (
            top10Stock.map((item) => {
              const maxStock = top10Stock[0]?.current_stock || 1;
              const porcentaje =
                maxStock > 0 ? Math.min((item.current_stock / maxStock) * 100, 100) : 0;

              return (
                <div key={item.id_inventory || item.internal_code}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ fontWeight: '500' }}>
                      {item.internal_code} - {item.material_name}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>
                      {item.current_stock} {item.unit}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${porcentaje}%`,
                        backgroundColor: '#344e41',
                        borderRadius: '4px',
                        transition: 'width 0.4s',
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ color: '#9ca3af', textAlign: 'center', fontSize: '0.9rem' }}>
              No hay materiales en bodega aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  value: string | number;
  color: string;
}

const Card: React.FC<CardProps> = ({ title, value, color }) => (
  <div
    style={{
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '14px',
      border: '1px solid #e5e7eb',
      borderLeft: `5px solid ${color}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>{title}</span>
    </div>
    <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#1f2937', marginTop: '8px' }}>
      {value}
    </div>
  </div>
);