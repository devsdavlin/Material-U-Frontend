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
import { MAX_NUMERO_DOCUMENTO, numeroDeLinea, siguienteIdLinea } from '../../utils/lote';

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

interface LineaSalida {
  id: number;
  codigo: string;
  cantidad: number | '';
  valorUnitario: number | '';
  // Número ya asignado a una línea que falló, para reintentar sin duplicar las que sí se guardaron
  numeroFijo?: string;
}

const nuevaLinea = (): LineaSalida => ({ id: siguienteIdLinea(), codigo: '', cantidad: '', valorUnitario: '' });

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
  const [catalogo, setCatalogo] = useState<Record<string, ItemInventarioBackend>>({});
  const [lineas, setLineas] = useState<LineaSalida[]>(() => [nuevaLinea()]);
  const [exitNumber, setExitNumber] = useState('');
  const [centroCosto, setCentroCosto] = useState('');
  const [fecha, setFecha] = useState<string>(hoyLocal());

  // Solo se puede sacar lo que existe en el inventario real de la sede
  const cargarInventario = useCallback(
    async (q: string) => {
      try {
        const res = await obtenerMiInventario('todos', q, warehouseId);
        setMaterialesDisponibles(res.items);
        // Se recuerda el stock más reciente de cada material visto (las líneas lo consultan aquí)
        setCatalogo((prev) => ({ ...prev, ...Object.fromEntries(res.items.map((m) => [m.internal_code, m])) }));
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

  const codigosUsados = new Set(lineas.map((l) => l.codigo).filter(Boolean));
  const valorTotalCalculado = lineas.reduce(
    (acc, l) => acc + (Number(l.cantidad) || 0) * (Number(l.valorUnitario) || 0),
    0
  );

  // Opciones de una línea: el resultado de la búsqueda + el material que ya tenía elegido
  const opcionesDeLinea = (linea: LineaSalida): ItemInventarioBackend[] => {
    const elegido = linea.codigo ? catalogo[linea.codigo] : undefined;
    return elegido && !materialesDisponibles.some((m) => m.internal_code === elegido.internal_code)
      ? [elegido, ...materialesDisponibles]
      : materialesDisponibles;
  };

  // Mensaje de stock de una línea (null si está bien)
  const errorStockDe = (linea: LineaSalida): string | null => {
    const m = linea.codigo ? catalogo[linea.codigo] : undefined;
    if (m && typeof linea.cantidad === 'number' && linea.cantidad > m.current_stock) {
      return `La cantidad (${linea.cantidad}) supera el stock disponible (${m.current_stock} ${m.unit}).`;
    }
    return null;
  };
  const hayErrorStock = lineas.some((l) => errorStockDe(l) !== null);

  const actualizarLinea = (id: number, cambios: Partial<LineaSalida>) =>
    setLineas((prev) => prev.map((l) => (l.id === id ? { ...l, ...cambios } : l)));
  const agregarLinea = () => setLineas((prev) => [...prev, nuevaLinea()]);
  const quitarLinea = (id: number) =>
    setLineas((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));

  const handleNumeroChange = (valor: string) => {
    setExitNumber(valor);
    // Si cambia el número base, los números fijados por un intento fallido ya no aplican
    setLineas((prev) => prev.map((l) => ({ ...l, numeroFijo: undefined })));
  };

  const baseNumero = exitNumber.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExito(null);
    if (!baseNumero || !centroCosto.trim()) return;

    if (lineas.some((l) => !l.codigo || !l.cantidad)) {
      setError('Completa material y cantidad en todas las líneas (o quita las que sobren).');
      return;
    }
    if (hayErrorStock) {
      setError('No se puede registrar la salida: hay materiales con stock insuficiente.');
      return;
    }

    const total = lineas.length;
    const numeros = lineas.map((l, i) => l.numeroFijo ?? numeroDeLinea(baseNumero, i, total));
    if (numeros.some((n) => n.length > MAX_NUMERO_DOCUMENTO)) {
      setError(`El número de vale es muy largo: con varios materiales se le agrega un sufijo y el máximo es ${MAX_NUMERO_DOCUMENTO} caracteres.`);
      return;
    }

    setGuardando(true);
    let guardadas = 0;
    const fallidas: { linea: LineaSalida; mensaje: string }[] = [];

    // Un registro por material, uno detrás de otro (el backend descuenta el saldo de cada uno)
    for (let i = 0; i < total; i++) {
      const l = lineas[i];
      try {
        await registrarSalida(
          {
            internal_code: l.codigo,
            exit_number: numeros[i],
            cost_center: centroCosto.trim(),
            quantity: Number(l.cantidad),
            unit_value: Number(l.valorUnitario) || 0,
            exit_date: fecha || undefined,
          },
          warehouseId
        );
        guardadas++;
      } catch (err) {
        fallidas.push({
          linea: { ...l, numeroFijo: numeros[i] },
          mensaje: getErrorMessage(err, 'No se pudo registrar'),
        });
      }
    }

    if (fallidas.length === 0) {
      // Solo se limpia el formulario si el servidor confirmó TODO
      setLineas([nuevaLinea()]);
      setExitNumber('');
      setCentroCosto('');
      setFecha(hoyLocal());
      setExito(
        total === 1
          ? 'Salida registrada en el servidor. El inventario y el dashboard ya están actualizados.'
          : `${total} salidas registradas en el servidor. El inventario y el dashboard ya están actualizados.`
      );
    } else {
      // Se conservan solo las líneas que fallaron para poder corregirlas y reintentar
      setLineas(fallidas.map((f) => f.linea));
      const detalle = fallidas
        .map((f) => `${f.linea.codigo} (${f.linea.numeroFijo}): ${f.mensaje}`)
        .join(' | ');
      setError(
        guardadas === 0
          ? `NO se guardó nada en el servidor. ${detalle}`
          : `Se guardaron ${guardadas} de ${total}. Faltan por guardar (siguen en el formulario): ${detalle}`
      );
      if (guardadas > 0) setExito(`${guardadas} de ${total} salidas ya quedaron registradas.`);
    }

    // Se vuelve a pedir todo al servidor: stock real y lista real
    await Promise.all([cargarSalidas(), cargarInventario(busquedaMaterial)]);
    setGuardando(false);
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
          Generar Vale de Salida (uno o varios materiales)
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
              onChange={(e) => handleNumeroChange(e.target.value)}
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

          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1f2937' }}>
                Materiales a despachar ({lineas.length})
              </h3>
              <div style={{ minWidth: '240px', flex: '0 1 320px' }}>
                <label style={labelStyle}>Buscar material (filtra las listas)</label>
                <input
                  type="text"
                  value={busquedaMaterial}
                  onChange={(e) => setBusquedaMaterial(e.target.value)}
                  placeholder="Nombre o código..."
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lineas.map((linea, indice) => {
                const material = linea.codigo ? catalogo[linea.codigo] : undefined;
                const errorLinea = errorStockDe(linea);
                const subtotal = (Number(linea.cantidad) || 0) * (Number(linea.valorUnitario) || 0);
                return (
                  <div
                    key={linea.id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      border: `1px solid ${errorLinea ? '#fecaca' : '#e5e7eb'}`,
                      borderRadius: '10px',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                        gap: '12px',
                        alignItems: 'end',
                      }}
                    >
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Material {indice + 1} *</label>
                        <select
                          value={linea.codigo}
                          onChange={(e) => actualizarLinea(linea.id, { codigo: e.target.value, cantidad: '' })}
                          style={inputStyle}
                          required
                        >
                          <option value="">-- Seleccionar Material --</option>
                          {opcionesDeLinea(linea).map((item) => (
                            <option
                              key={item.id_inventory}
                              value={item.internal_code}
                              disabled={codigosUsados.has(item.internal_code) && item.internal_code !== linea.codigo}
                            >
                              {item.internal_code} - {item.material_name} (Stock: {item.current_stock} {item.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={labelStyle}>
                          Cantidad * {material ? `(${material.unit})` : ''}
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          value={linea.cantidad}
                          onChange={(e) => actualizarLinea(linea.id, { cantidad: e.target.value ? Number(e.target.value) : '' })}
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
                          value={linea.valorUnitario}
                          onChange={(e) => actualizarLinea(linea.id, { valorUnitario: e.target.value ? Number(e.target.value) : '' })}
                          placeholder="0.00"
                          style={inputStyle}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#ef4444' }}>${subtotal.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => quitarLinea(linea.id)}
                          disabled={lineas.length === 1}
                          title="Quitar este material"
                          style={{
                            border: '1px solid #fecaca',
                            backgroundColor: '#fff',
                            color: lineas.length === 1 ? '#d1d5db' : '#b91c1c',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            cursor: lineas.length === 1 ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>

                    {material && (
                      <div style={{ marginTop: '8px', fontSize: '0.8rem', color: material.current_stock > 0 ? '#047857' : '#b91c1c' }}>
                        Stock disponible: <strong>{material.current_stock} {material.unit}</strong>
                      </div>
                    )}
                    {errorLinea && (
                      <div style={{ marginTop: '6px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {errorLinea}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={agregarLinea}
              style={{
                marginTop: '12px',
                backgroundColor: '#fff',
                color: '#344e41',
                border: '1px dashed #344e41',
                borderRadius: '8px',
                padding: '10px 16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              + Agregar otro material
            </button>

            {lineas.length > 1 && baseNumero && (
              <p style={{ margin: '12px 0 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
                Cada material se guarda como un registro con su propio número: {numeroDeLinea(baseNumero, 0, lineas.length)}, {numeroDeLinea(baseNumero, 1, lineas.length)}
                {lineas.length > 2 ? ', ...' : ''}
              </p>
            )}
          </div>

          {valorTotalCalculado > 0 && (
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
              <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Valor total del vale:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#344e41' }}>
                ${valorTotalCalculado.toLocaleString()}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={hayErrorStock || guardando}
            style={{
              gridColumn: '1 / -1',
              backgroundColor: hayErrorStock || guardando ? '#9ca3af' : '#344e41',
              color: '#fff',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: hayErrorStock || guardando ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {guardando ? 'Guardando...' : lineas.length > 1 ? `Registrar ${lineas.length} Salidas` : 'Registrar Salida'}
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