import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useFetch } from '@/Hooks/useFetch';
import Espacios from '@/Pages/Public/Espacios';
import EspacioDetalle from '@/Pages/Public/EspacioDetalle';
import Noticias from '@/Pages/Public/Noticias';
import NoticiaDetalle from '@/Pages/Public/NoticiaDetalle';

jest.mock('@/Hooks/useFetch', () => ({ useFetch: jest.fn() }));
jest.mock('@/Services/espaciosService', () => ({ espaciosService: { getById: jest.fn(), list: jest.fn() } }));
jest.mock('@/Services/reservasService', () => ({ reservasService: { listByEspacioYFecha: jest.fn() } }));
jest.mock('@/Services/noticiasService', () => ({ noticiasService: { getById: jest.fn(), list: jest.fn() } }));
jest.mock('@/Components/AI/NewsSummary', () => () => <div>Resumen inteligente</div>);
jest.mock('@/Components/Weather/WeatherWidget', () => () => <div>Clima del espacio</div>);

const espacio = {
  id: 4,
  nombre: 'Sala Central',
  tipo: 'aire_libre',
  descripcion: 'Espacio para encuentros culturales.',
  capacidad: 80,
  ubicacion: 'Ala norte',
  precioHora: 5000,
  accesible: true,
  activo: true,
};
const noticia = {
  id: 12,
  titulo: 'Memoria cultural de Orotina',
  categoria: 'Historia',
  autor: 'Equipo editorial',
  fecha: '2026-09-20',
  resumen: 'Una historia compartida.',
  contenido: 'Primer párrafo.\nSegundo párrafo.',
  imagen: '/noticia.jpg',
};

function renderAt(path, element) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/espacios" element={<Espacios />} />
        <Route path="/espacios/:id" element={<EspacioDetalle />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/noticias/:id" element={<NoticiaDetalle />} />
        <Route path="/fallback" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Espacios public pages', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists spaces and links to each detail page', () => {
    useFetch.mockReturnValue({ data: [espacio], loading: false });
    renderAt('/espacios');

    expect(screen.getByRole('heading', { name: 'Salas, talleres y galerías' })).toBeInTheDocument();
    expect(screen.getByText('Sala Central')).toBeInTheDocument();
    expect(screen.getByText('Capacidad: 80')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver detalle' })).toHaveAttribute('href', '/espacios/4');
    expect(screen.getByRole('link', { name: 'Reservar' })).toHaveAttribute('href', '/reservas?espacio=4');
  });

  it('shows the empty list state when no spaces are available', () => {
    useFetch.mockReturnValue({ data: [], loading: false });
    renderAt('/espacios');

    expect(screen.getByText('No hay espacios disponibles')).toBeInTheDocument();
  });

  it('shows the full detail, today reservations, weather, and reservation link', () => {
    useFetch
      .mockReturnValueOnce({ data: espacio, loading: false, error: null, refetch: jest.fn() })
      .mockReturnValueOnce({ data: [{ id: 1, horaInicio: '10:00', horaFin: '11:00', motivo: 'Ensayo', estado: 'aprobada' }] });
    renderAt('/espacios/4');

    expect(screen.getByRole('heading', { name: 'Sala Central' })).toBeInTheDocument();
    expect(screen.getByText('Accesible para personas con discapacidad')).toBeInTheDocument();
    expect(screen.getByText('10:00 a. m. – 11:00 a. m. · Ensayo')).toBeInTheDocument();
    expect(screen.getByText('Clima del espacio')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Solicitar reserva' })).toHaveAttribute('href', '/reservas?espacio=4');
  });

  it('renders a retryable error state when the detail fails to load', () => {
    useFetch.mockReturnValueOnce({ data: null, loading: false, error: new Error('fallo'), refetch: jest.fn() });
    renderAt('/espacios/4');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });
});

describe('Noticias public pages', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists news summaries with links to their detail pages', () => {
    useFetch.mockReturnValue({ data: [noticia], loading: false });
    renderAt('/noticias');

    expect(screen.getByRole('heading', { name: 'Noticias' })).toBeInTheDocument();
    expect(screen.getByText('Una historia compartida.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: noticia.titulo })).toHaveAttribute('src', noticia.imagen);
    expect(screen.getByRole('link', { name: /Leer nota completa/ })).toHaveAttribute('href', '/noticias/12');
  });

  it('shows an empty state for an empty news list', () => {
    useFetch.mockReturnValue({ data: [], loading: false });
    renderAt('/noticias');

    expect(screen.getByText('Sin noticias publicadas')).toBeInTheDocument();
  });

  it('renders the article, its paragraphs, and the summary widget', () => {
    useFetch.mockReturnValue({ data: noticia, loading: false, error: null, refetch: jest.fn() });
    renderAt('/noticias/12');

    expect(screen.getByRole('heading', { name: noticia.titulo })).toBeInTheDocument();
    expect(screen.getByText('Resumen inteligente')).toBeInTheDocument();
    expect(screen.getByText('Primer párrafo.')).toBeInTheDocument();
    expect(screen.getByText('Segundo párrafo.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver a noticias' })).toHaveAttribute('href', '/noticias');
  });

  it('renders a retryable error state for a failed article request', () => {
    useFetch.mockReturnValue({ data: null, loading: false, error: new Error('fallo'), refetch: jest.fn() });
    renderAt('/noticias/12');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });
});