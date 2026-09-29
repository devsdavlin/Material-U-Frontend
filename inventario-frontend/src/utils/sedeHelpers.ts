import type { Usuario } from '../types/Usuario';
import { obtenerSedeSeleccionada } from '../services/sedeService';

export const esAdmin = (usuario?: Usuario | null): boolean =>
  usuario?.rol === 'Administrador' || usuario?.rol === 'ADMINISTRADOR';

// "s3" | "3" | 3 -> 3
export const toWarehouseId = (valor: unknown): number | undefined => {
  const m = String(valor ?? '').trim().toLowerCase().match(/^s?(\d+)$/);
  return m ? Number(m[1]) : undefined;
};

// El Almacenista NO manda nada: el backend usa la sede de su token.
// El Administrador manda ?warehouse_id= con la sede que eligió.
export const resolverWarehouseId = (
  usuario?: Usuario | null,
  sedeIdParam?: string | null
): number | undefined => {
  if (!esAdmin(usuario)) return undefined;
  return toWarehouseId(sedeIdParam ?? obtenerSedeSeleccionada()?.id);
};