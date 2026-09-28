import { api } from '@/Services/api';
import { boletosService } from '@/Services/boletosService';

jest.mock('@/Services/api', () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
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
});