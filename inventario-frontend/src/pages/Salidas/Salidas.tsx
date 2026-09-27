/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useInventario } from '../../context/InventarioContext';
import {
  obtenerSalidas,
  registrarSalida,
  type SalidaBackend,
} from '../../services/salidaService';
import {
  obtenerMiInventario,
  type ItemInventarioBackend,
} from '../../services/inventarioService';
import { getLocalSaveWarning } from '../../utils/offlineMode';

export const Salidas: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const { agregarSalida } = useInventario();

  const [materialesDisponibles, setMaterialesDisponibles] = useState<ItemInventarioBackend[]>([]);
  const [salidasList, setSalidasList] = useState<SalidaBackend[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  const [codigoSeleccionado, setCodigoSeleccionado] = useState('');
  const [exitNumber, setExitNumber] = useState('');
  const [centroCosto, setCentroCosto] = useState('');
  const [cantidad, setCantidad] = useState<number | ''>('');
  const [unitValue, setUnitValue] = useState<number | ''>('');
  const [errorStock, setErrorStock] = useState<string | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [invRes, exitRes] = await Promise.all([
        obtenerMiInventario('todos'),
        obtenerSalidas(50),
      ]);
      if (invRes && invRes.items) {
        setMaterialesDisponibles(invRes.items);
      }
      if (exitRes) {
        setSalidasList(exitRes);
      }
    } catch (err) {
      console.warn('Backend desconectado o error, usando datos locales:', err);
      setMaterialesDisponibles([
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
      ]);
    } finally {
      setCargando(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    void cargarDatos();
  }, []);

  const materialSeleccionado = materialesDisponibles.find(
    (m) => m.internal_code === codigoSeleccionado
  );
  const stockDisponible = materialSeleccionado ? materialSeleccionado.current_stock : 0;

  const handleCantidadChange = (val: number | '') => {
    setCantidad(val);
    if (materialSeleccionado && typeof val === 'number' && val > stockDisponible) {
      setErrorStock(
        `¡Alerta! La cantidad solicitada (${val}) supera el stock disponible (${stockDisponible} ${materialSeleccionado.unit}).`
      );
    } else {
      setErrorStock(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialSeleccionado || !cantidad || !centroCosto || !exitNumber) return;

    if (Number(cantidad) > stockDisponible) {
      alert('No se puede registrar la salida: Stock insuficiente');
      return;
    }

    const valorUnitarioFinal = Number(unitValue) || 0;

    const datosSalida = {
      internal_code: materialSeleccionado.internal_code,
      exit_number: exitNumber.trim(),
      cost_center: centroCosto.trim(),
      quantity: Number(cantidad),
      unit_value: valorUnitarioFinal,
    };

    try {
      await registrarSalida(datosSalida);

      const nuevaSalidaVisual: SalidaBackend = {
        id_exit: Date.now(),
        exit_number: exitNumber.trim(),
        warehouse_id: usuario?.warehouse_id || 1,
        material_id: materialSeleccionado.material_id,
        cost_center: centroCosto.trim(),
        quantity: Number(cantidad),
        unit_value: valorUnitarioFinal,
        total_value: Number(cantidad) * valorUnitarioFinal,
        exit_date: new Date().toISOString(),
        materials: {
          material_name: materialSeleccionado.material_name,
          internal_code: materialSeleccionado.internal_code,
          unit: materialSeleccionado.unit,
        },
      };

      setSalidasList((prev) => [nuevaSalidaVisual, ...prev]);

      // Descontar visualmente del stock local disponible
      setMaterialesDisponibles((prev) =>
        prev.map((m) =>
          m.internal_code === materialSeleccionado.internal_code
            ? { ...m, current_stock: m.current_stock - Number(cantidad) }
            : m
        )
      );

      // Contexto local
      agregarSalida({
        materialId: String(materialSeleccionado.material_id),
        descripcion: materialSeleccionado.material_name,
        centroCosto: centroCosto.trim(),
        cantidad: Number(cantidad),
        unidadMedida: materialSeleccionado.unit,
        registradoPor: usuario?.name || 'Almacenista',
      });

      setCodigoSeleccionado('');
      setExitNumber('');
      setCentroCosto('');
      setCantidad('');
      setUnitValue('');
      setErrorStock(null);
      alert('Salida registrada en el servidor.');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al registrar salida en backend';
      alert(`${msg}. ${getLocalSaveWarning()}`);

      setCodigoSeleccionado('');
      setExitNumber('');
      setCentroCosto('');
      setCantidad('');
      setUnitValue('');
      setErrorStock(null);
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
          Generar Vale de Salida
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              Material *
            </label>
            <select
              value={codigoSeleccionado}
              onChange={(e) => {
                setCodigoSeleccionado(e.target.value);
                setCantidad('');
                setErrorStock(null);
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                outline: 'none',
              }}
              required
            >
              <option value="">-- Seleccionar Material --</option>
              {materialesDisponibles.map((item) => (
                <option
                  key={item.id_inventory || item.internal_code}
                  value={item.internal_code}
                >
                  {item.internal_code} - {item.material_name} (Stock: {item.current_stock}{' '}
                  {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              N° Vale de Salida *
            </label>
            <input
              type="text"
              value={exitNumber}
              onChange={(e) => setExitNumber(e.target.value)}
              placeholder="Ej. VALE-001"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              Centro de Costos / Destino *
            </label>
            <input
              type="text"
              value={centroCosto}
              onChange={(e) => setCentroCosto(e.target.value)}
              placeholder="Ej. APTO 602 TORRE B"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              Cantidad a Despachar *
            </label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => handleCantidadChange(e.target.value ? Number(e.target.value) : '')}
              placeholder="0"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: '#374151',
              }}
            >
              Valor Unitario ($) (Opcional)
            </label>
            <input
              type="number"
              min="0"
              value={unitValue}
              onChange={(e) => setUnitValue(e.target.value ? Number(e.target.value) : '')}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                outline: 'none',
                boxSizing: 'border-box',
              }}
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
              <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                Stock Disponible Actual:
              </span>
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: stockDisponible > 0 ? '#10b981' : '#ef4444',
                }}
              >
                {stockDisponible} {materialSeleccionado.unit}
              </span>
            </div>
          )}

          {errorStock && (
            <div
              style={{
                gridColumn: '1 / -1',
                color: '#ef4444',
                backgroundColor: '#fef2f2',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
              }}
            >
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
              transition: 'background-color 0.2s',
            }}
          >
            Registrar Salida
          </button>
        </form>
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
          Historial de Despachos
        </h2>
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
                <th style={{ padding: '12px' }}>N° Vale</th>
                <th style={{ padding: '12px' }}>Fecha</th>
                <th style={{ padding: '12px' }}>Material</th>
                <th style={{ padding: '12px' }}>Centro de Costos</th>
                <th style={{ padding: '12px' }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    Cargando historial de salidas...
                  </td>
                </tr>
              ) : salidasList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                    No hay despachos registrados aún.
                  </td>
                </tr>
              ) : (
                salidasList.map((item) => (
                  <tr key={item.id_exit} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#344e41' }}>
                      {item.exit_number}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.exit_date ? item.exit_date.split('T')[0] : 'Hoy'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.materials?.material_name || item.internal_code || 'Material'}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#374151' }}>
                      {item.cost_center}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#ef4444' }}>
                      -{item.quantity} {item.materials?.unit || 'UN'}
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