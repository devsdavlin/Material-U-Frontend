import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { obtenerSedesActivas, type Sede } from '../../services/sedeService';
import { obtenerEntradas, type EntradaBackend } from '../../services/entradaService';
import { obtenerSalidas, type SalidaBackend } from '../../services/salidaService';
import { obtenerMiInventario, type ItemInventarioBackend } from '../../services/inventarioService';
import { getErrorMessage } from '../../utils/apiError';

const VERDE = '#123b2b';
const VERDE_SUAVE = '#2f7d5b';
const MANTEQUILLA = '#f6e7a8';
const MANTEQUILLA_FUERTE = '#d9b93e';
const BORDE = '#e8ece8';
const GRIS = '#6b7280';

const PERIODOS = [
  { k: 'hoy', l: 'Hoy', dias: 1, g: 'dia' },
  { k: '7d', l: '7 días', dias: 7, g: 'dia' },
  { k: '30d', l: '30 días', dias: 30, g: 'dia' },
  { k: '3m', l: '3 meses', dias: 90, g: 'semana' },
  { k: '1a', l: '1 año', dias: 365, g: 'mes' },
] as const;
type Periodo = (typeof PERIODOS)[number];

interface DatosSede {
  sede: Sede;
  inv: ItemInventarioBackend[];
  ent: EntradaBackend[];
  sal: SalidaBackend[];
}
interface Mov {
  tipo: 'entrada' | 'salida';
  fecha: Date;
  valor: number;
  sede: string;
  numero: string;
  material: string;
  cantidad: number;
  unidad: string;
  id: number;
}

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '24px',
  border: `1px solid ${BORDE}`,
  boxShadow: '0 1px 2px rgba(15,41,30,0.04), 0 8px 24px rgba(15,41,30,0.04)',
  padding: '24px',
};

const aFecha = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
};
const sumarDias = (f: Date, n: number) => new Date(f.getFullYear(), f.getMonth(), f.getDate() + n);
const dinero = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString('es-CO')}`;
const corto = (n: number) => {
  const a = Math.abs(n);
  const s = a >= 1e6 ? `${(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `${Math.round(a / 1e3)}k` : String(Math.round(a));
  return n < 0 ? `-${s}` : s;
};
const fmtFecha = (f: Date) => `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}/${f.getFullYear()}`;
const variacion = (actual: number, previo: number): number | null =>
  previo === 0 ? null : ((actual - previo) / Math.abs(previo)) * 100;

const iniciosDeBloques = (p: Periodo, inicio: Date, hoy: Date): Date[] => {
  const r: Date[] = [];
  if (p.g === 'mes') {
    for (let d = new Date(inicio.getFullYear(), inicio.getMonth(), 1); d <= hoy; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) r.push(d);
  } else {
    for (let d = inicio; d <= hoy; d = sumarDias(d, p.g === 'semana' ? 7 : 1)) r.push(d);
  }
  return r;
};
const etiqueta = (f: Date, p: Periodo) =>
  p.g === 'mes'
    ? f.toLocaleDateString('es-CO', { month: 'short' })
    : `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}`;

const Icono: React.FC<{ d: string; color?: string }> = ({ d, color = VERDE }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ICONOS = {
  ingreso: 'M17 7L7 17M7 17h8M7 17V9',
  egreso: 'M7 17L17 7M17 7H9M17 7v8',
  saldo: 'M4 7h16v12H4zM4 7l2-3h12l2 3M16 13h.01',
  margen: 'M19 5L5 19M7.5 7.5h.01M16.5 16.5h.01',
};

const Variacion: React.FC<{ pct: number | null; claro?: boolean; puntos?: boolean }> = ({ pct, claro, puntos }) => {
  if (pct === null) return <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Sin datos del período anterior</span>;
  const sube = pct >= 0;
  return (
    <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', backgroundColor: claro ? 'rgba(255,255,255,0.18)' : sube ? '#e4f3ec' : '#fdecec', color: claro ? '#fff' : sube ? VERDE_SUAVE : '#b91c1c' }}>
      {sube ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}{puntos ? ' pts' : '%'} vs. anterior
    </span>
  );
};

const Kpi: React.FC<{ titulo: string; valor: string; icono: string; pct: number | null; variante?: 'verde' | 'mantequilla'; puntos?: boolean }> = ({ titulo, valor, icono, pct, variante, puntos }) => {
  const verde = variante === 'verde';
  return (
    <div style={{ ...card, backgroundColor: verde ? VERDE : variante === 'mantequilla' ? MANTEQUILLA : '#fff', color: verde ? '#fff' : '#0f291e', border: verde ? 'none' : card.border, display: 'flex', flexDirection: 'column', gap: '18px', minHeight: '150px', justifyContent: 'space-between', minWidth: 0, containerType: 'inline-size' } as React.CSSProperties}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 600, opacity: verde ? 0.9 : 0.75 }}>{titulo}</span>
        <span style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: verde ? 'rgba(255,255,255,0.16)' : '#f0f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icono d={icono} color={verde ? '#fff' : VERDE} />
        </span>
      </div>
      {/* El tamaño se ajusta al ancho de la tarjeta y a la cantidad de dígitos, así cifras grandes (millones) no se salen */}
      <div style={{ fontSize: `clamp(1.2rem, ${(100 / (Math.max(valor.length, 6) * 0.66)).toFixed(2)}cqw, 2.4rem)`, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1, whiteSpace: 'nowrap' }}>{valor}</div>
      <Variacion pct={pct} claro={verde} puntos={puntos} />
    </div>
  );
};

