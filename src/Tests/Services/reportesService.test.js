import { boletosService } from '@/Services/boletosService';
import { espaciosService } from '@/Services/espaciosService';
import { reportesService } from '@/Services/reportesService';
import { reservasService } from '@/Services/reservasService';
import { usuariosService } from '@/Services/usuariosService';

jest.mock('@/Services/reservasService', () => ({ reservasService: { list: jest.fn() } }));
jest.mock('@/Services/boletosService', () => ({ boletosService: { list: jest.fn() } }));
jest.mock('@/Services/espaciosService', () => ({ espaciosService: { list: jest.fn() } }));
jest.mock('@/Services/usuariosService', () => ({ usuariosService: { list: jest.fn() } }));

describe('reportesService.dashboard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('aggregates KPIs, paid income, reservations by space and status', async () => {
    reservasService.list.mockResolvedValue([
      { espacioId: 1, estado: 'pendiente' },
      { espacioId: 1, estado: 'aprobada' },
      { espacioId: 2, estado: 'rechazada' },
      { espacioId: 2, estado: 'cancelada' },
    ]);
    boletosService.list.mockResolvedValue([
      { estado: 'pagado', precio: 1200 },
      { estado: 'pagado', precio: '800' },
      { estado: 'reservado', precio: 900 },
      { estado: 'pagado', precio: null },
    ]);
    espaciosService.list.mockResolvedValue([
      { id: 1, nombre: 'Sala pequeña' },
      { id: 2, nombre: 'Nombre de espacio cultural extenso para recortar' },
    ]);
    usuariosService.list.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    await expect(reportesService.dashboard()).resolves.toEqual({
      kpis: {
        reservasTotales: 4,
        reservasPendientes: 1,
        ingresos: 2000,
        usuariosActivos: 2,
      },
      porEspacio: [
        { nombre: 'Sala pequeña', reservas: 2 },
        { nombre: 'Nombre de espacio cult…', reservas: 2 },
      ],
      porEstado: [
        { estado: 'pendiente', total: 1 },
        { estado: 'aprobada', total: 1 },
        { estado: 'rechazada', total: 1 },
        { estado: 'cancelada', total: 1 },
      ],
    });
    expect(reservasService.list).toHaveBeenCalledTimes(1);
    expect(boletosService.list).toHaveBeenCalledTimes(1);
    expect(espaciosService.list).toHaveBeenCalledTimes(1);
    expect(usuariosService.list).toHaveBeenCalledTimes(1);
  });
});