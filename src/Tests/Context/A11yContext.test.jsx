import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { A11yProvider } from '@/Context/A11yContext';
import { useA11y } from '@/Hooks/useA11y';

function AccessibilityHarness() {
  const { setColorPalette, toggle } = useA11y();

  return (
    <>
      <button type="button" onClick={() => setColorPalette('red-green')}>Aplicar paleta</button>
      <button type="button" onClick={() => setColorPalette('blue-yellow')}>Paleta azul-amarillo</button>
      <button type="button" onClick={() => setColorPalette('standard')}>Paleta original</button>
      <button type="button" onClick={() => toggle('highContrast')}>Alternar alto contraste</button>
      <button type="button" onClick={() => toggle('voiceGuide')}>Activar guía</button>
      <a href="#agenda">Programación cultural</a>
    </>
  );
}

describe('A11yProvider', () => {
  const originalSpeechSynthesis = Object.getOwnPropertyDescriptor(window, 'speechSynthesis');
  const originalUtterance = Object.getOwnPropertyDescriptor(window, 'SpeechSynthesisUtterance');

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-color-palette');
    document.documentElement.style.removeProperty('filter');
  });

  afterEach(() => {
    if (originalSpeechSynthesis) Object.defineProperty(window, 'speechSynthesis', originalSpeechSynthesis);
    else delete window.speechSynthesis;
    if (originalUtterance) Object.defineProperty(window, 'SpeechSynthesisUtterance', originalUtterance);
    else delete window.SpeechSynthesisUtterance;
    document.documentElement.lang = '';
  });

  it('applies a selected color vision palette to the document', async () => {
    render(<A11yProvider><AccessibilityHarness /></A11yProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Aplicar paleta' }));

    await waitFor(() => expect(document.documentElement.dataset.colorPalette).toBe('red-green'));
    expect(document.documentElement.style.filter).toBe('hue-rotate(35deg) saturate(0.9)');
  });

  it('applies the blue-yellow palette while preserving high contrast', async () => {
    render(<A11yProvider><AccessibilityHarness /></A11yProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Paleta azul-amarillo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Alternar alto contraste' }));

    await waitFor(() => {
      expect(document.documentElement.dataset.colorPalette).toBe('blue-yellow');
      expect(document.documentElement.style.filter).toBe('contrast(1.15) hue-rotate(180deg) saturate(0.9)');
    });
  });

  it('restores the original colors when the standard palette is selected', async () => {
    window.localStorage.setItem('caco.a11y', JSON.stringify({ colorPalette: 'red-green' }));
    render(<A11yProvider><AccessibilityHarness /></A11yProvider>);

    expect(document.documentElement.style.filter).toBe('hue-rotate(35deg) saturate(0.9)');

    fireEvent.click(screen.getByRole('button', { name: 'Paleta original' }));

    await waitFor(() => {
      expect(document.documentElement.dataset.colorPalette).toBe('standard');
      expect(document.documentElement.style.filter).toBe('');
    });
  });

  it('speaks focused control labels while the voice guide is enabled', async () => {
    const speechSynthesis = { cancel: jest.fn(), speak: jest.fn() };
    class MockUtterance {
      constructor(text) { this.text = text; }
    }
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: speechSynthesis });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: MockUtterance });
    render(<A11yProvider><AccessibilityHarness /></A11yProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Activar guía' }));
    await waitFor(() => expect(speechSynthesis.speak).toHaveBeenCalled());
    screen.getByRole('link', { name: 'Programación cultural' }).focus();

    await waitFor(() => expect(speechSynthesis.speak.mock.calls.at(-1)[0].text).toBe('Programación cultural'));
  });

  it('uses Mandarin Chinese for welcome and focused labels in the Chinese interface', async () => {
    const speechSynthesis = { cancel: jest.fn(), speak: jest.fn() };
    class MockUtterance {
      constructor(text) { this.text = text; }
    }
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: speechSynthesis });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: MockUtterance });
    document.documentElement.lang = 'zh-Hant';
    render(<A11yProvider><AccessibilityHarness /></A11yProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Activar guía' }));
    await waitFor(() => expect(speechSynthesis.speak).toHaveBeenCalled());
    expect(speechSynthesis.speak.mock.calls[0][0].lang).toBe('zh-CN');

    screen.getByRole('link', { name: 'Programación cultural' }).focus();
    await waitFor(() => expect(speechSynthesis.speak.mock.calls.at(-1)[0].text).toBe('Programación cultural'));
    expect(speechSynthesis.speak.mock.calls.at(-1)[0].lang).toBe('zh-CN');
  });
});