import { authService } from '@/Services/authService';

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 5,
        nombre: 'Usuario de Prueba',
        email: 'test@prueba',
        password: 'secret123',
        rol: 'usuario_regular',
        avatar: null,
        creadoEn: '2026-09-24T00:00:00.000Z',
      }),
    });
});

describe('authService.register', () => {
  it('registra correos de prueba y los envía a usuarios', async () => {
    const session = await authService.register({
      nombre: ' Usuario de Prueba ',
      email: ' TEST@PRUEBA ',
      password: 'secret123',
    });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:4000/usuarios?email=test%40prueba',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:4000/usuarios',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"email":"test@prueba"'),
      }),
    );
    expect(session.email).toBe('test@prueba');
    expect(JSON.parse(localStorage.getItem('caco.session')).email).toBe('test@prueba');
  });
});
