import { describe, expect, it, vi } from 'vitest';
import { loginBackend } from './authService';

describe('loginBackend', () => {
  it('calls the auth endpoint and returns a token and user payload', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        token: 'abc123',
        user: { id_user: 1, nombre: 'Admin', email: 'admin@test.com', rol: 'Administrador' },
      }),
    } as Response);

    const result = await loginBackend('admin@test.com', 'secret');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/login'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
    expect(result.token).toBe('abc123');
    expect(result.user).toMatchObject({ email: 'admin@test.com' });

    mockFetch.mockRestore();
  });

  it('throws a readable error when the backend rejects the login', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify({ message: 'Credenciales inválidas' }),
    } as Response);

    await expect(loginBackend('bad@test.com', 'bad')).rejects.toThrow('Credenciales inválidas');
  });
});
