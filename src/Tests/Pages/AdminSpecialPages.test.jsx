import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useFetch } from '@/Hooks/useFetch';
import { useAuth } from '@/Hooks/useAuth';
import DashboardAdmin from '@/Pages/Admin/DashboardAdmin';
import DisponibilidadAdmin from '@/Pages/Admin/DisponibilidadAdmin';
import ReportesAdmin from '@/Pages/Admin/ReportesAdmin';
import Topbar from '@/Components/Common/Topbar';

jest.mock('@/Hooks/useFetch', () => ({ useFetch: jest.fn() }));
jest.mock('@/Hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/Components/UI/ThemeToggle', () => ({ __esModule: true, default: () => <button type="button">Theme</button> }));
jest.mock('@/Components/UI/FontSizeControl', () => ({ __esModule: true, default: () => <button type="button">Text</button> }));

const originalResizeObserver = global.ResizeObserver;

beforeAll(() => {
  global.ResizeObserver = class ResizeObserverMock {
    constructor(callback) {
      this.callback = callback;
    }

    observe(target) {
      this.callback([{ target, contentRect: { width: 800, height: 600 } }]);
    }

    unobserve() {}
    disconnect() {}
  };
});

afterAll(() => {
  if (originalResizeObserver) global.ResizeObserver = originalResizeObserver;
  else delete global.ResizeObserver;
});

const distribution = [
  { estado: 'pendiente', total: 2 },
  { estado: 'aprobada', total: 3 },
  { estado: 'rechazada', total: 1 },
  { estado: 'cancelada', total: 0 },
];
const reportData = {
  kpis: { reservasTotales: 6, reservasPendientes: 2, ingresos: 12500, usuariosActivos: 18 },
  porEstado: distribution,
  porEspacio: [{ nombre: 'Sala Central', reservas: 4 }, { nombre: 'Galería', reservas: 2 }],
};

describe('admin dashboard and reports', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows KPIs and the computed approval percentage', () => {
    useFetch.mockReturnValue({ data: reportData, loading: false, error: null, refetch: jest.fn() });
    render(<DashboardAdmin />);

    expect(screen.getByRole('heading', { name: 'Panel de control' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '50% de reservas aprobadas' })).toBeInTheDocument();
    expect(screen.getByText(/12\s?500/)).toBeInTheDocument();
    expect(screen.getByLabelText('Datos de distribución por estado')).toHaveTextContent('3 reservas');
  });

  it('handles an empty dashboard and exposes its error retry action', async () => {
    const retry = jest.fn();
    useFetch.mockReturnValue({ data: null, loading: false, error: null, refetch: retry });
    const { rerender } = render(<DashboardAdmin />);
    expect(screen.getByRole('img', { name: '0% de reservas aprobadas' })).toBeInTheDocument();

    useFetch.mockReturnValue({ data: null, loading: false, error: new Error('Fallo'), refetch: retry });
    rerender(<DashboardAdmin />);
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('exports space usage data as a dated CSV file', async () => {
    const createObjectURL = URL.createObjectURL;
    const revokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:reporte');
    URL.revokeObjectURL = jest.fn();
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const createElement = document.createElement.bind(document);
    let downloadLink;
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      const element = createElement(tagName, options);
      if (tagName.toLowerCase() === 'a') downloadLink = element;
      return element;
    });
    useFetch.mockReturnValue({ data: reportData, loading: false, error: null, refetch: jest.fn() });

    try {
      render(<ReportesAdmin />);
      await userEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));

      const [blob] = URL.createObjectURL.mock.calls[0];
      expect(blob).toBeInstanceOf(Blob);
      const contents = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(blob);
      });
      expect(contents).toBe('Espacio,Reservas\nSala Central,4\nGalería,2');
      expect(click).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:reporte');
      expect(downloadLink).toHaveAttribute(
        'download',
        `reporte-espacios-${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } finally {
      URL.createObjectURL = createObjectURL;
      URL.revokeObjectURL = revokeObjectURL;
      click.mockRestore();
      createElementSpy.mockRestore();
    }
  });
});

describe('Topbar notifications', () => {
  it('opens the notification list and navigates to the reservations section when clicked', async () => {
    useAuth.mockReturnValue({
      user: { nombre: 'Admin Demo', rol: 'admin' },
      logout: jest.fn(),
    });
    useFetch.mockReturnValue({
      data: { kpis: { reservasPendientes: 2 } },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/admin/dashboard" element={<Topbar onOpenMobile={jest.fn()} />} />
          <Route path="/admin/reservas" element={<div>Reservas del panel</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /notificaciones: 3 nuevas/i }));
    await user.click(screen.getByRole('button', { name: /2 nuevas reservas pendientes/i }));

    await waitFor(() => expect(screen.getByText('Reservas del panel')).toBeInTheDocument());
  });
});

describe('DisponibilidadAdmin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('marks active reservations as occupied but ignores canceled reservations', async () => {
    const spacesResult = {
      data: [{ id: 4, nombre: 'Sala Central' }],
      loading: false,
    };
    const emptyReservations = { data: [], loading: false };
    const currentReservations = {
      data: [
        { id: 1, horaInicio: '09:00', horaFin: '10:00', estado: 'aprobada', motivo: 'Ensayo' },
        { id: 2, horaInicio: '10:00', horaFin: '11:00', estado: 'rechazada', motivo: 'Rechazada' },
        { id: 3, horaInicio: '11:00', horaFin: '12:00', estado: 'cancelada', motivo: 'Cancelada' },
      ],
      loading: false,
    };
    useFetch
      .mockReturnValueOnce(spacesResult)
      .mockReturnValueOnce(emptyReservations)
      .mockReturnValueOnce(spacesResult)
      .mockReturnValueOnce(currentReservations);
    const user = userEvent.setup();
    render(<DisponibilidadAdmin />);

    await user.selectOptions(screen.getByLabelText('Espacio'), '4');

    await waitFor(() => expect(screen.getByText('09:00')).toBeInTheDocument());
    expect(within(screen.getByText('09:00').closest('li')).getByText('Ocupado')).toBeInTheDocument();
    expect(within(screen.getByText('10:00').closest('li')).getByText('Libre')).toBeInTheDocument();
    expect(within(screen.getByText('11:00').closest('li')).getByText('Libre')).toBeInTheDocument();
    expect(screen.getByText('9:00 a. m. – 10:00 a. m. · Ensayo')).toBeInTheDocument();
  });
});