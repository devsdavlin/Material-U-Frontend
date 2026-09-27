/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { materialService, type Material } from '../services/materialService';
import type { ItemInventario } from '../types/Inventario';

interface EntradaContexto {
  id: string;
  materialId: string;
  descripcion: string;
  codigoMig?: string;
  proveedor?: string;
  cantidad: number;
  valorUnitario?: number;
  valorTotal?: number;
}

interface SalidaContexto {
  id: string;
  materialId: string;
  descripcion: string;
  codigoVale?: string;
  centroCosto?: string;
  cantidad: number;
  unidadMedida?: string;
  registradoPor?: string;
}

interface InventarioContextType {
  materiales: Material[];
  inventario: ItemInventario[];
  entradas: EntradaContexto[];
  salidas: SalidaContexto[];
  cargando: boolean;
  cargarDatosBackend: () => Promise<void>;
  agregarMaterial: (material: Omit<Material, 'id'> & { id?: string }) => void;
  eliminarMaterial: (id: string) => void;
  agregarEntrada: (entrada: Omit<EntradaContexto, 'id'> & { id?: string }) => void;
  agregarSalida: (salida: Omit<SalidaContexto, 'id'> & { id?: string }) => void;
}

const InventarioContext = createContext<InventarioContextType>({} as InventarioContextType);

export const InventarioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [inventario] = useState<ItemInventario[]>([]);
  const [entradas, setEntradas] = useState<EntradaContexto[]>([]);
  const [salidas, setSalidas] = useState<SalidaContexto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  const cargarDatosBackend = async () => {
    try {
      setCargando(true);
      const data = await materialService.obtenerTodos();
      setMateriales(data);
    } catch (error) {
      console.error('Error conectando con el backend:', error);
    } finally {
      setCargando(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    void cargarDatosBackend();
  }, []);

  const agregarMaterial = (material: Omit<Material, 'id'> & { id?: string }) => {
    setMateriales((prev) => [{
      id: material.id ?? `material-${Date.now()}`,
      codigo: material.codigo,
      descripcion: material.descripcion,
      unidadMedida: material.unidadMedida,
      categoria: material.categoria,
      stockMinimo: material.stockMinimo,
    }, ...prev]);
  };

  const eliminarMaterial = (id: string) => {
    setMateriales((prev) => prev.filter((material) => material.id !== id));
  };

  const agregarEntrada = (entrada: Omit<EntradaContexto, 'id'> & { id?: string }) => {
    setEntradas((prev) => [{
      id: entrada.id ?? `entrada-${Date.now()}`,
      materialId: entrada.materialId,
      descripcion: entrada.descripcion,
      codigoMig: entrada.codigoMig,
      proveedor: entrada.proveedor,
      cantidad: entrada.cantidad,
      valorUnitario: entrada.valorUnitario,
      valorTotal: entrada.valorTotal,
    }, ...prev]);
  };

  const agregarSalida = (salida: Omit<SalidaContexto, 'id'> & { id?: string }) => {
    setSalidas((prev) => [{
      id: salida.id ?? `salida-${Date.now()}`,
      materialId: salida.materialId,
      descripcion: salida.descripcion,
      codigoVale: salida.codigoVale,
      centroCosto: salida.centroCosto,
      cantidad: salida.cantidad,
      unidadMedida: salida.unidadMedida,
      registradoPor: salida.registradoPor,
    }, ...prev]);
  };

  return (
    <InventarioContext.Provider
      value={{
        materiales,
        inventario,
        entradas,
        salidas,
        cargando,
        cargarDatosBackend,
        agregarMaterial,
        eliminarMaterial,
        agregarEntrada,
        agregarSalida,
      }}
    >
      {children}
    </InventarioContext.Provider>
  );
};

export const useInventario = () => useContext(InventarioContext);