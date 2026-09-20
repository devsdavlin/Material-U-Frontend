import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useInventario } from '../../context/InventarioContext';

export const Salidas: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const { inventario, salidas, agregarSalida } = useInventario();

  const [materialId, setMaterialId] = useState('');
  const [centroCosto, setCentroCosto] = useState('');
  const [cantidad, setCantidad] = useState<number | ''>('');
  const [errorStock, setErrorStock] = useState<string | null>(null);

  const materialSeleccionado = inventario.find((m) => m.materialId === materialId);
  const stockDisponible = materialSeleccionado ? materialSeleccionado.stockActual : 0;

  const handleCantidadChange = (val: number | '') => {
    setCantidad(val);
    if (materialSeleccionado && typeof val === 'number' && val > stockDisponible) {
      setErrorStock(`¡Alerta! La cantidad solicitada (${val}) supera el stock disponible (${stockDisponible}).`);
    } else {
      setErrorStock(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialSeleccionado || !cantidad || !centroCosto) return;

    if (cantidad > stockDisponible) {
      alert('No se puede registrar la salida: Stock insuficiente');
      return;
    }

    agregarSalida({
      materialId: materialSeleccionado.materialId,
      descripcion: materialSeleccionado.descripcion,
      centroCosto,
      cantidad: Number(cantidad),
      unidadMedida: materialSeleccionado.unidadMedida,
      registradoPor: usuario?.nombre || 'Encargado',
    });

    setMaterialId('');
    setCentroCosto('');
    setCantidad('');
    setErrorStock(null);
    alert('¡Salida / Despacho registrado con éxito!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#1f2937', margin: 0, fontWeight: 'bold' }}>
          Registro de Salidas / Despachos
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
          Asignación de materiales a centros de costos (obras/torres)
        </p>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '16px' }}>Generar Vale de Salida</h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {/* Selección de Material */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Material *</label>
            <select
              value={materialId}
              onChange={(e) => {
                setMaterialId(e.target.value);
                setCantidad('');
                setErrorStock(null);
              }}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
              required
            >
              <option value="">-- Seleccionar Material --</option>
              {inventario.map((item) => (
                <option key={item.id} value={item.materialId}>
                  {item.codigo} - {item.descripcion} (Stock: {item.stockActual} {item.unidadMedida})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Centro de Costos / Destino *</label>
            <input
              type="text"
              value={centroCosto}
              onChange={(e) => setCentroCosto(e.target.value)}
              placeholder="Ej. APTO 602 TORRE B"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Cantidad a Despachar *</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => handleCantidadChange(e.target.value ? Number(e.target.value) : '')}
              placeholder="0"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          {materialSeleccionado && (
            <div style={{ gridColumn: '1 / -1', backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Stock Disponible Actual:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: stockDisponible > 0 ? '#10b981' : '#ef4444' }}>
                {stockDisponible} {materialSeleccionado.unidadMedida}
              </span>
            </div>
          )}

          {errorStock && (
            <div style={{ gridColumn: '1 / -1', color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {errorStock}
            </div>
          )}

          <button
            type="submit"
            disabled={!!errorStock}
            style={{
              gridColumn: '1 / -1',
              backgroundColor: errorStock ? '#9ca3af' : '#344e41',
              color: '#fff',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: errorStock ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Registrar Salida
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '16px' }}>Historial de Despachos</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>N° Vale</th>
                <th style={{ padding: '12px' }}>Fecha</th>
                <th style={{ padding: '12px' }}>Material</th>
                <th style={{ padding: '12px' }}>Centro de Costos</th>
                <th style={{ padding: '12px' }}>Cantidad</th>
                <th style={{ padding: '12px' }}>Registrado Por</th>
              </tr>
            </thead>
            <tbody>
              {salidas.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#344e41' }}>{item.codigoVale}</td>
                  <td style={{ padding: '12px' }}>{item.fecha}</td>
                  <td style={{ padding: '12px' }}>{item.descripcion}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#374151' }}>{item.centroCosto}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#ef4444' }}>-{item.cantidad} {item.unidadMedida}</td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>{item.registradoPor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};