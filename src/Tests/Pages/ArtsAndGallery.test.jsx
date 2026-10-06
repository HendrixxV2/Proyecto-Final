import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFetch } from '@/Hooks/useFetch';
import { LanguageProvider } from '@/Context/LanguageContext';
import Artes from '@/Pages/Public/Artes';
import Galeria from '@/Pages/Public/Galeria';

jest.mock('@/Hooks/useFetch', () => ({ useFetch: jest.fn() }));
jest.mock('@/Services/contenidoService', () => ({ contenidoService: { list: jest.fn(), bySeccion: jest.fn() } }));
jest.mock('@/Components/AI/EventRecommender', () => ({ categoria }) => <div>Recomendaciones: {categoria}</div>);

describe('Artes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders all disciplines with their CMS content and recommendations', () => {
    useFetch.mockReturnValue({
      data: [
        { id: 1, seccion: 'teatro', titulo: 'Teatro comunitario', cuerpo: 'Formación escénica para todas las edades.' },
        { id: 2, seccion: 'baile', titulo: 'Danza juvenil', cuerpo: 'Danza folclórica y contemporánea.' },
      ],
      loading: false,
    });
    render(<Artes />);

    expect(screen.getByRole('heading', { name: 'Teatro · Baile · Canto' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Teatro', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Teatro comunitario')).toBeInTheDocument();
    expect(screen.getByText('Danza juvenil')).toBeInTheDocument();
    expect(screen.getByText('Recomendaciones: canto')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Grupo de baile del Centro Cultural Orotinense' })).toHaveAttribute('loading', 'lazy');
  });

  it('shows loading placeholders while program content loads', () => {
    useFetch.mockReturnValue({ data: null, loading: true });
    const { container } = render(<Artes />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

describe('Galeria', () => {
  const renderGaleria = () => render(<LanguageProvider><Galeria /></LanguageProvider>);

  beforeEach(() => {
    jest.clearAllMocks();
    useFetch.mockReturnValue({
      data: [{ id: 1, titulo: 'Estación de Orotina, circa 1952', cuerpo: 'Memoria del ferrocarril.' }],
      loading: false,
    });
  });

  it('opens the photo presentation and navigates with buttons and arrow keys', async () => {
    const user = userEvent.setup();
    renderGaleria();

    expect(screen.getByText('Estación de Orotina, circa 1952')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir presentación de fotografías del Ferrocarril al Pacífico' })).toHaveClass('galeria-feature--weathered');
    await user.click(screen.getByRole('button', { name: 'Abrir presentación de fotografías del Ferrocarril al Pacífico' }));

    expect(screen.getByRole('dialog', { name: 'Orotina, estación y memoria' })).toBeInTheDocument();
    expect(screen.getByText('01 / 04')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ver fotografía siguiente' }));
    expect(screen.getByRole('dialog', { name: 'El tren al Pacífico' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByRole('dialog', { name: 'Orotina, estación y memoria' })).toBeInTheDocument();
  });

  it('supports direct photo selection, wraps navigation, and closes the modal', async () => {
    const user = userEvent.setup();
    renderGaleria();
    await user.click(screen.getByRole('button', { name: 'Abrir presentación de fotografías del Ferrocarril al Pacífico' }));
    await user.click(screen.getByRole('button', { name: 'Ver fotografía anterior' }));

    expect(screen.getByRole('dialog', { name: 'Orotina en perspectiva' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ver fotografía 2' }));
    expect(screen.getByRole('dialog', { name: 'El tren al Pacífico' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar ventana' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});