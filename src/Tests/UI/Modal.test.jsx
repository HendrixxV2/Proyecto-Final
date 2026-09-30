import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Modal from '@/Components/UI/Modal';

function ModalHarness() {
  const [value, setValue] = useState('');

  return (
    <Modal open onClose={() => {}} title="Nuevo usuario">
      <input aria-label="Nombre" value={value} onChange={(event) => setValue(event.target.value)} />
    </Modal>
  );
}

describe('Modal', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('mantiene el foco en el campo al actualizarse el callback de cierre', () => {
    jest.useFakeTimers();
    render(<ModalHarness />);

    const input = screen.getByRole('textbox', { name: 'Nombre' });
    act(() => {
      jest.advanceTimersByTime(30);
    });
    input.focus();

    fireEvent.change(input, { target: { value: 'Ana' } });
    act(() => {
      jest.advanceTimersByTime(30);
    });

    expect(input).toHaveFocus();
  });
});