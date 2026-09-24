import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Button from '@/Components/UI/Button';

describe('<Button />', () => {
  it('renderiza el texto y responde al clic', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Reservar</Button>);

    const boton = screen.getByRole('button', { name: /reservar/i });
    await userEvent.click(boton);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('se deshabilita y expone aria-busy cuando está cargando', () => {
    render(<Button loading>Enviando</Button>);

    const boton = screen.getByRole('button', { name: /enviando/i });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute('aria-busy', 'true');
  });

  it('renderiza como enlace interno cuando recibe la prop to', () => {
    render(
      <MemoryRouter>
        <Button to="/espacios">Ver espacios</Button>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /ver espacios/i })).toHaveAttribute('href', '/espacios');
  });
});