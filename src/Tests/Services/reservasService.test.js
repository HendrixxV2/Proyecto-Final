import { api } from '@/Services/api';
import { reservasService } from '@/Services/reservasService';

jest.mock('@/Services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('reservasService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('builds reservation list queries and delegates scoped lookups', async () => {
    api.get.mockResolvedValue([]);

    await reservasService.list({ usuarioId: 2, estado: 'pendiente' });
    await reservasService.list();
    await reservasService.listByUsuario(2);
    await reservasService.listByEspacioYFecha(4, '2026-10-01');

    expect(api.get).toHaveBeenNthCalledWith(1, '/reservas?usuarioId=2&estado=pendiente');
    expect(api.get).toHaveBeenNthCalledWith(2, '/reservas');
    expect(api.get).toHaveBeenNthCalledWith(3, '/reservas?usuarioId=2&_sort=fecha&_order=desc');
    expect(api.get).toHaveBeenNthCalledWith(4, '/reservas?espacioId=4&fecha=2026-10-01');
  });

  it('creates a pending reservation when its time range is free', async () => {
    api.get.mockResolvedValue([
      { horaInicio: '10:00', horaFin: '11:00', estado: 'aprobada' },
    ]);
    api.post.mockResolvedValue({ id: 9 });
    const data = {
      espacioId: 4,
      fecha: '2026-10-01',
      horaInicio: '11:00',
      horaFin: '12:00',
      usuarioId: 2,
    };

    await reservasService.create(data);

    expect(api.get).toHaveBeenCalledWith('/reservas?espacioId=4&fecha=2026-10-01');
    expect(api.post).toHaveBeenCalledWith('/reservas', expect.objectContaining({
      ...data,
      estado: 'pendiente',
      creadoEn: expect.any(String),
    }));
  });

  it.each(['pendiente', 'aprobada'])('rejects overlapping %s reservations', async (estado) => {
    api.get.mockResolvedValue([
      { horaInicio: '10:00', horaFin: '12:00', estado },
    ]);

    await expect(reservasService.create({
      espacioId: 4,
      fecha: '2026-10-01',
      horaInicio: '11:00',
      horaFin: '13:00',
    })).rejects.toMatchObject({
      status: 409,
      message: 'El espacio ya está reservado en ese horario.',
    });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('ignores rejected and canceled reservations when checking conflicts', async () => {
    api.get.mockResolvedValue([
      { horaInicio: '10:00', horaFin: '12:00', estado: 'rechazada' },
      { horaInicio: '10:00', horaFin: '12:00', estado: 'cancelada' },
    ]);
    api.post.mockResolvedValue({ id: 9 });

    await reservasService.create({
      espacioId: 4,
      fecha: '2026-10-01',
      horaInicio: '11:00',
      horaFin: '13:00',
    });

    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('delegates updates, state changes, and deletion', async () => {
    api.patch.mockResolvedValue({ id: 9 });
    api.delete.mockResolvedValue(null);

    await reservasService.update(9, { nota: 'Cambio' });
    await reservasService.aprobar(9);
    await reservasService.rechazar(9);
    await reservasService.cancelar(9);
    await reservasService.remove(9);

    expect(api.patch).toHaveBeenNthCalledWith(1, '/reservas/9', { nota: 'Cambio' });
    expect(api.patch).toHaveBeenNthCalledWith(2, '/reservas/9', { estado: 'aprobada' });
    expect(api.patch).toHaveBeenNthCalledWith(3, '/reservas/9', { estado: 'rechazada' });
    expect(api.patch).toHaveBeenNthCalledWith(4, '/reservas/9', { estado: 'cancelada' });
    expect(api.delete).toHaveBeenCalledWith('/reservas/9');
  });
});