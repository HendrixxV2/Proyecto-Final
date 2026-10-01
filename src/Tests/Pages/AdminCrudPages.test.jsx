import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoletosAdmin from '@/Pages/Admin/BoletosAdmin';
import ContenidoAdmin from '@/Pages/Admin/ContenidoAdmin';
import EspaciosAdmin from '@/Pages/Admin/EspaciosAdmin';
import EventosAdmin from '@/Pages/Admin/EventosAdmin';
import ReservasAdmin from '@/Pages/Admin/ReservasAdmin';
import UsuariosAdmin from '@/Pages/Admin/UsuariosAdmin';
import { useFetch } from '@/Hooks/useFetch';
import { useToast } from '@/Hooks/useToast';
import { boletosService } from '@/Services/boletosService';
import { reservasService } from '@/Services/reservasService';

jest.mock('@/Hooks/useFetch', () => ({ useFetch: jest.fn() }));
jest.mock('@/Hooks/useToast', () => ({ useToast: jest.fn() }));
jest.mock('@/Services/boletosService', () => ({ boletosService: { emitir: jest.fn() } }));
jest.mock('@/Services/reservasService', () => ({
  reservasService: { aprobar: jest.fn(), rechazar: jest.fn() },
}));

const mockToast = {
  warning: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
};
let mockFetchResults = [];
let mockFetchIndex = 0;

const contenido = { id: 1, seccion: 'galeria_ferrocarril', titulo: 'Memoria ferroviaria', orden: 1 };
const espacio = { id: 2, nombre: 'Sala Central', tipo: 'teatro', capacidad: 100, precioHora: 5000, activo: true };
const evento = {
  id: 10,
  titulo: 'Concierto local',
  categoria: 'Música',
  fecha: '2026-11-20',
  horaInicio: '19:00',
  precio: 5000,
  publicado: true,
};
const usuario = {
  id: 9,
  nombre: 'Ada Lovelace',
  email: 'ada@example.org',
  rol: 'admin',
  creadoEn: '2026-09-21T00:00:00.000Z',
};

function setFetchData(...data) {
  mockFetchResults = data.map((items) => ({ data: items, loading: false, error: null, refetch: jest.fn() }));
  mockFetchIndex = 0;
  useFetch.mockImplementation(() => mockFetchResults[mockFetchIndex++ % mockFetchResults.length]);
}

