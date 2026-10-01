import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '@/Context/LanguageContext';
import { useAuth } from '@/Hooks/useAuth';
import { useFetch } from '@/Hooks/useFetch';
import { useToast } from '@/Hooks/useToast';
import Boletos from '@/Pages/Public/Boletos';
import { boletosService } from '@/Services/boletosService';

jest.mock('@/Hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/Hooks/useFetch', () => ({ useFetch: jest.fn() }));
jest.mock('@/Hooks/useToast', () => ({ useToast: jest.fn() }));
jest.mock('@/Services/eventosService', () => ({ eventosService: { listPublicados: jest.fn() } }));
jest.mock('@/Services/boletosService', () => ({
  boletosService: {
    list: jest.fn(),
    listByUsuario: jest.fn(),
    reservar: jest.fn(),
  },
}));

const mockToast = {
  info: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
};
const mockRefreshOwn = jest.fn().mockResolvedValue([]);
const mockRefreshAll = jest.fn().mockResolvedValue([]);
let mockFetchIndex = 0;

function renderBoletos() {
  return render(
    <LanguageProvider><Boletos /></LanguageProvider>,
  );
}

describe('Boletos page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchIndex = 0;
    useAuth.mockReturnValue({ user: { id: 23 }, isAuthenticated: true });
    useToast.mockReturnValue(mockToast);
    useFetch.mockImplementation(() => {
      const results = [
        {
          data: [{
            id: 7,
            titulo: 'Taller de teatro',
            descripcion: 'Introducción al teatro comunitario',
            categoria: 'Teatro',
            precio: 1000,
            fecha: '2026-12-01',
            horaInicio: '19:00',
          }],
          loading: false,
        },
        {
          data: [
            { id: 1, eventoId: 7, estado: 'disponible' },
            { id: 2, eventoId: 7, asiento: 'A2', estado: 'reservado' },
            { id: 3, eventoId: 7, estado: 'disponible' },
          ],
          loading: false,
          refetch: mockRefreshAll,
        },
        { data: [], loading: false, refetch: mockRefreshOwn },
      ];
      return results[mockFetchIndex++ % results.length];
    });
  });

  it('filters activities by search text', async () => {
    renderBoletos();
    expect(screen.getByText('Taller de teatro')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar actividades'), { target: { value: 'danza' } });

    expect(screen.getByText('No encontramos actividades')).toBeInTheDocument();
    expect(screen.queryByText('Taller de teatro')).not.toBeInTheDocument();
  });

  it('selects an available seat and reserves it for the signed-in user', async () => {
    boletosService.reservar.mockResolvedValue([{ id: 1 }]);
    renderBoletos();
    await userEvent.click(screen.getByRole('button', { name: 'Elegir entradas' }));

    const availableSeat = screen.getByRole('button', { name: 'Butaca A1, disponible' });
    expect(screen.getByRole('button', { name: 'Butaca A2, ocupada' })).toBeDisabled();
    await userEvent.click(availableSeat);
    expect(availableSeat).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Reservar entradas' }));

    await waitFor(() => expect(boletosService.reservar).toHaveBeenCalledWith(
      7,
      23,
      1000,
      [{ id: 1, asiento: 'A1' }],
    ));
    expect(mockToast.success).toHaveBeenCalledWith('Boleto reservado', expect.stringContaining('1 entrada'));
    expect(mockRefreshOwn).toHaveBeenCalledTimes(1);
    expect(mockRefreshAll).toHaveBeenCalledTimes(1);
  });

  it('requires authentication before reserving a selected seat', async () => {
    useAuth.mockReturnValue({ user: null, isAuthenticated: false });
    renderBoletos();
    await userEvent.click(screen.getByRole('button', { name: 'Elegir entradas' }));
    await userEvent.click(screen.getByRole('button', { name: 'Butaca A1, disponible' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reservar entradas' }));

    expect(mockToast.info).toHaveBeenCalledWith('Inicia sesión', 'Debes ingresar para reservar boletos.');
    expect(boletosService.reservar).not.toHaveBeenCalled();
  });
});