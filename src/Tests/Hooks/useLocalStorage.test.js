import { act, renderHook } from '@testing-library/react';
import { useLocalStorage } from '@/Hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear());

  it('inicializa con el valor por defecto cuando la clave no existe', () => {
    const { result } = renderHook(() => useLocalStorage('caco.test', { a: 1 }));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it('persiste los cambios en localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('caco.test', 0));

    act(() => result.current[1](42));

    expect(result.current[0]).toBe(42);
    expect(JSON.parse(localStorage.getItem('caco.test'))).toBe(42);
  });

  it('acepta actualizaciones funcionales', () => {
    const { result } = renderHook(() => useLocalStorage('caco.count', 1));

    act(() => result.current[1]((prev) => prev + 4));

    expect(result.current[0]).toBe(5);
  });
});