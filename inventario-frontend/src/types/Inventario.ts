export interface ItemInventario {
  id: string;
  materialId: string;
  codigo: string;
  descripcion: string;
  unidadMedida: string;
  sedeId: string;
  sedeNombre: string;
  stockActual: number;
  entradasTotales: number;
  salidasTotales: number;
  valorTotal: number;
  estado: 'CON_STOCK' | 'AGOTADO' | 'NEGATIVO';
}