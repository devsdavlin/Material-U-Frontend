import React, { useEffect, useState } from 'react';
import { getOfflineMode, getOfflineWarningMessage, setOfflineMode } from '../../utils/offlineMode';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(() => getOfflineMode());

  useEffect(() => {
    const updateStatus = () => {
      const nextValue = !navigator.onLine || getOfflineMode();
      setIsOffline(nextValue);
      setOfflineMode(nextValue);
    };

    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: '#7f1d1d',
        color: '#fff',
        border: '1px solid #fca5a5',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        fontWeight: 800,
        fontSize: '1.05rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        boxShadow: '0 8px 20px rgba(127, 29, 29, 0.18)',
      }}
    >
      {getOfflineWarningMessage()}
    </div>
  );
};
