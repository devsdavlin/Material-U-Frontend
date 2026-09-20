import React, { useState } from 'react';
import { useInventario } from '../../context/InventarioContext';
import type { Material } from '../../context/InventarioContext';

export const Materiales: React.FC = () => {
  const { materiales, agregarMaterial, eliminarMaterial, entradas, salidas } = useInventario();

  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('UN');
  const [categoria, setCategoria] = useState('');
  const [stockMinimo, setStockMinimo] = useState<number | ''>('');
  const [kardexMaterial, setKardexMaterial] = useState<Material | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo || !descripcion || !categoria || !stockMinimo) return;

    agregarMaterial({
      codigo,
      descripcion,
      unidadMedida,
      categoria,
      stockMinimo: Number(stockMinimo),
    });

    setCodigo('');
    setDescripcion('');
    setCategoria('');
    setStockMinimo('');
    alert('¡Material registrado y disponible!');
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (window.confirm(`¿Estás segura de eliminar el material "${nombre}"?`)) {
      eliminarMaterial(id);
    }
  };

  const entradasMaterial = entradas.filter((e) => e.materialId === kardexMaterial?.id);
  const salidasMaterial = salidas.filter((s) => s.materialId === kardexMaterial?.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#1f2937', margin: 0, fontWeight: 'bold' }}>
          Catálogo de Materiales y Kardex
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
          Gestión de materiales y trazabilidad de movimientos
        </p>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '16px' }}>Crear Nuevo Material</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Código Interno *</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej. MIG 004"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Descripción / Nombre *</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Cemento Blanco x 50kg"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Unidad de Medida *</label>
            <select
              value={unidadMedida}
              onChange={(e) => setUnidadMedida(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
            >
              <option value="UN">Unidad (UN)</option>
              <option value="GL">Galón (GL)</option>
              <option value="KG">Kilogramo (KG)</option>
              <option value="MT">Metro (MT)</option>
              <option value="M2">Metro Cuadrado (M2)</option>
              <option value="Bto">Bulto (Bto)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Categoría / Tipo *</label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ej. Obra Gris"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151' }}>Stock Mínimo Alerta *</label>
            <input
              type="number"
              min="1"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value ? Number(e.target.value) : '')}
              placeholder="5"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          <button
            type="submit"
            style={{ gridColumn: '1 / -1', backgroundColor: '#344e41', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
          >
            Guardar Material
          </button>
        </form>
      </div>

      {/* Tabla Maestro de Materiales */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '16px' }}>Catálogo Activo</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>Código</th>
                <th style={{ padding: '12px' }}>Descripción</th>
                <th style={{ padding: '12px' }}>U.M.</th>
                <th style={{ padding: '12px' }}>Categoría</th>
                <th style={{ padding: '12px' }}>Stock Mínimo</th>
                <th style={{ padding: '12px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#344e41' }}>{item.codigo}</td>
                  <td style={{ padding: '12px' }}>{item.descripcion}</td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>{item.unidadMedida}</td>
                  <td style={{ padding: '12px' }}>{item.categoria}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#f59e0b' }}>{item.stockMinimo} {item.unidadMedida}</td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setKardexMaterial(item)}
                      style={{ padding: '6px 12px', backgroundColor: '#ec4899', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Kardex
                    </button>
                    <button
                      onClick={() => handleEliminar(item.id, item.descripcion)}
                      style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Kardex */}
      {kardexMaterial && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
        }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 8px 0', color: '#1f2937' }}>
              Historial Kardex: {kardexMaterial.codigo}
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 20px 0', fontSize: '0.9rem' }}>{kardexMaterial.descripcion}</p>
            
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><strong>Categoría:</strong> {kardexMaterial.categoria}</p>
              <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><strong>Unidad:</strong> {kardexMaterial.unidadMedida}</p>
              <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><strong>Stock Alerta Mínimo:</strong> {kardexMaterial.stockMinimo}</p>
            </div>

            <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Trazabilidad de Movimientos</h3>
            
            {entradasMaterial.length === 0 && salidasMaterial.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>No hay movimientos registrados para este material aún. 🌸</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '8px' }}>Tipo</th>
                    <th style={{ padding: '8px' }}>Referencia</th>
                    <th style={{ padding: '8px' }}>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {entradasMaterial.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px', color: '#10b981', fontWeight: 'bold' }}>ENTRADA</td>
                      <td style={{ padding: '8px' }}>{e.codigoMig} ({e.proveedor})</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#10b981' }}>+{e.cantidad}</td>
                    </tr>
                  ))}
                  {salidasMaterial.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px', color: '#ef4444', fontWeight: 'bold' }}>SALIDA</td>
                      <td style={{ padding: '8px' }}>{s.codigoVale} ({s.centroCosto})</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#ef4444' }}>-{s.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button
              onClick={() => setKardexMaterial(null)}
              style={{ marginTop: '24px', width: '100%', padding: '10px', backgroundColor: '#344e41', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cerrar Kardex
            </button>
          </div>
        </div>
      )}
    </div>
  );
};