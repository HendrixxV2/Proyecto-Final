import { api } from '@/Services/api';
import { boletosService } from '@/Services/boletosService';

jest.mock('@/Services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('boletosService.reservar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reserves the selected available seat and persists its label', async () => {
    api.get.mockResolvedValue([{ id: 12, eventoId: 5, asiento: 'B2', estado: 'disponible' }]);
    api.patch.mockResolvedValue({ id: 12, estado: 'reservado', usuarioId: 2, asiento: 'B2' });

    const result = await boletosService.reservar(5, 2, 3500, [{ id: 12, asiento: 'B2' }]);

    expect(api.patch).toHaveBeenCalledWith('/boletos/12', {
      estado: 'reservado',
      usuarioId: 2,
      asiento: 'B2',
    });
    expect(result[0].asiento).toBe('B2');
  });

  it('rejects a seat that became unavailable before checkout', async () => {
    api.get.mockResolvedValue([]);

    await expect(boletosService.reservar(5, 2, 3500, [{ id: 12, asiento: 'B2' }]))
      .rejects.toMatchObject({ status: 409 });
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('rejects invalid quantities without querying available tickets', async () => {
    await expect(boletosService.reservar(5, 2, 3500, 0)).rejects.toThrow(
      'La cantidad de boletos debe ser al menos 1.',
    );
    await expect(boletosService.reservar(5, 2, 3500, 1.5)).rejects.toThrow(
      'La cantidad de boletos debe ser al menos 1.',
    );
    expect(api.get).not.toHaveBeenCalled();
  });

  it('rejects duplicate seats and does not reserve any ticket', async () => {
    api.get.mockResolvedValue([{ id: 12 }, { id: 13 }]);

    await expect(boletosService.reservar(5, 2, 3500, [
      { id: 12, asiento: 'B2' },
      { id: 12, asiento: 'B2' },
    ])).rejects.toThrow('No puedes seleccionar la misma butaca más de una vez.');
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('rejects quantities larger than availability with a conflict', async () => {
    api.get.mockResolvedValue([{ id: 12 }]);

    await expect(boletosService.reservar(5, 2, 3500, 2))
      .rejects.toMatchObject({ status: 409, message: 'Solo quedan 1 boletos disponibles.' });
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('reserves the requested quantity and omits seat labels for general admission', async () => {
    api.get.mockResolvedValue([{ id: 12 }, { id: 13 }]);
    api.patch.mockImplementation((path, data) => Promise.resolve({ id: path.split('/').pop(), ...data }));

    const result = await boletosService.reservar(5, 2, 3500, 2);

    expect(api.patch).toHaveBeenNthCalledWith(1, '/boletos/12', {
      estado: 'reservado',
      usuarioId: 2,
    });
    expect(api.patch).toHaveBeenNthCalledWith(2, '/boletos/13', {
      estado: 'reservado',
      usuarioId: 2,
    });
    expect(result).toHaveLength(2);
  });

  it('reports when no tickets are available', async () => {
    api.get.mockResolvedValue([]);

    await expect(boletosService.reservar(5, 2, 3500, 1))
      .rejects.toMatchObject({ status: 409, message: 'No hay boletos disponibles para este evento.' });
  });
});

describe('boletosService API methods', () => {
  beforeEach(() => jest.clearAllMocks());

  it('builds list queries and delegates user and available-ticket lookups', async () => {
    api.get.mockResolvedValue([]);

    await boletosService.list({ eventoId: 5, estado: 'disponible' });
    await boletosService.list();
    await boletosService.listByUsuario(2);
    await boletosService.listDisponibles();
    await boletosService.listDisponiblesPorEvento(5);

    expect(api.get).toHaveBeenNthCalledWith(1, '/boletos?eventoId=5&estado=disponible');
    expect(api.get).toHaveBeenNthCalledWith(2, '/boletos');
    expect(api.get).toHaveBeenNthCalledWith(3, '/boletos?usuarioId=2');
    expect(api.get).toHaveBeenNthCalledWith(4, '/boletos?estado=disponible');
    expect(api.get).toHaveBeenNthCalledWith(5, '/boletos?eventoId=5&estado=disponible');
  });

  it('emits available tickets and delegates update and removal', async () => {
    api.post.mockResolvedValue({ id: 1 });
    api.patch.mockResolvedValue({ id: 1 });
    api.delete.mockResolvedValue(null);

    await boletosService.emitir(5, 3500);
    await boletosService.update(1, { precio: 4000 });
    await boletosService.remove(1);

    expect(api.post).toHaveBeenCalledWith('/boletos', expect.objectContaining({
      eventoId: 5,
      precio: 3500,
      estado: 'disponible',
      usuarioId: null,
      codigo: expect.stringMatching(/^ORO-005-[A-Z0-9]{5}$/),
    }));
    expect(api.patch).toHaveBeenCalledWith('/boletos/1', { precio: 4000 });
    expect(api.delete).toHaveBeenCalledWith('/boletos/1');
  });
});