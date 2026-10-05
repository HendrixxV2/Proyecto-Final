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
    expect(header).toHaveClass('rounded-2xl', 'shadow-md', 'bg-ink-50', 'dark:bg-ink-900');
    expect(header).not.toHaveClass('bg-ink-50/80', 'dark:bg-ink-900/80');

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 100 });
    fireEvent.scroll(window);
    expect(header).toHaveClass('bg-ink-50/80', 'dark:bg-ink-900/80', 'shadow-lg');

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    fireEvent.scroll(window);
    expect(header).not.toHaveClass('bg-ink-50/80', 'dark:bg-ink-900/80');
  });
});
