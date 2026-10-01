import { fireEvent, render, screen } from '@testing-library/react';
import BackToTop from '@/Components/Common/BackToTop';

describe('BackToTop', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    window.scrollTo = jest.fn();
  });

  it('appears after scrolling and smoothly returns to the top', () => {
    render(<BackToTop />);
    expect(screen.queryByRole('button', { name: 'Volver arriba' })).not.toBeInTheDocument();

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 400 });
    fireEvent.scroll(window);
    fireEvent.scroll(window);

    fireEvent.click(screen.getByRole('button', { name: 'Volver arriba' }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});