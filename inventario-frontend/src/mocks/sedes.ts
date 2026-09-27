import type { Sede } from '../types/Sede';

const STORAGE_KEY_SEDE_SELECCIONADA = 'inventario_sede_seleccionada';

const SEDE_BASE: Sede[] = [
  {
    id: 's1',
    nombre: 'Sede Central',
    ubicacion: 'Avenida Principal 123, Santiago',
  },
  {
    id: 's2',
    nombre: 'Sede Norte',
    ubicacion: 'Calle Los Pinos 45, Concepción',
  },
  {
    id: 's3',
    nombre: 'La Vega',
    ubicacion: 'Camino a La Vega 87, Rancagua',
  },
  {
    id: 's4',
    nombre: 'Sede Prueba',
    ubicacion: 'Av. Prueba 10, Santiago',
  },
];

let sedeStore: Sede[] = [...SEDE_BASE];

export const MOCK_SEDES: Sede[] = [...sedeStore];

export const normalizarSedeId = (valor: string | number | null | undefined): string => {
  const raw = String(valor ?? '').trim().toLowerCase();

  if (!raw) return 's1';
  if (['1', 's1', 'central', 'sede central', 'centro'].includes(raw)) return 's1';
  if (['2', 's2', 'norte', 'sede norte'].includes(raw)) return 's2';
  if (['3', 's3', 'la vega', 'vega', 'sede la vega'].includes(raw)) return 's3';
  if (['4', 's4', 'prueba', 'sede prueba'].includes(raw)) return 's4';

  return raw;
};

export const obtenerSedesActivas = (): Sede[] => [...sedeStore];

export const obtenerSedeSeleccionada = (): Sede | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEDE_SELECCIONADA);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Sede>;
    if (!parsed?.id || !parsed?.nombre) return null;

    return {
      id: String(parsed.id),
      nombre: String(parsed.nombre),
      ubicacion: String(parsed.ubicacion ?? ''),
    };
  } catch {
    return null;
  }
};

export const guardarSedeSeleccionada = (sede: Pick<Sede, 'id' | 'nombre' | 'ubicacion'>): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(
    STORAGE_KEY_SEDE_SELECCIONADA,
    JSON.stringify({
      id: String(sede.id),
      nombre: String(sede.nombre),
      ubicacion: String(sede.ubicacion ?? ''),
    })
  );
};

export const limpiarSedeSeleccionada = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_SEDE_SELECCIONADA);
};

export const crearSede = (nombre: string, ubicacion: string): Sede => {
  const nuevaSede: Sede = {
    id: `s${Date.now()}`,
    nombre: nombre.trim(),
    ubicacion: ubicacion.trim(),
  };

  sedeStore = [...sedeStore, nuevaSede];
  return nuevaSede;
};

export const eliminarSede = (id: string): boolean => {
  const sedeExiste = sedeStore.some((sede) => sede.id === id);

  if (!sedeExiste) {
    return false;
  }

  sedeStore = sedeStore.filter((sede) => sede.id !== id);

  const seleccionActual = obtenerSedeSeleccionada();
  if (seleccionActual?.id === id) {
    limpiarSedeSeleccionada();
  }

  return true;
};

export const resetSedes = (): void => {
  sedeStore = [...SEDE_BASE];
  limpiarSedeSeleccionada();
};