export const DashboardAdmin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeSel, setSedeSel] = useState<string>(searchParams.get('sedeId') ?? 'todas');
  const [periodoK, setPeriodoK] = useState<Periodo['k']>('30d');
  const [datos, setDatos] = useState<DatosSede[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    obtenerSedesActivas().then((s) => { setSedes(s); if (s.length === 0) setCargando(false); }).catch((e) => setError(getErrorMessage(e, 'No se pudieron cargar las sedes')));
  }, []);

  // Todo sale de la base de datos real: inventario, entradas y salidas de cada sede.
  useEffect(() => {
    if (sedes.length === 0) return;
    let cancelado = false;
    const objetivo = sedeSel === 'todas' ? sedes : sedes.filter((s) => s.id === sedeSel);
    const cargar = async () => {
      setCargando(true);
      try {
        const r = await Promise.all(
          objetivo.map(async (sede) => {
            const wid = Number(sede.id);
            const [inv, ent, sal] = await Promise.all([obtenerMiInventario('todos', '', wid), obtenerEntradas(100, wid), obtenerSalidas(100, wid)]);
            return { sede, inv: inv.items, ent, sal } as DatosSede;
          })
        );
        if (!cancelado) { setDatos(r); setError(null); }
      } catch (e) {
        if (!cancelado) setError(getErrorMessage(e, 'No se pudo cargar el dashboard'));
      } finally {
        if (!cancelado) setCargando(false);
      }
    };
    void cargar();
    return () => { cancelado = true; };
  }, [sedes, sedeSel]);

  const periodo = PERIODOS.find((p) => p.k === periodoK) ?? PERIODOS[2];

  const calc = useMemo(() => {
    const ahora = new Date();
    const hoyLocal = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const inicio = sumarDias(hoyLocal, -(periodo.dias - 1));
    const inicioPrev = sumarDias(inicio, -periodo.dias);

    const movs: Mov[] = [];
    datos.forEach(({ sede, ent, sal }) => {
      ent.forEach((e) => { const f = aFecha(e.entry_date); if (f) movs.push({ tipo: 'entrada', fecha: f, valor: Number(e.total_value), sede: sede.nombre, numero: e.entry_number, material: e.materials?.material_name ?? 'Material', cantidad: Number(e.quantity), unidad: e.materials?.unit ?? '', id: e.id_entry }); });
      sal.forEach((s) => { const f = aFecha(s.exit_date); if (f) movs.push({ tipo: 'salida', fecha: f, valor: Number(s.total_value), sede: sede.nombre, numero: s.exit_number, material: s.materials?.material_name ?? 'Material', cantidad: Number(s.quantity), unidad: s.materials?.unit ?? '', id: s.id_exit }); });
    });

    const suma = (l: Mov[], t: Mov['tipo']) => l.filter((m) => m.tipo === t).reduce((a, m) => a + m.valor, 0);
    const actual = movs.filter((m) => m.fecha >= inicio && m.fecha <= hoyLocal);
    const previo = movs.filter((m) => m.fecha >= inicioPrev && m.fecha < inicio);
    const ing = suma(actual, 'entrada'), egr = suma(actual, 'salida');
    const ingP = suma(previo, 'entrada'), egrP = suma(previo, 'salida');
    const margen = ing > 0 ? ((ing - egr) / ing) * 100 : 0;
    const margenP = ingP > 0 ? ((ingP - egrP) / ingP) * 100 : null;

    // Serie del gráfico (saldo acumulado dentro del período)
    const inicios = iniciosDeBloques(periodo, inicio, hoyLocal);
    const bloques = inicios.map((f, i) => {
      const sig = inicios[i + 1];
      const ms = actual.filter((m) => m.fecha >= f && (!sig || m.fecha < sig));
      return { f, ing: suma(ms, 'entrada'), egr: suma(ms, 'salida') };
    });
    const serie = bloques.reduce<Array<{ f: Date; ing: number; egr: number; saldo: number; etq: string }>>((acc, b) => {
      const previo = acc.length > 0 ? acc[acc.length - 1].saldo : 0;
      return [...acc, { ...b, saldo: previo + b.ing - b.egr, etq: etiqueta(b.f, periodo) }];
    }, []);

    // Inventario
    const items = datos.flatMap((d) => d.inv.map((i) => ({ ...i, sede: d.sede.nombre })));
    const valorInv = datos.reduce((total, d) => {
      const costo = new Map<number, number>();
      d.ent.forEach((e) => { if (!costo.has(e.material_id)) costo.set(e.material_id, Number(e.unit_value)); });
      return total + d.inv.reduce((a, i) => a + i.current_stock * (costo.get(i.material_id) ?? 0), 0);
    }, 0);
    const criticos = items
      .filter((i) => i.estado !== 'ok')
      .sort((a, b) => (a.estado === b.estado ? a.current_stock - b.current_stock : a.estado === 'agotado' ? -1 : 1))
      .slice(0, 8);
    const ultimos = [...movs].sort((a, b) => b.fecha.getTime() - a.fecha.getTime() || b.id - a.id).slice(0, 8);
    const porSede = datos.map((d) => {
      const propios = actual.filter((m) => m.sede === d.sede.nombre);
      return { nombre: d.sede.nombre, ing: suma(propios, 'entrada'), egr: suma(propios, 'salida'), movs: propios.length };
    });
    const truncado = datos.some((d) => d.ent.length >= 100 || d.sal.length >= 100);

    return { ing, egr, saldo: ing - egr, margen, dIng: variacion(ing, ingP), dEgr: variacion(egr, egrP), dSaldo: variacion(ing - egr, ingP - egrP), dMargen: margenP === null ? null : margen - margenP, serie, disponibles: items.filter((i) => i.current_stock > 0).length, bajo: items.filter((i) => i.estado === 'bajo_minimo').length, agotados: items.filter((i) => i.estado === 'agotado').length, valorInv, criticos, ultimos, porSede, movsPeriodo: actual.length, truncado };
  }, [datos, periodo]);

  // --- Gráfica ---
  const W = 900, H = 320, PL = 60, PR = 20, PT = 20, PB = 34;
  const n = calc.serie.length;
  const valores = calc.serie.flatMap((s) => [s.ing, s.egr, s.saldo]);
  const yMax = Math.max(1, ...valores) * 1.1;
  const yMin = Math.min(0, ...valores) * 1.1;
  const x = (i: number) => (n <= 1 ? (PL + W - PR) / 2 : PL + (i * (W - PL - PR)) / (n - 1));
  const y = (v: number) => PT + ((yMax - v) / (yMax - yMin || 1)) * (H - PT - PB);
  const linea = (k: 'ing' | 'egr' | 'saldo') => calc.serie.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(s[k]).toFixed(1)}`).join(' ');
  const area = n > 1 ? `${linea('ing')} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z` : '';
  const ticks = [0, 1, 2, 3, 4].map((t) => yMin + ((yMax - yMin) * t) / 4);
  const paso = Math.ceil(n / 8);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || n === 0) return;
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(n - 1, Math.round(n <= 1 ? 0 : ((px - PL) / (W - PL - PR)) * (n - 1)))));
  };
  const pt = hover !== null ? calc.serie[hover] : null;

  const chip = (activo: boolean): React.CSSProperties => ({ padding: '8px 14px', borderRadius: '20px', border: `1px solid ${activo ? VERDE : BORDE}`, backgroundColor: activo ? VERDE : '#fff', color: activo ? '#fff' : '#374151', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' });
  const th: React.CSSProperties = { padding: '10px 8px', textAlign: 'left', fontSize: '0.75rem', color: GRIS, fontWeight: 700, borderBottom: `1px solid ${BORDE}` };
  const td: React.CSSProperties = { padding: '12px 8px', fontSize: '0.88rem', borderBottom: '1px solid #f3f4f6' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '8px 0 40px' }}>
      {/* Encabezado + filtros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, color: '#0f291e', letterSpacing: '-0.5px' }}>Dashboard General</h1>
          <p style={{ margin: '4px 0 0', color: GRIS }}>Resumen financiero y operativo de la empresa</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PERIODOS.map((p) => (<button key={p.k} onClick={() => setPeriodoK(p.k)} style={chip(p.k === periodoK)}>{p.l}</button>))}
          </div>
          <select value={sedeSel} onChange={(e) => setSedeSel(e.target.value)} style={{ padding: '9px 14px', borderRadius: '20px', border: `1px solid ${BORDE}`, fontWeight: 700, color: VERDE, backgroundColor: MANTEQUILLA, outline: 'none' }}>
            <option value="todas">Todas las sedes</option>
            {sedes.map((s) => (<option key={s.id} value={s.id}>{s.nombre}</option>))}
          </select>
        </div>
      </div>

      {error && <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '12px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem' }}>{error}</div>}
      {calc.truncado && <div style={{ color: '#8a6d0b', backgroundColor: '#fdf6d8', padding: '10px 16px', borderRadius: '12px', fontSize: '0.82rem' }}>Se muestran los últimos 100 registros de entradas y de salidas por sede; en períodos largos las cifras pueden estar incompletas.</div>}

      {/* Indicadores financieros */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px', opacity: cargando ? 0.6 : 1, transition: 'opacity .2s' }}>
        <Kpi titulo="Ingresos" valor={dinero(calc.ing)} icono={ICONOS.ingreso} pct={calc.dIng} variante="verde" />
        <Kpi titulo="Egresos" valor={dinero(calc.egr)} icono={ICONOS.egreso} pct={calc.dEgr} />
        <Kpi titulo="Ganancia / Saldo" valor={dinero(calc.saldo)} icono={ICONOS.saldo} pct={calc.dSaldo} variante="mantequilla" />
        <Kpi titulo="Margen" valor={`${calc.margen.toFixed(1)}%`} icono={ICONOS.margen} pct={calc.dMargen} puntos />
      </div>

      {/* Gráfica principal */}
      <div style={{ ...card, padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0f291e' }}>Comportamiento financiero</h2>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.8rem', color: GRIS }}>
              {[['Ingresos', VERDE], ['Egresos', MANTEQUILLA_FUERTE], ['Saldo acumulado', VERDE_SUAVE]].map(([l, c]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c }} />{l}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PERIODOS.map((p) => (<button key={p.k} onClick={() => setPeriodoK(p.k)} style={chip(p.k === periodoK)}>{p.l}</button>))}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
            <defs>
              <linearGradient id="areaIng" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={VERDE} stopOpacity="0.18" />
                <stop offset="100%" stopColor={VERDE} stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((t, i) => (
              <g key={i}>
                <line x1={PL} x2={W - PR} y1={y(t)} y2={y(t)} stroke="#eef1ee" />
                <text x={PL - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fill={GRIS}>{corto(t)}</text>
              </g>
            ))}
            {yMin < 0 && <line x1={PL} x2={W - PR} y1={y(0)} y2={y(0)} stroke="#cbd5d0" strokeDasharray="4 4" />}
            {area && <path d={area} fill="url(#areaIng)" />}
            {n > 1 && <path d={linea('egr')} fill="none" stroke={MANTEQUILLA_FUERTE} strokeWidth="2.5" strokeLinejoin="round" />}
            {n > 1 && <path d={linea('saldo')} fill="none" stroke={VERDE_SUAVE} strokeWidth="2.5" strokeDasharray="6 4" strokeLinejoin="round" />}
            {n > 1 && <path d={linea('ing')} fill="none" stroke={VERDE} strokeWidth="3" strokeLinejoin="round" />}
            {n === 1 && calc.serie.map((s) => [['ing', VERDE], ['egr', MANTEQUILLA_FUERTE], ['saldo', VERDE_SUAVE]].map(([k, c]) => (<circle key={k} cx={x(0)} cy={y(s[k as 'ing' | 'egr' | 'saldo'])} r="6" fill={c} />)))}
            {calc.serie.map((s, i) => (i % paso === 0 ? <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill={GRIS}>{s.etq}</text> : null))}
            {pt && hover !== null && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={PT} y2={H - PB} stroke={VERDE} strokeDasharray="4 4" opacity="0.4" />
                {[[pt.ing, VERDE], [pt.egr, MANTEQUILLA_FUERTE], [pt.saldo, VERDE_SUAVE]].map(([v, c], i) => (<circle key={i} cx={x(hover)} cy={y(v as number)} r="5" fill="#fff" stroke={c as string} strokeWidth="3" />))}
              </g>
            )}
          </svg>
          {pt && hover !== null && (
            <div style={{ position: 'absolute', top: '8px', left: `${Math.min(80, Math.max(2, (x(hover) / W) * 100 + 1))}%`, backgroundColor: '#fff', border: `1px solid ${BORDE}`, borderRadius: '14px', boxShadow: '0 8px 24px rgba(15,41,30,0.12)', padding: '12px 14px', fontSize: '0.8rem', pointerEvents: 'none', minWidth: '170px' }}>
              <div style={{ fontWeight: 800, color: '#0f291e', marginBottom: '6px' }}>{pt.etq}</div>
              <div style={{ color: VERDE }}>Ingresos: <strong>{dinero(pt.ing)}</strong></div>
              <div style={{ color: '#9a7b0a' }}>Egresos: <strong>{dinero(pt.egr)}</strong></div>
              <div style={{ color: VERDE_SUAVE }}>Saldo: <strong>{dinero(pt.saldo)}</strong></div>
            </div>
          )}
        </div>
      </div>

      {/* Estado del inventario + Resumen de sedes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        <div style={card}>
          <h3 style={{ margin: '0 0 18px', fontSize: '1.1rem', color: '#0f291e' }}>Estado del inventario</h3>
          <div style={{ backgroundColor: MANTEQUILLA, borderRadius: '16px', padding: '16px 18px', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.8rem', color: '#6b5b12', fontWeight: 700 }}>Valor total del inventario (estimado)</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: VERDE }}>{dinero(calc.valorInv)}</div>
            <div style={{ fontSize: '0.72rem', color: '#6b5b12' }}>Stock actual × último costo de entrada</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[['Disponibles', calc.disponibles, VERDE_SUAVE], ['Bajo mínimo', calc.bajo, '#b8860b'], ['Agotados', calc.agotados, '#b91c1c']].map(([l, v, c]) => (
              <div key={l as string} style={{ border: `1px solid ${BORDE}`, borderRadius: '14px', padding: '12px' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: c as string }}>{v}</div>
                <div style={{ fontSize: '0.75rem', color: GRIS }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f291e' }}>Resumen de sedes</h3>
            <span style={{ fontSize: '0.78rem', color: GRIS }}>{sedes.length} sedes · {calc.movsPeriodo} movimientos</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Sede</th><th style={th}>Ingresos</th><th style={th}>Egresos</th><th style={th}>Mov.</th></tr></thead>
            <tbody>
              {calc.porSede.map((s) => (
                <tr key={s.nombre}>
                  <td style={{ ...td, fontWeight: 700, color: '#0f291e' }}>{s.nombre}</td>
                  <td style={{ ...td, color: VERDE_SUAVE, fontWeight: 700 }}>{dinero(s.ing)}</td>
                  <td style={{ ...td, color: '#9a7b0a', fontWeight: 700 }}>{dinero(s.egr)}</td>
                  <td style={td}>{s.movs}</td>
                </tr>
              ))}
              {calc.porSede.length === 0 && <tr><td colSpan={4} style={{ ...td, color: '#9ca3af', textAlign: 'center' }}>Sin datos</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Materiales críticos + Últimos movimientos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
        <div style={{ ...card, overflowX: 'auto' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', color: '#0f291e' }}>Materiales críticos</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Código</th><th style={th}>Material</th><th style={th}>Stock</th><th style={th}>Mínimo</th><th style={th}>Sede</th></tr></thead>
            <tbody>
              {calc.criticos.map((m) => (
                <tr key={`${m.sede}-${m.id_inventory}`}>
                  <td style={{ ...td, fontWeight: 700, color: VERDE }}>{m.internal_code}</td>
                  <td style={td}>{m.material_name}</td>
                  <td style={{ ...td, fontWeight: 800, color: m.estado === 'agotado' ? '#b91c1c' : '#b8860b' }}>{m.current_stock} {m.unit}</td>
                  <td style={td}>{m.min_stock}</td>
                  <td style={{ ...td, color: GRIS }}>{m.sede}</td>
                </tr>
              ))}
              {calc.criticos.length === 0 && <tr><td colSpan={5} style={{ ...td, color: '#9ca3af', textAlign: 'center' }}>No hay materiales críticos.</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={card}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', color: '#0f291e' }}>Últimos movimientos</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {calc.ultimos.map((m) => (
              <div key={`${m.tipo}-${m.id}-${m.sede}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <span style={{ width: '34px', height: '34px', flexShrink: 0, borderRadius: '50%', backgroundColor: m.tipo === 'entrada' ? '#e4f3ec' : MANTEQUILLA, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icono d={m.tipo === 'entrada' ? ICONOS.ingreso : ICONOS.egreso} color={m.tipo === 'entrada' ? VERDE_SUAVE : '#9a7b0a'} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f291e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.material}</div>
                    <div style={{ fontSize: '0.74rem', color: GRIS }}>{m.tipo === 'entrada' ? 'Ingreso' : 'Despacho'} · {m.numero} · {m.sede} · {fmtFecha(m.fecha)}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: m.tipo === 'entrada' ? VERDE_SUAVE : '#9a7b0a' }}>{m.tipo === 'entrada' ? '+' : '-'}{dinero(m.valor)}</div>
                  <div style={{ fontSize: '0.72rem', color: GRIS }}>{m.cantidad} {m.unidad}</div>
                </div>
              </div>
            ))}
            {calc.ultimos.length === 0 && <p style={{ color: '#9ca3af', textAlign: 'center', margin: '16px 0' }}>Sin movimientos registrados.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};