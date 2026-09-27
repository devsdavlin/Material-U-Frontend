import { describe, expect, it } from 'vitest';
import { getLocalSaveWarning, getOfflineWarningMessage } from './offlineMode';

describe('offline mode messaging', () => {
  it('shows a clear offline banner for local data mode', () => {
    expect(getOfflineWarningMessage()).toContain('SIN CONEXIÓN');
    expect(getOfflineWarningMessage()).toContain('DATOS LOCALES');
  });

  it('never suggests a successful backend save when local mode is active', () => {
    const message = getLocalSaveWarning();

    expect(message).toContain('No se guardó en el servidor');
    expect(message).not.toContain('guardado exitoso');
    expect(message).not.toContain('éxito');
  });
});
