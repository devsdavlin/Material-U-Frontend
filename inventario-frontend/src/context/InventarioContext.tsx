import { createContext, useContext, useState, type FC, type ReactNode } from 'react';
import type { ItemInventario } from '../types/Inventario';
import { MOCK_INVENTARIO } from '../mocks/inventario';

export interface Material {
  id: string;
  codigo: string;
  descripcion: string;
  unidadMedida: string;
  categoria: string;
  stockMinimo: number;
}

export interface EntradaRegistro {
  id: string;
  codigoMig: string;
  fecha: string;
  materialId: string;
  descripcion: string;
  proveedor: string;
  cantidad: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface SalidaRegistro {
  id: string;
  codigoVale: string;
  fecha: string;
  materialId: string;
  descripcion: string;
  centroCosto: string;
  cantidad: number;
  unidadMedida: string;
  registradoPor: string;
}

interface InventarioContextType {
  inventario: ItemInventario[];
  materiales: Material[];
  entradas: EntradaRegistro[];
  salidas: SalidaRegistro[];
  agregarMaterial: (material: Omit<Material, 'id'>) => void;
  eliminarMaterial: (id: string) => void;
  agregarEntrada: (entrada: Omit<EntradaRegistro, 'id' | 'codigoMig' | 'fecha'>) => void;
  agregarSalida: (salida: Omit<SalidaRegistro, 'id' | 'codigoVale' | 'fecha'>) => void;
}

const InventarioContext = createContext<InventarioContextType>({} as InventarioContextType);

export const InventarioProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [inventario, setInventario] = useState<ItemInventario[]>(MOCK_INVENTARIO);

  const [materiales, setMateriales] = useState<Material[]>([
    { id: 'm1', codigo: 'MIG 001', descripcion: 'PARRILLA ASADOR A GAS PLUS + BANDEJA LATERAL', unidadMedida: 'UN', categoria: 'Equipos', stockMinimo: 5 },
    { id: 'm2', codigo: 'MIG 002', descripcion: 'LAVARROPAS ECO 48X60 CM FIRPLAK', unidadMedida: 'UN', categoria: 'Grifería', stockMinimo: 2 },
    { id: 'm3', codigo: 'MIG 003', descripcion: 'CATALIZADOR EPOXICO X 1/4 TITO PABON', unidadMedida: 'GL', categoria: 'Pinturas', stockMinimo: 10 },
  ]);

  const [entradas, setEntradas] = useState<EntradaRegistro[]>([]);
  const [salidas, setSalidas] = useState<SalidaRegistro[]>([]);

  const agregarMaterial = (nuevoMat: Omit<Material, 'id'>) => {
    const idGenerado = `m-${Date.now()}`;
    const materialCompleto: Material = { ...nuevoMat, id: idGenerado };

    setMateriales((prev) => [...prev, materialCompleto]);

    const nuevoItemInv: ItemInventario = {
      id: `inv-${Date.now()}`,
      materialId: idGenerado,
      codigo: nuevoMat.codigo,
      descripcion: nuevoMat.descripcion,
      unidadMedida: nuevoMat.unidadMedida,
      sedeId: '1',
      sedeNombre: 'Almacén La Vega',
      stockActual: 0,
      entradasTotales: 0,
      salidasTotales: 0,
      valorTotal: 0,
      estado: 'AGOTADO',
    };

    setInventario((prev) => [...prev, nuevoItemInv]);
  };

  const eliminarMaterial = (id: string) => {
    setMateriales((prev) => prev.filter((m) => m.id !== id));
    setInventario((prev) => prev.filter((inv) => inv.materialId !== id));
  };

  const agregarEntrada = (datos: Omit<EntradaRegistro, 'id' | 'codigoMig' | 'fecha'>) => {
    const nuevaEntrada: EntradaRegistro = {
      ...datos,
      id: `e-${Date.now()}`,
      codigoMig: `ING-00${entradas.length + 1}`,
      fecha: new Date().toISOString().split('T')[0],
    };

    setEntradas((prev) => [nuevaEntrada, ...prev]);

    setInventario((prev) =>
      prev.map((item) => {
        if (item.materialId === datos.materialId) {
          const nuevoStock = item.stockActual + datos.cantidad;
          const nuevasEntradas = item.entradasTotales + datos.cantidad;
          const nuevoValorTotal = item.valorTotal + datos.valorTotal;

          return {
            ...item,
            stockActual: nuevoStock,
            entradasTotales: nuevasEntradas,
            valorTotal: nuevoValorTotal,
            estado: nuevoStock > 0 ? 'CON_STOCK' : 'AGOTADO',
          };
        }
        return item;
      })
    );
  };

  const agregarSalida = (datos: Omit<SalidaRegistro, 'id' | 'codigoVale' | 'fecha'>) => {
    const nuevaSalida: SalidaRegistro = {
      ...datos,
      id: `s-${Date.now()}`,
      codigoVale: `VALE-00${salidas.length + 1}`,
      fecha: new Date().toISOString().split('T')[0],
    };

    setSalidas((prev) => [nuevaSalida, ...prev]);

    setInventario((prev) =>
      prev.map((item) => {
        if (item.materialId === datos.materialId) {
          const nuevoStock = item.stockActual - datos.cantidad;
          const nuevasSalidas = item.salidasTotales + datos.cantidad;

          let estadoActual: 'CON_STOCK' | 'AGOTADO' | 'NEGATIVO' = 'CON_STOCK';
          if (nuevoStock === 0) estadoActual = 'AGOTADO';
          if (nuevoStock < 0) estadoActual = 'NEGATIVO';

          return {
            ...item,
            stockActual: nuevoStock,
            salidasTotales: nuevasSalidas,
            estado: estadoActual,
          };
        }
        return item;
      })
    );
  };

  return (
    <InventarioContext.Provider value={{ inventario, materiales, entradas, salidas, agregarMaterial, eliminarMaterial, agregarEntrada, agregarSalida }}>
      {children}
    </InventarioContext.Provider>
  );
};

export const useInventario = () => useContext(InventarioContext);