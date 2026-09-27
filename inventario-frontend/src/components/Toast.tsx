import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
}

const palette: Record<ToastType, { bg: string; color: string; border: string }> = {
  success: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  error: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  info: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
};

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onClose?.();
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [onClose, message]);

  const styles = palette[type];

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 9999,
        maxWidth: 360,
        backgroundColor: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
};
