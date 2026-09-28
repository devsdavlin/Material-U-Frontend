import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useInventario } from '../../context/InventarioContext';
import { guardarSedeSeleccionada, normalizarSedeId, obtenerSedeSeleccionada, obtenerSedesActivas, type Sede } from '../../services/sedeService';
import type { ItemInventario } from '../../types/Inventario';

const green = '#123b2b';
const greenSoft = '#10b981';
const warning = '#f59e0b';
const danger = '#ef4444';

const ArrowBadge = ({ color = '#123b2b' }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17L17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

const StatusDot = ({ color = greenSoft }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
    <circle cx="12" cy="12" r="7" fill={color} />
  </svg>
);

const WarningIcon = ({ color = warning }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l9 16H3L12 3z" />
    <path d="M12 9v4" />
    <circle cx="12" cy="16.5" r="1" fill={color} stroke="none" />
  </svg>
);

const AlertIcon = ({ color = danger }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 9v4" />
    <circle cx="12" cy="16.5" r="1" fill={color} stroke="none" />
    <path d="M12 3L21 19H3L12 3z" />
  </svg>
);

const BoxIcon = ({ color = green }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8.5L12 3l9 5.5-9 5.5L3 8.5z" />
    <path d="M3 8.5V15l9 5.5 9-5.5V8.5" />
    <path d="M12 14v7" />
  </svg>
);

const CoinIcon = ({ color = '#fbbf24' }: { color?: string }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7v10M9 9.5c0-1.1 1.3-2 3-2s3 .9 3 2-1.3 2-3 2-3 .9-3 2 1.3 2 3 2 3-.9 3-2" />
  </svg>
);

export const Dashboard: React.FC = () => {
 const { usuario } = useContext(AuthContext);
 const { inventario = [], entradas = [], salidas = [] } = useInventario();
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const [sedes, setSedes] = useState<Sede[]>([]);

 useEffect(() => {
   void obtenerSedesActivas().then(setSedes);
 }, []);

 // 1. Priorizamos la sede que viene en la URL (si el Admin hizo clic en una tarjeta)
 // 2. Si no hay URL, usamos la sede del almacenista logueado
 const sedeIdURL = searchParams.get('sedeId');
 const nombreSedeURL = searchParams.get('nombreSede');
 const sedePersistida = obtenerSedeSeleccionada();

 const sedeIdActiva = normalizarSedeId(
   sedeIdURL ?? sedePersistida?.id ?? usuario?.sedeId ?? usuario?.warehouse_id?.toString() ?? 's1'
 );
 const sedeNombre =
   nombreSedeURL ??
   sedePersistida?.nombre ??
   sedes.find((s) => s.id === sedeIdActiva)?.nombre ??
   'La Vega';

 React.useEffect(() => {
   const sedeActual = sedes.find((sede) => sede.id === sedeIdActiva);
   if (sedeActual) {
     guardarSedeSeleccionada(sedeActual);
   }
 }, [sedeIdActiva, sedes]);

 const inventarioSede = useMemo<ItemInventario[]>(() => {
   return inventario.filter((item: ItemInventario) => item.sedeId === sedeIdActiva);
 }, [inventario, sedeIdActiva]);

 const totalMateriales = inventarioSede.length;
 const conStock = inventarioSede.filter((i: ItemInventario) => i.estado === 'CON_STOCK').length;
 const agotados = inventarioSede.filter((i: ItemInventario) => i.estado === 'AGOTADO').length;
 const negativos = inventarioSede.filter((i: ItemInventario) => i.estado === 'NEGATIVO').length;
 const valorTotal = inventarioSede.reduce<number>((acc: number, i: ItemInventario) => acc + Number(i.valorTotal || 0), 0);
 const porcDisponible = totalMateriales > 0 ? Math.round((conStock / totalMateriales) * 100) : 100;

 const topMateriales = useMemo(() => {
   return [...inventarioSede].sort((a, b) => b.stockActual - a.stockActual).slice(0, 5);
 }, [inventarioSede]);

 return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#f8faf8', minHeight: '100vh', padding: '10px 0', animation: 'fadeIn 0.5s ease' }}>
    
     {/* 1. Header con Título y Botones Superiores[cite: 13] */}
     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
       <div>
         <h1 style={{ fontSize: '2.2rem', color: '#0f291e', margin: 0, fontWeight: '800', letterSpacing: '-0.5px' }}>
           Dashboard Local
         </h1>
         <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
           Gestiona, monitorea y controla los insumos de <strong>{sedeNombre}</strong>.
         </p>
       </div>
       <div style={{ display: 'flex', gap: '12px' }}>
         {usuario?.rol !== 'Administrador' && usuario?.rol !== 'ADMINISTRADOR' && (
           <>
             <button
               onClick={() => navigate('/entradas')}
               style={{
                 backgroundColor: '#123b2b', color: '#fff', border: 'none', padding: '12px 20px',
                 borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem',
                 display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(18, 59, 43, 0.15)'
               }}
             >
               <span>+</span> Nuevo Ingreso
             </button>
             <button
               onClick={() => navigate('/salidas')}
               style={{
                 backgroundColor: '#fff', color: '#123b2b', border: '1px solid #123b2b', padding: '12px 20px',
                 borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
               }}
             >
               Generar Salida
             </button>
           </>
         )}
       </div>
     </div>

     {/* 2. Fila Superior: 4 Tarjetas KPI estilo UI[cite: 13] */}
     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
       <div style={{ backgroundColor: '#123b2b', color: '#fff', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px', boxShadow: '0 10px 20px rgba(18, 59, 43, 0.2)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <span style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: '500' }}>Total Materiales</span>
           <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowBadge color="#fff" /></span>
         </div>
         <div style={{ fontSize: '2.8rem', fontWeight: '800', lineHeight: 1 }}>{totalMateriales}</div>
         <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', width: 'fit-content' }}>Activos en catálogo</div>
       </div>

       <div style={{ backgroundColor: '#fff', color: '#0f291e', padding: '24px', borderRadius: '24px', border: '1px solid #e8ece8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '500' }}>Con Stock</span>
           <span style={{ border: '1px solid #e5e7eb', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowBadge color={green} /></span>
         </div>
         <div style={{ fontSize: '2.8rem', fontWeight: '800', lineHeight: 1 }}>{conStock}</div>
         <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}><StatusDot color={greenSoft} /> Disponibles en bodega</div>
       </div>

       <div style={{ backgroundColor: '#fff', color: '#0f291e', padding: '24px', borderRadius: '24px', border: '1px solid #e8ece8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '500' }}>Agotados</span>
           <span style={{ border: '1px solid #e5e7eb', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowBadge color={green} /></span>
         </div>
         <div style={{ fontSize: '2.8rem', fontWeight: '800', lineHeight: 1 }}>{agotados}</div>
         <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}><WarningIcon color={warning} /> Requiere compra</div>
       </div>

       <div style={{ backgroundColor: '#fff', color: '#0f291e', padding: '24px', borderRadius: '24px', border: '1px solid #e8ece8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '500' }}>Saldo Negativo</span>
           <span style={{ border: '1px solid #e5e7eb', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowBadge color={green} /></span>
         </div>
         <div style={{ fontSize: '2.8rem', fontWeight: '800', lineHeight: 1 }}>{negativos}</div>
         <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertIcon color={danger} /> Inconsistencias de saldo</div>
       </div>
     </div>

     {/* 3. Grid Principal (2 Columnas)[cite: 13] */}
     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
      
       {/* COLUMNA IZQUIERDA */}
       <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 2 }}>
        
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
           {/* Widget: Rotación Semanal */}
           <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e8ece8' }}>
             <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f291e', fontWeight: '700' }}>Rotación Semanal</h3>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '110px', padding: '0 10px' }}>
               {[ { day: 'D', h: '30%', active: false }, { day: 'L', h: '70%', active: true }, { day: 'M', h: '50%', active: true }, { day: 'M', h: '90%', active: true, main: true }, { day: 'J', h: '40%', active: false }, { day: 'V', h: '60%', active: false }, { day: 'S', h: '25%', active: false } ].map((bar, index) => (
                 <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                   <div style={{ width: '28px', height: '80px', borderRadius: '15px', backgroundColor: '#f0f3f0', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                     <div style={{ width: '100%', height: bar.h, backgroundColor: bar.main ? '#123b2b' : bar.active ? '#34785c' : '#c2d1c7', borderRadius: '15px', transition: 'height 0.4s' }} />
                   </div>
                   <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>{bar.day}</span>
                 </div>
               ))}
             </div>
           </div>

           {/* Widget: Sede Operativa (Limpio y sin botón de cambiar sede) 🌸 */}
           <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e8ece8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
               <div>
                 <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600' }}>TU SEDE ACTUAL</span>
                 <h3 style={{ margin: '6px 0', fontSize: '1.4rem', color: '#123b2b', fontWeight: '800' }}>{sedeNombre}</h3>
                 <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
                   Encargado: <strong>{usuario?.nombre ?? usuario?.name ?? 'Operador'}</strong>[cite: 13]
                 </p>
               </div>
               <button
                 onClick={() => navigate(`/inventario?sedeId=${sedeIdActiva}&nombreSede=${encodeURIComponent(sedeNombre)}`)}
                 style={{
                   backgroundColor: '#123b2b', color: '#fff', border: 'none', padding: '12px',
                   borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '0.9rem',
                   marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                 }}
               >
                 <BoxIcon color="#fff" /> Ver Tabla de Inventario
               </button>
           </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
           {/* Trazabilidad Reciente[cite: 13] */}
           <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e8ece8' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
               <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f291e', fontWeight: '700' }}>Últimos Movimientos</h3>
               <span style={{ fontSize: '0.75rem', color: '#123b2b', fontWeight: 'bold' }}>Sincronizado</span>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {entradas.slice(0, 2).map((e) => (
                 <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                   <div>
                     <div style={{ fontWeight: 'bold', color: '#0f291e' }}>{e.descripcion}</div>
                     <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Ingreso • {e.proveedor}</div>
                   </div>
                   <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.75rem' }}>+{e.cantidad}</span>
                 </div>
               ))}
               {salidas.slice(0, 2).map((s) => (
                 <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                   <div>
                     <div style={{ fontWeight: 'bold', color: '#0f291e' }}>{s.descripcion}</div>
                     <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Despacho • {s.centroCosto}</div>
                   </div>
                   <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.75rem' }}>-{s.cantidad}</span>
                 </div>
               ))}
               {entradas.length === 0 && salidas.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', margin: '10px 0' }}>Sin registros recientes.</p>}
             </div>
           </div>

           {/* Medidor Circular[cite: 13] */}
           <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e8ece8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#0f291e', fontWeight: '700', alignSelf: 'flex-start' }}>Disponibilidad de Stock</h3>
             <div style={{ position: 'relative', width: '150px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
               <svg width="140" height="80" viewBox="0 0 100 50">
                 <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e8ece8" strokeWidth="12" strokeLinecap="round" />
                 <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#123b2b" strokeWidth="12" strokeLinecap="round" strokeDasharray="126" strokeDashoffset={126 - (126 * porcDisponible) / 100} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
               </svg>
               <div style={{ position: 'absolute', bottom: '0', textAlign: 'center' }}><div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#123b2b' }}>{porcDisponible}%</div></div>
             </div>
             <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '10px', fontWeight: '500' }}>Materiales listos para despacho</span>
           </div>
         </div>
       </div>

       {/* COLUMNA DERECHA */}
       <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
         {/* Top Materiales Lista[cite: 13] */}
         <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e8ece8', flex: 1 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
             <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f291e', fontWeight: '700' }}>Materiales Clave</h3>
             <button onClick={() => navigate('/materiales')} style={{ background: 'none', border: 'none', color: '#123b2b', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>+ Ver Todos</button>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
             {topMateriales.map((item) => (
               <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f0f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BoxIcon color={green} /></div>
                   <div>
                     <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#0f291e' }}>{item.codigo}</div>
                     <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.descripcion}</div>
                   </div>
                 </div>
                 <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#123b2b' }}>{item.stockActual} <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>{item.unidadMedida}</span></span>
               </div>
             ))}
             {topMateriales.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>Sin materiales registrados.</p>}
           </div>
         </div>

         {/* Tarjeta Oscura de Valor Total Inventario[cite: 13] */}
         <div style={{ backgroundColor: '#123b2b', color: '#fff', padding: '24px', borderRadius: '24px', background: 'linear-gradient(135deg, #123b2b 0%, #081f16 100%)', boxShadow: '0 10px 20px rgba(18, 59, 43, 0.25)', position: 'relative', overflow: 'hidden' }}>
           <span style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Valor Total en Bodega</span>
           <div style={{ fontSize: '2rem', fontWeight: '800', margin: '12px 0 16px 0', color: '#ffffff' }}>
             ${valorTotal.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', opacity: 0.8 }}>COP</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '12px', width: 'fit-content' }}>
             <CoinIcon color="#fbbf24" /> Valorado según costo acumulado
           </div>
         </div>
       </div>
     </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
   </div>
 );
};