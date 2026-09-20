import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useInventario } from '../../context/InventarioContext';
import { MOCK_SEDES } from '../../mocks/sedes';

export const Dashboard: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const { inventario } = useInventario();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const sedeIdActiva = usuario?.sedeId || '1';

  const inventarioFiltrado = useMemo(() => {
    return inventario.filter((item) => item.sedeId === sedeIdActiva);
  }, [inventario, sedeIdActiva]);

  const resultadosBusqueda = useMemo(() => {
    if (!debouncedSearch.trim()) return [];
    const term = debouncedSearch.toLowerCase();
    return inventarioFiltrado.filter(
      (item) =>
        item.descripcion.toLowerCase().includes(term) ||
        item.codigo.toLowerCase().includes(term)
    );
  }, [debouncedSearch, inventarioFiltrado]);

  const totalMateriales = inventarioFiltrado.length;
  const conStock = inventarioFiltrado.filter((i) => i.estado === 'CON_STOCK').length;
  const agotados = inventarioFiltrado.filter((i) => i.estado === 'AGOTADO').length;
  const negativos = inventarioFiltrado.filter((i) => i.estado === 'NEGATIVO').length;
  const valorTotal = inventarioFiltrado.reduce((acc, i) => acc + i.valorTotal, 0);

  const top10Stock = useMemo(() => {
    return [...inventarioFiltrado]
      .sort((a, b) => b.stockActual - a.stockActual)
      .slice(0, 10);
  }, [inventarioFiltrado]);

  const sedeNombre = MOCK_SEDES.find((s) => s.id === sedeIdActiva)?.nombre || 'Almacén La Vega';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Encabezado */}
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#1f2937', margin: 0, fontWeight: 'bold' }}>
          Dashboard Principal
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
          Vista de Encargado ({sedeNombre})
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
            outline: 'none'
          }}
        />

        {debouncedSearch.trim() !== '' && (
          <div style={{
            position: 'absolute', top: '110%', left: 0, right: 0,
            backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '250px', overflowY: 'auto'
          }}>
            {resultadosBusqueda.length > 0 ? (
              resultadosBusqueda.map((item) => (
                <div key={item.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>{item.codigo}</strong> - {item.descripcion}</span>
                  <span style={{ fontWeight: 'bold', color: '#344e41' }}>{item.stockActual} {item.unidadMedida}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px 16px', color: '#9ca3af', textAlign: 'center' }}>
                No se encontraron materiales
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <Card title="Total Materiales" value={totalMateriales} color="#3b82f6"/>
        <Card title="Con Stock" value={conStock} color="#10b981"/>
        <Card title="Agotados" value={agotados} color="#f59e0b"/>
        <Card title="Saldo Negativo" value={negativos} color="#ef4444"/>
        <Card title="Valor Total" value={`$${valorTotal.toLocaleString()}`} color="#8b5cf6"/>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '16px' }}>🏆 Top 10 Materiales por Stock</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {top10Stock.length > 0 ? (
            top10Stock.map((item) => {
              const maxStock = top10Stock[0]?.stockActual || 1;
              const porcentaje = maxStock > 0 ? Math.min((item.stockActual / maxStock) * 100, 100) : 0;

              return (
                <div key={item.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500' }}>{item.codigo} - {item.descripcion}</span>
                    <span style={{ fontWeight: 'bold' }}>{item.stockActual} {item.unidadMedida}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${porcentaje}%`, backgroundColor: '#344e41', borderRadius: '4px', transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ color: '#9ca3af', textAlign: 'center', fontSize: '0.9rem' }}>No hay materiales en bodega aún.</div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  value: string | number;
  color: string
}

const Card: React.FC<CardProps> = ({ title, value, color}) => (
  <div style={{
    backgroundColor: '#fff', padding: '20px', borderRadius: '14px',
    border: '1px solid #e5e7eb', borderLeft: `5px solid ${color}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>{title}</span>
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginTop: '8px' }}>
      {value}
    </div>
  </div>
);