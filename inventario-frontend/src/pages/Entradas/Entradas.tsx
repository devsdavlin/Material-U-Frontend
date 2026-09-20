import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useInventario } from '../../context/InventarioContext';

export const Entradas: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const { inventario, entradas, agregarEntrada } = useInventario();

  const [materialId, setMaterialId] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [cantidad, setCantidad] = useState<number | ''>('');
  const [valorUnitario, setValorUnitario] = useState<number | ''>('');

  const materialSeleccionado = inventario.find((m) => m.materialId === materialId);
  const valorTotalCalculado = (Number(cantidad) || 0) * (Number(valorUnitario) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialSeleccionado || !cantidad || !valorUnitario || !proveedor) return;

    agregarEntrada({
      materialId: materialSeleccionado.materialId,
      descripcion: materialSeleccionado.descripcion,
      proveedor,
      cantidad: Number(cantidad),
      valorUnitario: Number(valorUnitario),
      valorTotal: valorTotalCalculado,
    });

    setMaterialId('');
    setProveedor('');
    setCantidad('');
    setValorUnitario('');
    alert('¡Entrada registrada con éxito!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#1f2937', margin: 0, fontWeight: 'bold' }}>
          Registro de Entradas
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
          Módulo operativo para el Encargado de Bodega ({usuario?.nombre})
        </p>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '16px' }}>Registrar Nuevo Ingreso de Material</h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Material *</label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
              required
            >
              <option value="">-- Seleccionar Material --</option>
              {inventario.map((item) => (
                <option key={item.id} value={item.materialId}>
                  {item.codigo} - {item.descripcion} ({item.unidadMedida})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Proveedor *</label>
            <input
              type="text"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Ej. Comercializadora Alfa"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Cantidad *</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value ? Number(e.target.value) : '')}
              placeholder="0"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Valor Unitario ($) *</label>
            <input
              type="number"
              min="0"
              value={valorUnitario}
              onChange={(e) => setValorUnitario(e.target.value ? Number(e.target.value) : '')}
              placeholder="0.00"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ gridColumn: '1 / -1', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#4b5563' }}>Valor Total Calculado:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#344e41' }}>
              ${valorTotalCalculado.toLocaleString()}
            </span>
          </div>

          <button type="submit" style={{ gridColumn: '1 / -1', backgroundColor: '#344e41', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            Guardar Entrada
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '16px' }}>Historial Reciente de Ingresos</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>N° Entrada</th>
                <th style={{ padding: '12px' }}>Fecha</th>
                <th style={{ padding: '12px' }}>Material</th>
                <th style={{ padding: '12px' }}>Proveedor</th>
                <th style={{ padding: '12px' }}>Cantidad</th>
                <th style={{ padding: '12px' }}>Valor Unit.</th>
                <th style={{ padding: '12px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {entradas.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#344e41' }}>{item.codigoMig}</td>
                  <td style={{ padding: '12px' }}>{item.fecha}</td>
                  <td style={{ padding: '12px' }}>{item.descripcion}</td>
                  <td style={{ padding: '12px' }}>{item.proveedor}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.cantidad}</td>
                  <td style={{ padding: '12px' }}>${item.valorUnitario.toLocaleString()}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981' }}>${item.valorTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};