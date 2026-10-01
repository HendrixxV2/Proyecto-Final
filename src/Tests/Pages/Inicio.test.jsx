import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '@/Context/LanguageContext';
import { useA11y } from '@/Hooks/useA11y';
import { useFetch } from '@/Hooks/useFetch';
import Inicio from '@/Pages/Public/Inicio';

jest.mock('@/Hooks/useA11y', () => ({ useA11y: jest.fn() }));
jest.mock('@/Hooks/useFetch', () => ({ useFetch: jest.fn() }));
jest.mock('@/Services/eventosService', () => ({ eventosService: { listPublicados: jest.fn() } }));
jest.mock('@/Components/Weather/WeatherWidget', () => () => <div>Clima de Orotina</div>);
jest.mock('@/Components/AI/EventRecommender', () => () => <div>Recomendaciones culturales</div>);
jest.mock('@/Components/UI/BlurText', () => ({ text }) => <span>{text}</span>);

const events = [
  {
    id: 1,
    titulo: 'Teatro comunitario',
    categoria: 'Teatro',
    descripcion: 'Presentación local.',
    fecha: '2026-10-05',
    horaInicio: '18:00',
  },
];

function renderInicio() {
  return render(
    <MemoryRouter>
      <LanguageProvider><Inicio /></LanguageProvider>
    </MemoryRouter>,
  );
}

describe('Inicio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useA11y.mockReturnValue({ reducedMotion: false });
    useFetch.mockReturnValue({ data: events, loading: false });
  });

  it('renders the home sections, upcoming events, and quick links', () => {
    renderInicio();

    expect(screen.getByRole('heading', { name: /Centro Cultural Orotinense/ })).toBeInTheDocument();
    expect(screen.getByText('Teatro comunitario')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver programación/ })).toHaveAttribute('href', '/calendario');
    expect(screen.getByRole('link', { name: /Boletos/ })).toHaveAttribute('href', '/boletos');
    expect(screen.getByText('Grupo de Baile Folclórico')).toBeInTheDocument();
    expect(screen.getByText('Banda Comunal de Orotina')).toBeInTheDocument();
    expect(screen.getByText('Recomendaciones culturales')).toBeInTheDocument();
  });

  it('renders loading placeholders before event data arrives', () => {
    useFetch.mockReturnValue({ data: null, loading: true });
    const { container } = renderInicio();

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText('Teatro comunitario')).not.toBeInTheDocument();
  });

  it('changes hero, event, and recommendation carousel selections', async () => {
    const user = userEvent.setup();
    renderInicio();

    const heroCarousel = screen.getByRole('group', { name: 'Carrusel de imágenes' });
    const heroButton = within(heroCarousel).getByRole('button', { name: 'Mostrar imagen: Pabellón de Orotina' });
    await user.click(heroButton);
    expect(heroButton).toHaveAttribute('aria-pressed', 'true');

    const eventCarousel = screen.getByRole('group', { name: 'Imágenes de próximos eventos' });
    const eventButton = within(eventCarousel).getByRole('button', { name: 'Mostrar imagen: Próximo evento cultural' });
    await user.click(eventButton);
    expect(eventButton).toHaveAttribute('aria-pressed', 'true');

    const recommendations = screen.getByRole('group', { name: 'Imágenes de recomendaciones' });
    const recommendationButton = within(recommendations).getByRole('button', { name: 'Mostrar imagen: Orotina de noche' });
    await user.click(recommendationButton);
    expect(recommendationButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens the band photo viewer and supports keyboard navigation and Escape', async () => {
    const user = userEvent.setup();
    renderInicio();
    await user.click(screen.getByRole('button', { name: 'Ver Orgullo comunal en pantalla completa' }));

    const dialog = screen.getByRole('dialog', { name: 'Galería de la Banda Comunal de Orotina' });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('img', { name: 'Banda Comunal de Orotina durante una presentación' })).toBeInTheDocument();
    expect(document.body).toHaveStyle({ overflow: 'hidden' });

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(within(dialog).getByText('Música en comunidad · 2 / 4')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
  });

  it('keeps the carousel still with reduced motion and scrolls to the top instantly', () => {
    jest.useFakeTimers();
    useA11y.mockReturnValue({ reducedMotion: true });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 500 });
    window.scrollTo = jest.fn();
    renderInicio();

    expect(screen.getByRole('button', { name: 'Mostrar imagen: Luis Ferrero Acosta' })).toHaveAttribute('aria-pressed', 'true');
    act(() => jest.advanceTimersByTime(12000));
    expect(screen.getByRole('button', { name: 'Mostrar imagen: Luis Ferrero Acosta' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.scroll(window);
    const backToTop = screen.getByRole('button', { name: 'Volver arriba' });
    fireEvent.click(backToTop);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    jest.useRealTimers();
  });
});