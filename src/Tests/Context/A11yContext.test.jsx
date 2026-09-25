import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { A11yProvider } from '@/Context/A11yContext';
import { useA11y } from '@/Hooks/useA11y';

function AccessibilityHarness() {
  const { setColorPalette, toggle } = useA11y();

  return (
    <>
      <button type="button" onClick={() => setColorPalette('red-green')}>Aplicar paleta</button>
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
  });

  afterEach(() => {
    if (originalSpeechSynthesis) Object.defineProperty(window, 'speechSynthesis', originalSpeechSynthesis);
    else delete window.speechSynthesis;
    if (originalUtterance) Object.defineProperty(window, 'SpeechSynthesisUtterance', originalUtterance);
    else delete window.SpeechSynthesisUtterance;
  });

  it('applies a selected color vision palette to the document', async () => {
    render(<A11yProvider><AccessibilityHarness /></A11yProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Aplicar paleta' }));

    await waitFor(() => expect(document.documentElement.dataset.colorPalette).toBe('red-green'));
    expect(document.documentElement.style.getPropertyValue('--a11y-brand-500')).toBe('0 114 178');
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
});