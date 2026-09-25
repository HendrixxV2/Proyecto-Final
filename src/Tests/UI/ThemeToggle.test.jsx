import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/Context/ThemeContext';
import ThemeToggle from '@/Components/UI/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    window.localStorage.clear();
  });

  it('activa el modo oscuro en el documento', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const darkButton = screen.getByRole('radio', { name: /tema oscuro/i });
    await user.click(darkButton);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
