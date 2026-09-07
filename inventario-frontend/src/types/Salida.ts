export interface Salida {
  id: string;
  fecha: string;
  codigoMig: string;
  materialId: string;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  sedeId: string;
  registradoPor: string;
  destino?: string;
}