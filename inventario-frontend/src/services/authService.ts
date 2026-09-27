import { API_BASE_URL } from './api';
import { API_ROUTES, buildApiUrl } from '../utils/apiRoutes';
import { extractApiErrorMessage } from '../utils/errorHandling';

export type LoginBackendResponse = {
  token?: string;
  user?: Record<string, unknown> | null;
  message?: string;
  [key: string]: unknown;
};

export const loginBackend = async (
  email: string,
  password: string
): Promise<LoginBackendResponse> => {
  const loginUrl = buildApiUrl(API_ROUTES.auth.login);

  const res = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const raw = await res.text();
  let data: LoginBackendResponse;

  try {
    data = raw ? (JSON.parse(raw) as LoginBackendResponse) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(extractApiErrorMessage(data, 'Error al iniciar sesión'));
  }

  return data;
};