import axios from 'axios';

// Devuelve el mensaje real del backend ({ ok:false, message }) o uno claro de red.
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (!error.response) {
      return 'No hay conexión con el servidor. Render puede tardar ~1 minuto en despertar; intenta de nuevo.';
    }
  }
  return error instanceof Error && error.message ? error.message : fallback;
};