import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/Hooks/useAuth';
import { useFetch } from '@/Hooks/useFetch';
import { useToast } from '@/Hooks/useToast';
import Calendario from '@/Pages/Public/Calendario';
import MisReservas from '@/Pages/Public/MisReservas';
import { CATEGORIAS_EVENTO } from '@/Utils/constants';
import { reservasService } from '@/Services/reservasService';

jest.mock('@/Hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/Hooks/useFetch', () => ({ useFetch: jest.fn() }));
jest.mock('@/Hooks/useToast', () => ({ useToast: jest.fn() }));
jest.mock('@/Services/eventosService', () => ({ eventosService: { listPublicados: jest.fn() } }));
jest.mock('@/Services/reservasService', () => ({
  reservasService: {
    listByUsuario: jest.fn(),
    cancelar: jest.fn(),
  },
}));
jest.mock('@/Services/espaciosService', () => ({ espaciosService: { list: jest.fn() } }));

const mockToast = { success: jest.fn(), error: jest.fn() };
const today = format(new Date(), 'yyyy-MM-dd');
const category = CATEGORIAS_EVENTO[0];

describe('Calendario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFetch.mockReturnValue({
      data: [
        {
          id: 1,
          titulo: 'Actividad de hoy',
          categoria: category,
          fecha: today,
          horaInicio: '18:00',
          horaFin: '19:00',
          precio: 0,
          descripcion: 'Actividad cultural del día.',
        },
        {
          id: 2,
          titulo: 'Otra categoría',
          categoria: CATEGORIAS_EVENTO.find((item) => item !== category),
          fecha: today,
          horaInicio: '20:00',
          horaFin: '21:00',
          precio: 2500,
          descripcion: 'Otra actividad cultural.',
        },
      ],
      loading: false,
    });
  });

  it('filters the selected day events by category and restores all categories', async () => {
    const user = userEvent.setup();
    render(<Calendario />);

    expect(screen.getByText('Actividad de hoy')).toBeInTheDocument();
    expect(screen.getByText('Otra categoría')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: category, exact: true }));

    expect(screen.getByText('Actividad de hoy')).toBeInTheDocument();
    expect(screen.queryByText('Otra categoría')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Todas' }));
    expect(screen.getByText('Otra categoría')).toBeInTheDocument();
  });

  it('navigates between months and selects a day without activities', async () => {
    const user = userEvent.setup();
    render(<Calendario />);
    const currentMonthDate = new Date();
    const currentMonth = format(currentMonthDate, 'MMMM yyyy', { locale: es });
    const nextMonth = format(addMonths(currentMonthDate, 1), 'MMMM yyyy', { locale: es });
    const monthSection = screen.getByRole('region', { name: `Calendario de ${currentMonth}` });

    await user.click(within(monthSection).getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getByRole('region', { name: `Calendario de ${nextMonth}` })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /15 de/ }));
    expect(screen.getByText('Sin actividades')).toBeInTheDocument();
  });
});

describe('MisReservas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 31 } });
    useToast.mockReturnValue(mockToast);
  });

  it('shows reservation details and only allows canceling active requests', async () => {
    const refresh = jest.fn();
    useFetch
      .mockReturnValueOnce({
        data: [
          { id: 1, espacioId: 4, fecha: today, horaInicio: '10:00', horaFin: '11:00', motivo: 'Ensayo', estado: 'pendiente' },
          { id: 2, espacioId: 4, fecha: today, horaInicio: '12:00', horaFin: '13:00', motivo: 'Evento pasado', estado: 'rechazada' },
        ],
        loading: false,
        error: null,
        refetch: refresh,
      })
      .mockReturnValueOnce({ data: [{ id: 4, nombre: 'Sala Central' }], loading: false });
    reservasService.cancelar.mockResolvedValue({ id: 1 });
    const user = userEvent.setup();
    render(<MisReservas />);

    expect(screen.getAllByText('Sala Central')).toHaveLength(2);
    expect(screen.getByText('Ensayo')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Cancelar' })).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(reservasService.cancelar).toHaveBeenCalledWith(1));
    expect(mockToast.success).toHaveBeenCalledWith('Reserva cancelada', 'Tu reserva fue cancelada correctamente.');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('reports cancellation failures and renders the empty state', async () => {
    useFetch
      .mockReturnValueOnce({
        data: [{
          id: 1,
          espacioId: 4,
          fecha: today,
          horaInicio: '10:00',
          horaFin: '11:00',
          motivo: 'Reunión',
          estado: 'aprobada',
        }],
        loading: false,
        error: null,
        refetch: jest.fn(),
      })
      .mockReturnValueOnce({ data: [{ id: 4, nombre: 'Sala Central' }], loading: false });
    reservasService.cancelar.mockRejectedValue(new Error('No se pudo cancelar.'));
    const user = userEvent.setup();
    const { rerender } = render(<MisReservas />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith('No se pudo cancelar', 'No se pudo cancelar.'));

    useFetch
      .mockReturnValueOnce({ data: [], loading: false, error: null, refetch: jest.fn() })
      .mockReturnValueOnce({ data: [], loading: false });
    rerender(<MisReservas />);
    expect(screen.getByText('Aún no tienes reservas')).toBeInTheDocument();
  });
});