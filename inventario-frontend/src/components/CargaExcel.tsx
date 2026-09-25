import React, { useState } from 'react';
import { materialService } from '../services/materialService';
import { useInventario } from '../context/InventarioContext';

export const CargaExcel: React.FC = () => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const { cargarDatosBackend } = useInventario();

  const handleSubir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo) return;

    try {
      setCargando(true);
      const resultado = await materialService.subirExcel(archivo);
      alert(`¡Carga exitosa! Se importaron ${resultado.insertados} materiales. 🎉`);
      await cargarDatosBackend(); // Refresca la tabla automáticamente
    } catch (err) {
      alert('Error conectando con el backend para subir el Excel. 🚫');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubir} style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px', display: 'flex', gap: '10px' }}>
      <input 
        type="file" 
        accept=".xlsx, .xls, .csv" 
        onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)} 
        required 
      />
      <button 
        type="submit" 
        disabled={cargando}
        style={{ backgroundColor: '#123b2b', color: '#fff', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
      >
        {cargando ? 'Subiendo...' : 'Cargar Inventario desde Excel 🚀'}
      </button>
    </form>
  );
};