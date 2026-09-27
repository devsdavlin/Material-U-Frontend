export const extractApiErrorMessage = (
  payload: unknown,
  fallback = 'Ocurrió un error inesperado'
): string => {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const record = payload as Record<string, unknown>;

  const candidates = [
    record.message,
    record.error,
    record.detail,
    record.errorMessage,
    record.errors,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }

    if (Array.isArray(candidate) && candidate.length > 0 && typeof candidate[0] === 'string') {
      return candidate[0];
    }
  }

  return fallback;
};
