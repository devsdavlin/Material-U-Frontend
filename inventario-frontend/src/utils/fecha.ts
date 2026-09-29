// Fecha de hoy en hora LOCAL (YYYY-MM-DD). No usar toISOString(): en Colombia
// después de las 7 p. m. devolvería el día siguiente (UTC).
export const hoyLocal = (): string => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
};

// "2026-09-28T00:00:00.000Z" -> "28/09/2026"
export const fechaCorta = (iso?: string | null): string => {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : '—';
};