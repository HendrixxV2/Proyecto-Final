import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '@/Context/LanguageContext';
import { useAuth } from '@/Hooks/useAuth';
import { useFetch } from '@/Hooks/useFetch';
import { useToast } from '@/Hooks/useToast';
import Reservas from '@/Pages/Public/Reservas';
import { reservasService } from '@/Services/reservasService';

jest.mock('@/Hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/Hooks/useFetch', () => ({ useFetch: jest.fn() }));
jest.mock('@/Hooks/useToast', () => ({ useToast: jest.fn() }));
jest.mock('@/Services/espaciosService', () => ({ espaciosService: { list: jest.fn() } }));
jest.mock('@/Services/reservasService', () => ({ reservasService: { create: jest.fn() } }));

const mockToast = {
  warning: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
};

function renderReservas() {
  const wrapper = ({ children }) => (
    <MemoryRouter initialEntries={['/reservas?espacio=4']}>
      <LanguageProvider>{children}</LanguageProvider>
    </MemoryRouter>
  );
  return render(<Reservas />, { wrapper });
}

async function completeBookingForm() {
  const user = userEvent.setup();
  const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  await user.selectOptions(screen.getByLabelText(/Espacio/), '4');
  fireEvent.change(screen.getByLabelText(/Fecha/), { target: { value: date } });
  fireEvent.change(screen.getByLabelText(/Hora de inicio/), { target: { value: '10:00' } });
  fireEvent.change(screen.getByLabelText(/Hora de fin/), { target: { value: '11:00' } });
  await user.type(screen.getByLabelText(/Motivo de la reserva/), 'Ensayo del grupo juvenil');
  return user;
}

describe('Reservas page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 23 }, isAuthenticated: true });
    useFetch.mockReturnValue({
      data: [{ id: 4, nombre: 'Sala multiuso', capacidad: 40 }],
      loading: false,
    });
    useToast.mockReturnValue(mockToast);
  });

  it('validates the form and explains why submission is blocked', async () => {
    renderReservas();
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    expect(mockToast.warning).toHaveBeenCalledWith('Revisa el formulario', 'Hay campos que necesitan corrección.');
    expect(reservasService.create).not.toHaveBeenCalled();
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });

  it('submits a valid reservation for the signed-in user', async () => {
    reservasService.create.mockResolvedValue({ id: 9 });
    renderReservas();
    await completeBookingForm();
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    await waitFor(() => expect(reservasService.create).toHaveBeenCalledWith(expect.objectContaining({
      espacioId: 4,
      usuarioId: 23,
      horaInicio: '10:00',
      horaFin: '11:00',
      motivo: 'Ensayo del grupo juvenil',
    })));
    expect(mockToast.success).toHaveBeenCalledWith('Solicitud enviada', expect.any(String));
    expect(screen.getByRole('status')).toHaveTextContent('¡Solicitud registrada!');
  });

  it('shows the conflict returned by the reservation service', async () => {
    reservasService.create.mockRejectedValue(new Error('El espacio ya está reservado en ese horario.'));
    renderReservas();
    await completeBookingForm();
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith(
      'No se pudo enviar la solicitud',
      'El espacio ya está reservado en ese horario.',
    ));
    expect(screen.getByRole('alert')).toHaveTextContent('El espacio ya está reservado en ese horario.');
  });
});