describe('admin CRUD pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useToast.mockReturnValue(mockToast);
    boletosService.emitir.mockReset();
    reservasService.aprobar.mockReset();
    reservasService.rechazar.mockReset();
  });

  it('renders historical content with its formatted section', () => {
    setFetchData([contenido]);
    render(<ContenidoAdmin />);

    expect(screen.getByRole('heading', { name: 'Contenido histórico-cultural' })).toBeInTheDocument();
    expect(screen.getByText('galeria ferrocarril')).toBeInTheDocument();
    expect(screen.getByText('Memoria ferroviaria')).toBeInTheDocument();
  });

  it('renders spaces with capacity, price, and availability', () => {
    setFetchData([espacio]);
    render(<EspaciosAdmin />);

    expect(screen.getByRole('heading', { name: 'Espacios' })).toBeInTheDocument();
    expect(screen.getByText('Sala Central')).toBeInTheDocument();
    expect(screen.getByText('₡5 000')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('renders event metadata and publication state', () => {
    setFetchData([evento]);
    render(<EventosAdmin />);

    expect(screen.getByRole('heading', { name: 'Eventos' })).toBeInTheDocument();
    expect(screen.getByText('Concierto local')).toBeInTheDocument();
    expect(screen.getByText('₡5 000')).toBeInTheDocument();
    expect(screen.getByText('Sí')).toBeInTheDocument();
  });

  it('renders user roles and offers the administrator creation action', () => {
    setFetchData([usuario]);
    render(<UsuariosAdmin />);

    expect(screen.getByRole('heading', { name: 'Usuarios' })).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nuevo administrador' })).toBeInTheDocument();
  });

  it('resolves ticket event and owner names from the supporting lookups', () => {
    setFetchData([evento], [usuario], [{
      id: 3,
      codigo: 'ORO-010-ABCDE',
      eventoId: evento.id,
      usuarioId: usuario.id,
      precio: 5000,
      estado: 'reservado',
    }]);
    render(<BoletosAdmin />);

    expect(screen.getByRole('heading', { name: 'Boletos' })).toBeInTheDocument();
    expect(screen.getByText('ORO-010-ABCDE')).toBeInTheDocument();
    expect(screen.getByText('Concierto local')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Emitir boletos' })).toBeInTheDocument();
  });

  it('requires an event before starting bulk ticket issuance', async () => {
    const user = userEvent.setup();
    setFetchData([evento], [usuario], [{
      id: 3,
      codigo: 'ORO-010-ABCDE',
      eventoId: evento.id,
      usuarioId: usuario.id,
      precio: 5000,
      estado: 'reservado',
    }]);
    render(<BoletosAdmin />);
    await user.click(screen.getByRole('button', { name: 'Emitir boletos' }));
    const dialog = screen.getByRole('dialog', { name: 'Emisión masiva de boletos' });
    await user.click(within(dialog).getByRole('button', { name: 'Emitir boletos' }));

    expect(mockToast.warning).toHaveBeenCalledWith(
      'Selecciona un evento',
      'Debes indicar el evento para el que se emiten boletos.',
    );
    expect(boletosService.emitir).not.toHaveBeenCalled();
  });

  it('reports bulk issuance failures and keeps the dialog available', async () => {
    const user = userEvent.setup();
    boletosService.emitir.mockRejectedValue(new Error('No hay conexión.'));
    setFetchData([evento], [usuario], [{
      id: 3,
      codigo: 'ORO-010-ABCDE',
      eventoId: evento.id,
      usuarioId: usuario.id,
      precio: 5000,
      estado: 'reservado',
    }]);
    render(<BoletosAdmin />);
    await user.click(screen.getByRole('button', { name: 'Emitir boletos' }));
    const dialog = screen.getByRole('dialog', { name: 'Emisión masiva de boletos' });
    await user.selectOptions(within(dialog).getByLabelText('Evento'), '10');
    await user.clear(within(dialog).getByLabelText('Cantidad'));
    await user.type(within(dialog).getByLabelText('Cantidad'), '2');
    await user.clear(within(dialog).getByLabelText('Precio unitario (₡)'));
    await user.type(within(dialog).getByLabelText('Precio unitario (₡)'), '1500');
    await user.click(within(dialog).getByRole('button', { name: 'Emitir boletos' }));

    await waitFor(() => expect(boletosService.emitir).toHaveBeenCalledTimes(2));
    expect(boletosService.emitir).toHaveBeenCalledWith(10, 1500);
    expect(mockToast.error).toHaveBeenCalledWith('No se pudieron emitir', 'No hay conexión.');
    expect(screen.getByRole('dialog', { name: 'Emisión masiva de boletos' })).toBeInTheDocument();
  });

  it('resolves reservation names and shows review actions only when pending', () => {
    setFetchData(
      [espacio],
      [usuario],
      [{
        id: 11,
        espacioId: espacio.id,
        usuarioId: usuario.id,
        fecha: '2026-11-20',
        horaInicio: '10:00',
        horaFin: '11:00',
        estado: 'pendiente',
        motivo: 'Taller comunitario',
      }],
    );
    render(<ReservasAdmin />);

    expect(screen.getByRole('heading', { name: 'Reservas' })).toBeInTheDocument();
    expect(screen.getByText('Sala Central')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aprobar reserva' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rechazar reserva' })).toBeInTheDocument();
  });

  it('reports a reservation approval failure', async () => {
    const user = userEvent.setup();
    reservasService.aprobar.mockRejectedValue(new Error('No se pudo aprobar.'));
    setFetchData(
      [espacio],
      [usuario],
      [{
        id: 11,
        espacioId: espacio.id,
        usuarioId: usuario.id,
        fecha: '2026-11-20',
        horaInicio: '10:00',
        horaFin: '11:00',
        estado: 'pendiente',
        motivo: 'Taller comunitario',
      }],
    );
    render(<ReservasAdmin />);
    await user.click(screen.getByRole('button', { name: 'Aprobar reserva' }));

    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith(
      'No se pudo actualizar',
      'No se pudo aprobar.',
    ));
  });
});