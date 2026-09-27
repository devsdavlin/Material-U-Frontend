const OFFLINE_MODE_KEY = 'inventario_offline_mode';

export const getOfflineMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(OFFLINE_MODE_KEY) === 'true';
};

export const setOfflineMode = (value: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OFFLINE_MODE_KEY, String(value));
};

export const getOfflineWarningMessage = (): string =>
  'SIN CONEXIÓN - DATOS LOCALES';

export const getLocalSaveWarning = (): string =>
  'No se guardó en el servidor. El registro quedó solo en la vista local y debe revisarse en Neon.';
