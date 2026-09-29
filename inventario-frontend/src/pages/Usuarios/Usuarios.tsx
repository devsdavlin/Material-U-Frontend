import React, { useEffect, useState } from 'react';
import { obtenerSedesActivas, type Sede } from '../../services/sedeService';
import { actualizarUsuario, crearUsuario, eliminarUsuario, obtenerUsuariosActivos } from '../../services/usuarioService';
import type { Usuario } from '../../types/Usuario';

const campo: React.CSSProperties = { padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d5db' };
const btn: React.CSSProperties = { border: 'none', borderRadius: '10px', padding: '8px 14px', fontWeight: 700, cursor: 'pointer' };

const esAdminRol = (rol: string) => rol === 'Administrador' || rol === 'ADMINISTRADOR';

export const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', warehouse_id: '' });

  // Edición
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [edit, setEdit] = useState({ username: '', email: '', password: '', warehouse_id: '' });

  const cargar = async () => {
    try {
      const [u, s] = await Promise.all([obtenerUsuariosActivos(), obtenerSedesActivas()]);
      setUsuarios(u);
      setSedes(s);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const almacenistas = usuarios.filter((u) => !esAdminRol(u.rol));
  const nombreSede = (id?: number | null) => sedes.find((s) => s.id === String(id))?.nombre ?? 'Sin sede';

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.warehouse_id) {
      alert('Selecciona la sede del almacenista');
      return;
    }
    setEnviando(true);
    try {
      await crearUsuario({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        rol: 'Almacenista',
        warehouse_id: form.warehouse_id,
      });
      setForm({ username: '', email: '', password: '', warehouse_id: '' });
      await cargar();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo crear el usuario');
    } finally {
      setEnviando(false);
    }
  };

  const abrirEdicion = (u: Usuario) => {
    setEditando(u);
    setEdit({ username: u.name ?? u.nombre ?? '', email: u.email, password: '', warehouse_id: u.warehouse_id ? String(u.warehouse_id) : '' });
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    setEnviando(true);
    try {
      await actualizarUsuario(editando.id_user, {
        username: edit.username.trim(),
        email: edit.email.trim(),
        warehouse_id: edit.warehouse_id ? Number(edit.warehouse_id) : null,
        ...(edit.password ? { password: edit.password } : {}),
      });
      setEditando(null);
      await cargar();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo actualizar el usuario');
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (u: Usuario) => {
    if (!window.confirm(`¿Eliminar a ${u.name || u.email}? Ya no podrá entrar a la plataforma.`)) return;
    try {
      await eliminarUsuario(u.id_user);
      await cargar();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo eliminar el usuario');
    }
  };

  const selectSedes = (value: string, onChange: (v: string) => void) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={campo} required>
      <option value="">Sede</option>
      {sedes.map((s) => (
        <option key={s.id} value={s.id}>{s.nombre}</option>
      ))}
    </select>
  );

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#f6f7f5' }}>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '2.6rem', fontWeight: 800, color: '#0f291e' }}>Gestión de Usuarios</h1>

      <div style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '20px', marginBottom: '24px', border: '1px solid #e7ece8' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#0f291e' }}>Crear almacenista</h3>
        <form onSubmit={handleCrear} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Nombre de usuario" style={campo} required />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Correo" style={campo} required />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Contraseña (mín. 8)" style={campo} required minLength={8} />
          {selectSedes(form.warehouse_id, (v) => setForm({ ...form, warehouse_id: v }))}
          <button type="submit" disabled={enviando} style={{ ...btn, backgroundColor: '#123b2b', color: '#fff', padding: '12px 18px' }}>
            {enviando ? 'Guardando...' : 'Crear usuario'}
          </button>
        </form>
        {sedes.length === 0 && !cargando && (
          <p style={{ color: '#b45309', margin: '12px 0 0 0', fontSize: '0.9rem' }}>Primero crea una sede en la sección Sedes.</p>
        )}
      </div>

      {cargando ? (
        <p style={{ color: '#6b7280' }}>Cargando usuarios...</p>
      ) : almacenistas.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '24px', color: '#6b7280' }}>No hay usuarios en este momento.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {almacenistas.map((u) => (
            <div key={u.id_user} style={{ backgroundColor: '#fff', borderRadius: '22px', padding: '22px 18px', border: '1px solid #e7ece8' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.45rem', color: '#0f291e' }}>{u.name || u.nombre || 'Usuario'}</h3>
              <p style={{ margin: 0, color: '#6b7280' }}>{u.email}</p>
              <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Sede: <strong>{u.sedeNombre ?? nombreSede(u.warehouse_id)}</strong></p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button onClick={() => abrirEdicion(u)} style={{ ...btn, backgroundColor: '#edf6f2', color: '#123b2b' }}>Editar</button>
                <button onClick={() => void handleEliminar(u)} style={{ ...btn, backgroundColor: '#fee2e2', color: '#b91c1c' }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editando && (
        <div onClick={() => setEditando(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={guardarEdicion} style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '24px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, color: '#0f291e' }}>Editar usuario</h3>
            <input value={edit.username} onChange={(e) => setEdit({ ...edit, username: e.target.value })} placeholder="Nombre de usuario" style={campo} required />
            <input type="email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} placeholder="Correo" style={campo} required />
            <input type="password" value={edit.password} onChange={(e) => setEdit({ ...edit, password: e.target.value })} placeholder="Nueva contraseña (vacío = no cambiar)" style={campo} minLength={8} />
            {selectSedes(edit.warehouse_id, (v) => setEdit({ ...edit, warehouse_id: v }))}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditando(null)} style={{ ...btn, backgroundColor: '#f3f4f6', color: '#374151' }}>Cancelar</button>
              <button type="submit" disabled={enviando} style={{ ...btn, backgroundColor: '#123b2b', color: '#fff' }}>{enviando ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};