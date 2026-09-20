import React, { useState, useMemo } from 'react';
import { useInventario } from '../../context/InventarioContext';

export const Inventario: React.FC = () => {
  const { inventario } = useInventario();
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  const inventarioFiltrado = useMemo(() => {
    return inventario.filter((item) => {
      const cumpleBusqueda =
        item.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.codigo.toLowerCase().includes(busqueda.toLowerCase());

      const cumpleEstado = filtroEstado === 'TODOS' || item.estado === filtroEstado;
      return cumpleBusqueda && cumpleEstado;
    });
  }, [inventario, busqueda, filtroEstado]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#1f2937', margin: 0, fontWeight: 'bold' }}>
          Control de Inventario y Existencias
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
          Existencias en bodega y saldos actualizados en tiempo real
        </p>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e5e7eb', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o código..."
          style={{ flex: 1, minWidth: '240px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem' }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          {['TODOS', 'CON_STOCK', 'AGOTADO', 'NEGATIVO'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer',
                backgroundColor: filtroEstado === estado ? '#344e41' : '#f3f4f6',
                color: filtroEstado === estado ? '#fff' : '#4b5563',
              }}
            >
              {estado === 'TODOS' && 'Todos'}
              {estado === 'CON_STOCK' && 'Con Stock'}
              {estado === 'AGOTADO' && 'Agotados'}
              {estado === 'NEGATIVO' && 'Negativos'}
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
                <th style={{ padding: '12px' }}>U.M.</th>
                <th style={{ padding: '12px' }}>Entradas</th>
                <th style={{ padding: '12px' }}>Salidas</th>
                <th style={{ padding: '12px' }}>Stock Actual</th>
                <th style={{ padding: '12px' }}>Valor Total</th>
                <th style={{ padding: '12px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {inventarioFiltrado.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#344e41' }}>{item.codigo}</td>
                  <td style={{ padding: '12px' }}>{item.descripcion}</td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>{item.unidadMedida}</td>
                  <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>+{item.entradasTotales}</td>
                  <td style={{ padding: '12px', color: '#ef4444', fontWeight: 'bold' }}>-{item.salidasTotales}</td>
                  <td style={{ padding: '12px', fontWeight: '800', fontSize: '0.95rem' }}>{item.stockActual} {item.unidadMedida}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>${item.valorTotal.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: item.estado === 'CON_STOCK' ? '#dcfce7' : item.estado === 'AGOTADO' ? '#fef3c7' : '#fee2e2',
                      color: item.estado === 'CON_STOCK' ? '#15803d' : item.estado === 'AGOTADO' ? '#b45309' : '#b91c1c',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};