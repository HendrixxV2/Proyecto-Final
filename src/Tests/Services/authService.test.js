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

describe('authService.login', () => {
  it('normalizes email and persists a session for valid credentials', async () => {
    const usuario = {
      id: 8,
      nombre: 'Ana',
      email: 'ana@orotina.cr',
      password: 'secreto',
      rol: 'usuario_regular',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [usuario],
    });

    const session = await authService.login({ email: ' ANA@OROTINA.CR ', password: 'secreto' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/usuarios?email=ana%40orotina.cr',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(session).toMatchObject({ id: 8, email: 'ana@orotina.cr', rol: 'usuario_regular' });
    expect(session.token).toMatch(/^caco\./);
    expect(JSON.parse(localStorage.getItem('caco.session'))).toMatchObject({ id: 8 });
  });

  it('rejects unknown users and incorrect passwords with unauthorized status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await expect(authService.login({ email: 'nadie@test.cr', password: 'x' }))
      .rejects.toMatchObject({ status: 401, message: 'Correo o contraseña incorrectos.' });
  });

  it('rejects a wrong password even when the email exists', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ email: 'ana@test.cr', password: 'correcta' }],
    });

    await expect(authService.login({ email: 'ana@test.cr', password: 'incorrecta' }))
      .rejects.toMatchObject({ status: 401 });
  });
});

describe('authService session helpers', () => {
  it('rejects duplicate registration without creating another user', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ id: 4, email: 'ana@test.cr' }],
    });

    await expect(authService.register({ nombre: 'Ana', email: ' ANA@test.cr ', password: 'secreto' }))
      .rejects.toMatchObject({ status: 409, message: 'Ya existe una cuenta con este correo.' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('returns null for corrupted sessions and removes persisted sessions on logout', () => {
    localStorage.setItem('caco.session', '{invalido');
    expect(authService.getSession()).toBeNull();

    localStorage.setItem('caco.session', JSON.stringify({ id: 2, rol: 'usuario_regular' }));
    expect(authService.getSession()).toMatchObject({ id: 2 });
    authService.logout();
    expect(authService.getSession()).toBeNull();
  });

  it('checks optional role restrictions safely', () => {
    const adminSession = { rol: 'admin' };

    expect(authService.hasRole(null, ['admin'])).toBe(false);
    expect(authService.hasRole(adminSession)).toBe(true);
    expect(authService.hasRole(adminSession, ['admin', 'editor'])).toBe(true);
    expect(authService.hasRole(adminSession, ['usuario_regular'])).toBe(false);
  });
});
