/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useInventario } from '../../context/InventarioContext';
import {
  obtenerEntradas,
  registrarEntrada,
  type EntradaBackend,
} from '../../services/entradaService';
import {
  obtenerMiInventario,
  type ItemInventarioBackend,
} from '../../services/inventarioService';
import { obtenerMateriales, type MaterialBackend } from '../../services/materialService';
import { getLocalSaveWarning } from '../../utils/offlineMode';

export const Entradas: React.FC = () => {
  const { usuario } = useContext(AuthContext);
  const { agregarEntrada } = useInventario();

  const [materialesDisponibles, setMaterialesDisponibles] = useState<ItemInventarioBackend[]>([]);
  const [entradasList, setEntradasList] = useState<EntradaBackend[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  const [codigoSeleccionado, setCodigoSeleccionado] = useState('');
  const [entryNumber, setEntryNumber] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [cantidad, setCantidad] = useState<number | ''>('');
  const [valorUnitario, setValorUnitario] = useState<number | ''>('');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [invRes, entRes, materialesRes] = await Promise.all([
        obtenerMiInventario('todos'),
        obtenerEntradas(50),
        obtenerMateriales(),
      ]);

      const materiales = Array.isArray(invRes?.items) && invRes.items.length > 0
        ? invRes.items
        : (materialesRes as MaterialBackend[]).map((item) => ({
            id_inventory: Number(item.id_material ?? 0),
            material_id: Number(item.id_material ?? 0),
            material_name: item.material_name,
            internal_code: item.internal_code,
            unit: item.unit,
            category: item.category,
            activo: true,
            current_stock: 0,
            min_stock: Number(item.min_stock ?? 0),
            estado: 'ok' as const,
          }));

      setMaterialesDisponibles(materiales);
      setEntradasList(Array.isArray(entRes) ? entRes : []);
    } catch (err) {
      console.warn('Backend desconectado o error.', err);
      setMaterialesDisponibles([]);
      setEntradasList([]);
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
  const valorTotalCalculado = (Number(cantidad) || 0) * (Number(valorUnitario) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialSeleccionado || !cantidad || !valorUnitario || !entryNumber) return;

    const datosEntrada = {
      internal_code: materialSeleccionado.internal_code,
      entry_number: entryNumber.trim(),
      quantity: Number(cantidad),
      unit_value: Number(valorUnitario),
      provider: proveedor.trim() || undefined,
    };

    try {
      await registrarEntrada(datosEntrada);

      // Crear entrada visualmente
      const nuevaEntradaVisual: EntradaBackend = {
        id_entry: Date.now(),
        entry_number: entryNumber.trim(),
        warehouse_id: usuario?.warehouse_id || 1,
        material_id: materialSeleccionado.material_id,
        provider: proveedor.trim() || 'Sin proveedor',
        quantity: Number(cantidad),
        unit_value: Number(valorUnitario),
        total_value: valorTotalCalculado,
        entry_date: new Date().toISOString(),
        materials: {
          material_name: materialSeleccionado.material_name,
          internal_code: materialSeleccionado.internal_code,
          unit: materialSeleccionado.unit,
        },
      };

      setEntradasList((prev) => [nuevaEntradaVisual, ...prev]);

      // Refrescar inventario local
      agregarEntrada({
        materialId: String(materialSeleccionado.material_id),
        descripcion: materialSeleccionado.material_name,
        proveedor: proveedor.trim() || 'Sin proveedor',
        cantidad: Number(cantidad),
        valorUnitario: Number(valorUnitario),
        valorTotal: valorTotalCalculado,
      });

      setCodigoSeleccionado('');
      setEntryNumber('');
      setProveedor('');
      setCantidad('');
      setValorUnitario('');
      alert('Entrada registrada en el servidor.');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al registrar entrada en backend';
      alert(`${msg}. ${getLocalSaveWarning()}`);

      setCodigoSeleccionado('');
      setEntryNumber('');
      setProveedor('');
      setCantidad('');
      setValorUnitario('');
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
          Registrar Nuevo Ingreso de Material
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
              onChange={(e) => setCodigoSeleccionado(e.target.value)}
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
                <option key={item.id_inventory || item.internal_code} value={item.internal_code}>
                  {item.internal_code} - {item.material_name} ({item.unit})
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
              N° Documento / Remisión *
            </label>
            <input
              type="text"
              value={entryNumber}
              onChange={(e) => setEntryNumber(e.target.value)}
              placeholder="Ej. FAC-001"
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
              Proveedor
            </label>
            <input
              type="text"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Ej. Comercializadora Alfa"
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
              Cantidad *
            </label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value ? Number(e.target.value) : '')}
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
              Valor Unitario ($) *
            </label>
            <input
              type="number"
              min="0"
              value={valorUnitario}
              onChange={(e) => setValorUnitario(e.target.value ? Number(e.target.value) : '')}
              placeholder="0.00"
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
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#344e41' }}>
              ${valorTotalCalculado.toLocaleString()}
            </span>
          </div>

          <button
            type="submit"
            style={{
              gridColumn: '1 / -1',
              backgroundColor: '#344e41',
              color: '#fff',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Guardar Entrada
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
          Historial Reciente de Ingresos
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
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#344e41' }}>
                      {item.entry_number}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.entry_date ? item.entry_date.split('T')[0] : 'Hoy'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.materials?.material_name || item.internal_code || 'Material'}
                    </td>
                    <td style={{ padding: '12px' }}>{item.provider || 'Sin proveedor'}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.quantity}</td>
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