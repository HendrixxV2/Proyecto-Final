import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageContext } from '@/Context/LanguageContext';
import { useFetch } from '@/Hooks/useFetch';
import Historia from '@/Pages/Public/Historia';

jest.mock('@/Hooks/useFetch', () => ({ useFetch: jest.fn() }));
jest.mock('@/Services/contenidoService', () => ({ contenidoService: { bySeccion: jest.fn() } }));
jest.mock('@/Components/Common/OrotinaMap', () => () => <div>Mapa de Orotina</div>);

const retry = jest.fn();

function renderHistoria(language = 'es') {
  return render(
    <LanguageContext.Provider value={{ language }}>
      <Historia />
    </LanguageContext.Provider>,
  );
}

describe('Historia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFetch.mockReturnValue({ data: [], loading: false, error: null, refetch: retry });
  });

  it('selects chapters with keyboard navigation and wraps to the first chapter', () => {
    renderHistoria();
    const tabs = screen.getAllByRole('tab');
    const railwayTab = screen.getByRole('tab', { name: /El riel que abrió el camino/ });

    expect(railwayTab).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(railwayTab, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: /Un pueblo de confluencias/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Un pueblo de confluencias');

    fireEvent.keyDown(screen.getByRole('tab', { name: /Un pueblo de confluencias/ }), { key: 'End' });
    expect(tabs.at(-1)).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(tabs.at(-1), { key: 'ArrowDown' });
    expect(screen.getByRole('tab', { name: /El nombre del cantón/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders localized archive chapters and selects them by click', async () => {
    useFetch.mockReturnValue({
      data: [{
        id: 9,
        titulo: 'Archivo histórico',
        tituloEn: 'Historical archive',
        cuerpo: 'Texto en español.',
        cuerpoEn: 'Historical content in English.',
      }],
      loading: false,
      error: null,
      refetch: retry,
    });
    const user = userEvent.setup();
    renderHistoria('en');

    expect(screen.getByRole('heading', { name: 'History of Orotina' })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /Historical archive/ }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Historical content in English.');
  });

  it('opens and closes the dedication portrait modal', async () => {
    const user = userEvent.setup();
    renderHistoria();
    await user.click(screen.getByRole('button', { name: 'Ampliar imagen: Retrato de Luis Ferrero Acosta 1' }));

    expect(screen.getByRole('dialog', { name: 'Luis Ferrero Acosta' })).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByRole('img', { name: 'Retrato de Luis Ferrero Acosta 1' }))
      .toHaveAttribute('src', '/ferreAcosta.jpeg');
    await user.click(screen.getByRole('button', { name: 'Cerrar ventana' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows the empty archive state when no historical blocks exist', () => {
    renderHistoria();

    expect(screen.getByText('Contenido en preparación')).toBeInTheDocument();
    expect(screen.getByText('Estamos digitalizando el archivo histórico del cantón.')).toBeInTheDocument();
  });

  it('shows archive loading and retryable error states', async () => {
    useFetch.mockReturnValueOnce({ data: null, loading: true, error: null, refetch: retry });
    const { rerender } = renderHistoria();
    expect(screen.getByLabelText('Contenido en preparación')).toBeInTheDocument();

    useFetch.mockReturnValue({ data: null, loading: false, error: new Error('fallo'), refetch: retry });
    rerender(
      <LanguageContext.Provider value={{ language: 'es' }}>
        <Historia />
      </LanguageContext.Provider>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});