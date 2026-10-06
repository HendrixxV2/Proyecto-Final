import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '@/Components/Common/Navbar';

jest.mock('@/Hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    logout: jest.fn(),
  }),
}));

jest.mock('@/Hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'es',
    setLanguage: jest.fn(),
    t: (key) => key,
  }),
}));

jest.mock('@/Components/UI/ThemeToggle', () => () => <div />);
jest.mock('@/Components/UI/FontSizeControl', () => () => <div />);
jest.mock('@/Components/UI/AccessibilityPanel', () => () => <div />);

describe('Navbar scroll appearance', () => {
  it('uses a themed solid surface at the top and a translucent surface while scrolled', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('rounded-2xl', 'border-black/[0.06]', 'bg-white/95', 'dark:bg-ink-900');
    expect(header).not.toHaveClass('bg-white/90', 'dark:bg-ink-900/80');

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 100 });
    fireEvent.scroll(window);
    expect(header).toHaveClass('bg-white/90', 'dark:bg-ink-900/80', 'shadow-md');

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    fireEvent.scroll(window);
    expect(header).not.toHaveClass('bg-white/90', 'dark:bg-ink-900/80');
  });

  it('uses brighter surfaces for active and hovered navigation links in dark mode', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'common.home' })).toHaveClass('dark:bg-ink-700');
    expect(screen.getByRole('link', { name: 'common.tickets' })).toHaveClass('dark:hover:bg-ink-700');
  });
});
