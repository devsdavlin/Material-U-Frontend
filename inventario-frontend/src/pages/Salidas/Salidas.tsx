import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  obtenerSalidas,
  registrarSalida,
  type SalidaBackend,
} from '../../services/salidaService';
import {
  obtenerMiInventario,
  type ItemInventarioBackend,
} from '../../services/inventarioService';
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

export const Salidas: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const warehouseId = resolverWarehouseId(usuario, searchParams.get('sedeId'));

  const [materialesDisponibles, setMaterialesDisponibles] = useState<ItemInventarioBackend[]>([]);
  const [salidasList, setSalidasList] = useState<SalidaBackend[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const [busquedaMaterial, setBusquedaMaterial] = useState('');
  const [codigoSeleccionado, setCodigoSeleccionado] = useState('');
  const [exitNumber, setExitNumber] = useState('');
  const [centroCosto, setCentroCosto] = useState('');
  const [fecha, setFecha] = useState<string>(hoyLocal());
  const [cantidad, setCantidad] = useState<number | ''>('');
  const [unitValue, setUnitValue] = useState<number | ''>('');
  const [errorStock, setErrorStock] = useState<string | null>(null);

  // Solo se puede sacar lo que existe en el inventario real de la sede
  const cargarInventario = useCallback(
    async (q: string) => {
      try {
        const res = await obtenerMiInventario('todos', q, warehouseId);
        setMaterialesDisponibles(res.items);
      } catch (err) {
        setMaterialesDisponibles([]);
        setError(getErrorMessage(err, 'No se pudo cargar el inventario'));
      }
    },
    [warehouseId]
  );

  const cargarSalidas = useCallback(async () => {
    setCargando(true);
    try {
      setSalidasList(await obtenerSalidas(50, warehouseId));
    } catch (err) {
      setSalidasList([]);
      setError(getErrorMessage(err, 'No se pudo cargar el historial de salidas'));
    } finally {
      setCargando(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    void cargarSalidas();
  }, [cargarSalidas]);

  useEffect(() => {
    const timer = setTimeout(() => void cargarInventario(busquedaMaterial), 250);
    return () => clearTimeout(timer);
  }, [busquedaMaterial, cargarInventario]);

  const materialSeleccionado = materialesDisponibles.find(
    (m) => m.internal_code === codigoSeleccionado
  );
  const stockDisponible = materialSeleccionado ? materialSeleccionado.current_stock : 0;

  const validarStock = (val: number | '', material = materialSeleccionado) => {
    if (material && typeof val === 'number' && val > material.current_stock) {
      setErrorStock(
        `¡Alerta! La cantidad solicitada (${val}) supera el stock disponible (${material.current_stock} ${material.unit}).`
      );
    } else {
      setErrorStock(null);
    }
  };

  const handleCantidadChange = (val: number | '') => {
    setCantidad(val);
    validarStock(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExito(null);
    if (!materialSeleccionado || !cantidad || !centroCosto.trim() || !exitNumber.trim()) return;

    if (Number(cantidad) > stockDisponible) {
      setError('No se puede registrar la salida: stock insuficiente');
      return;
    }

    setGuardando(true);
    try {
      await registrarSalida(
        {
          internal_code: materialSeleccionado.internal_code,
          exit_number: exitNumber.trim(),
          cost_center: centroCosto.trim(),
          quantity: Number(cantidad),
          unit_value: Number(unitValue) || 0,
          exit_date: fecha || undefined,
        },
        warehouseId
      );

      setCodigoSeleccionado('');
      setExitNumber('');
      setCentroCosto('');
      setCantidad('');
      setUnitValue('');
      setFecha(hoyLocal());
      setErrorStock(null);
      setExito('Salida registrada en el servidor. El inventario y el dashboard ya están actualizados.');

      // Se vuelve a pedir todo al servidor: stock real y lista real
      await Promise.all([cargarSalidas(), cargarInventario(busquedaMaterial)]);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo registrar la salida. NO se guardó en el servidor.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#1f2937', margin: 0, fontWeight: 'bold' }}>
          Registro de Salidas / Despachos
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
          Asignación de materiales a centros de costos en obra ({usuario?.name || 'Almacenista'})
        </p>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '16px' }}>
          Generar Vale de Salida
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
              onChange={(e) => {
                setCodigoSeleccionado(e.target.value);
                setCantidad('');
                setErrorStock(null);
              }}
              style={inputStyle}
              required
            >
              <option value="">-- Seleccionar Material --</option>
              {materialesDisponibles.map((item) => (
                <option key={item.id_inventory} value={item.internal_code}>
                  {item.internal_code} - {item.material_name} (Stock: {item.current_stock} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Fecha de la salida *</label>
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
            <label style={labelStyle}>N° Vale de Salida *</label>
            <input
              type="text"
              value={exitNumber}
              onChange={(e) => setExitNumber(e.target.value)}
              placeholder="Ej. VALE-001"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Centro de Costos / Destino *</label>
            <input
              type="text"
              value={centroCosto}
              onChange={(e) => setCentroCosto(e.target.value)}
              placeholder="Ej. APTO 602 TORRE B"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Cantidad a Despachar *</label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={cantidad}
              onChange={(e) => handleCantidadChange(e.target.value ? Number(e.target.value) : '')}
              placeholder="0"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Valor Unitario ($) (Opcional)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={unitValue}
              onChange={(e) => setUnitValue(e.target.value ? Number(e.target.value) : '')}
              placeholder="0.00"
              style={inputStyle}
            />
          </div>

          {materialSeleccionado && (
            <div
              style={{
                gridColumn: '1 / -1',
                backgroundColor: '#f9fafb',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Stock Disponible Actual:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: stockDisponible > 0 ? '#10b981' : '#ef4444' }}>
                {stockDisponible} {materialSeleccionado.unit}
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
            disabled={!!errorStock || guardando}
            style={{
              gridColumn: '1 / -1',
              backgroundColor: errorStock || guardando ? '#9ca3af' : '#344e41',
              color: '#fff',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: errorStock || guardando ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {guardando ? 'Guardando...' : 'Registrar Salida'}
          </button>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '16px' }}>
          Historial de Despachos
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>N° Vale</th>
                <th style={{ padding: '12px' }}>Fecha</th>
                <th style={{ padding: '12px' }}>Material</th>
                <th style={{ padding: '12px' }}>Centro de Costos</th>
                <th style={{ padding: '12px' }}>Cantidad</th>
                <th style={{ padding: '12px' }}>Valor Unit.</th>
                <th style={{ padding: '12px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    Cargando historial de salidas...
                  </td>
                </tr>
              ) : salidasList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                    No hay despachos registrados aún.
                  </td>
                </tr>
              ) : (
                salidasList.map((item) => (
                  <tr key={item.id_exit} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#344e41' }}>{item.exit_number}</td>
                    <td style={{ padding: '12px' }}>{fechaCorta(item.exit_date)}</td>
                    <td style={{ padding: '12px' }}>{item.materials?.material_name || 'Material'}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#374151' }}>{item.cost_center || '—'}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#ef4444' }}>
                      -{item.quantity} {item.materials?.unit || 'UN'}
                    </td>
                    <td style={{ padding: '12px' }}>${Number(item.unit_value).toLocaleString()}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#ef4444' }}>
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