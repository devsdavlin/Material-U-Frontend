import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  obtenerEntradas,
  registrarEntrada,
  type EntradaBackend,
} from '../../services/entradaService';
import { obtenerMateriales, type MaterialBackend } from '../../services/materialService';
import { resolverWarehouseId } from '../../utils/sedeHelpers';
import { getErrorMessage } from '../../utils/apiError';
import { fechaCorta, hoyLocal } from '../../utils/fecha';

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  color: '#374151',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  outline: 'none',
  boxSizing: 'border-box',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '14px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

export const Entradas: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const warehouseId = resolverWarehouseId(usuario, searchParams.get('sedeId'));

  const [materiales, setMateriales] = useState<MaterialBackend[]>([]);
  const [entradasList, setEntradasList] = useState<EntradaBackend[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const [busquedaMaterial, setBusquedaMaterial] = useState('');
  const [codigoSeleccionado, setCodigoSeleccionado] = useState('');
  const [entryNumber, setEntryNumber] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [fecha, setFecha] = useState<string>(hoyLocal());
  const [cantidad, setCantidad] = useState<number | ''>('');
  const [valorUnitario, setValorUnitario] = useState<number | ''>('');

  // Historial REAL desde la base de datos
  const cargarEntradas = useCallback(async () => {
    setCargando(true);
    try {
      setEntradasList(await obtenerEntradas(50, warehouseId));
      setError(null);
    } catch (err) {
      setEntradasList([]);
      setError(getErrorMessage(err, 'No se pudo cargar el historial de entradas'));
    } finally {
      setCargando(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    void cargarEntradas();
  }, [cargarEntradas]);

  // Catálogo de materiales (todos, no solo los que ya tienen inventario), con búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      obtenerMateriales(busquedaMaterial, 50)
        .then(setMateriales)
        .catch(() => setMateriales([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [busquedaMaterial]);

  const materialSeleccionado = materiales.find((m) => m.internal_code === codigoSeleccionado);
  const valorTotalCalculado = (Number(cantidad) || 0) * (Number(valorUnitario) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExito(null);
    if (!codigoSeleccionado || !cantidad || valorUnitario === '' || !entryNumber.trim()) return;

    setGuardando(true);
    try {
      await registrarEntrada(
        {
          internal_code: codigoSeleccionado,
          entry_number: entryNumber.trim(),
          quantity: Number(cantidad),
          unit_value: Number(valorUnitario),
          provider: proveedor.trim() || undefined,
          entry_date: fecha || undefined,
        },
        warehouseId
      );

      // Solo se limpia el formulario si el servidor confirmó el guardado
      setCodigoSeleccionado('');
      setEntryNumber('');
      setProveedor('');
      setCantidad('');
      setValorUnitario('');
      setFecha(hoyLocal());
      setExito('Entrada registrada en el servidor. El inventario y el dashboard ya están actualizados.');

      // Se vuelve a pedir la lista real (nada se fabrica en el navegador)
      await cargarEntradas();
    } catch (err) {
      // Si falla, el formulario se conserva para no perder lo digitado
      setError(getErrorMessage(err, 'No se pudo registrar la entrada. NO se guardó en el servidor.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#1f2937', margin: 0, fontWeight: 'bold' }}>
          Registro de Entradas
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
          Módulo operativo para el Encargado de Bodega ({usuario?.name || 'Almacenista'})
        </p>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '16px' }}>
          Registrar Nuevo Ingreso de Material
        </h2>

        {error && (
          <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        {exito && (
          <div style={{ color: '#065f46', backgroundColor: '#d1fae5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '16px' }}>
            {exito}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}
        >
          <div>
            <label style={labelStyle}>Buscar material</label>
            <input
              type="text"
              value={busquedaMaterial}
              onChange={(e) => setBusquedaMaterial(e.target.value)}
              placeholder="Nombre o código..."
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Material *</label>
            <select
              value={codigoSeleccionado}
              onChange={(e) => setCodigoSeleccionado(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">-- Seleccionar Material --</option>
              {materiales.map((item) => (
                <option key={item.id_material} value={item.internal_code}>
                  {item.internal_code} - {item.material_name} ({item.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Fecha de la entrada *</label>
            <input
              type="date"
              value={fecha}
              max={hoyLocal()}
              onChange={(e) => setFecha(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>N° Documento / Remisión *</label>
            <input
              type="text"
              value={entryNumber}
              onChange={(e) => setEntryNumber(e.target.value)}
              placeholder="Ej. FAC-001"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Proveedor</label>
            <input
              type="text"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Ej. Comercializadora Alfa"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Cantidad * {materialSeleccionado ? `(${materialSeleccionado.unit})` : ''}
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value ? Number(e.target.value) : '')}
              placeholder="0"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Valor Unitario ($) *</label>
            <input
              type="number"
              min="0"
              step="any"
              value={valorUnitario}
              onChange={(e) => setValorUnitario(e.target.value ? Number(e.target.value) : '')}
              placeholder="0.00"
              style={inputStyle}
              required
            />
          </div>

          <div
            style={{
              gridColumn: '1 / -1',
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 'bold', color: '#4b5563' }}>Valor Total Calculado:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#344e41' }}>
              ${valorTotalCalculado.toLocaleString()}
            </span>
          </div>

          <button
            type="submit"
            disabled={guardando}
            style={{
              gridColumn: '1 / -1',
              backgroundColor: guardando ? '#9ca3af' : '#344e41',
              color: '#fff',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: guardando ? 'not-allowed' : 'pointer',
            }}
          >
            {guardando ? 'Guardando...' : 'Guardar Entrada'}
          </button>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '16px' }}>
          Historial Reciente de Ingresos
        </h2>
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
              {cargando ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    Cargando historial de entradas...
                  </td>
                </tr>
              ) : entradasList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                    No hay entradas registradas aún.
                  </td>
                </tr>
              ) : (
                entradasList.map((item) => (
                  <tr key={item.id_entry} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#344e41' }}>{item.entry_number}</td>
                    <td style={{ padding: '12px' }}>{fechaCorta(item.entry_date)}</td>
                    <td style={{ padding: '12px' }}>{item.materials?.material_name || 'Material'}</td>
                    <td style={{ padding: '12px' }}>{item.provider || 'Sin proveedor'}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {item.quantity} {item.materials?.unit ?? ''}
                    </td>
                    <td style={{ padding: '12px' }}>${Number(item.unit_value).toLocaleString()}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981' }}>
                      ${Number(item.total_value).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};