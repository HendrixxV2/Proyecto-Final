import { act, renderHook, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/Context/ToastContext';
import { useDebounce } from '@/Hooks/useDebounce';
import { useFetch } from '@/Hooks/useFetch';
import { useMediaQuery } from '@/Hooks/useMediaQuery';
import { useToast } from '@/Hooks/useToast';

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('keeps the previous value until the delay expires', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'inicial' },
    });

    expect(result.current).toBe('inicial');
    rerender({ value: 'actualizado' });

    act(() => jest.advanceTimersByTime(299));
    expect(result.current).toBe('inicial');
    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe('actualizado');
  });

  it('clears the previous timer when the value changes again', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'uno' },
    });

    rerender({ value: 'dos' });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: 'tres' });
    act(() => jest.advanceTimersByTime(299));
    expect(result.current).toBe('uno');
    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe('tres');
  });
});

describe('useFetch', () => {
  it('loads data immediately and provides an abort signal', async () => {
    const fetcher = jest.fn().mockResolvedValue(['evento']);
    const { result } = renderHook(() => useFetch(fetcher));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(['evento']);
    expect(fetcher.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
  });

  it('supports deferred execution and stores errors from refetch', async () => {
    const failure = new Error('Fallo de red');
    const fetcher = jest.fn().mockRejectedValue(failure);
    const { result } = renderHook(() => useFetch(fetcher, [], {
      immediate: false,
      initialData: ['guardado'],
    }));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(['guardado']);
    expect(fetcher).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBe(failure);
    expect(result.current.data).toEqual(['guardado']);
    expect(result.current.loading).toBe(false);
  });

  it('aborts the previous request when dependencies change', async () => {
    const signals = [];
    const fetcher = jest.fn((signal) => {
      signals.push(signal);
      return Promise.resolve(signal.aborted);
    });
    const { rerender, result } = renderHook(({ eventId }) => useFetch(fetcher, [eventId]), {
      initialProps: { eventId: 1 },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ eventId: 2 });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(signals).toHaveLength(2);
    expect(signals[0].aborted).toBe(true);
    expect(result.current.data).toBe(false);
  });
});

describe('useMediaQuery', () => {
  it('tracks changes emitted by matchMedia', () => {
    let changeHandler;
    const removeEventListener = jest.fn();
    jest.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn((event, handler) => {
        if (event === 'change') changeHandler = handler;
      }),
      removeEventListener,
    }));

    const { result, unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);
    act(() => changeHandler({ matches: true }));
    expect(result.current).toBe(true);
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', changeHandler);
    window.matchMedia.mockRestore();
  });
});

describe('useToast', () => {
  it('provides toast helpers and expires notifications', () => {
    jest.useFakeTimers();
    const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => result.current.success('Guardado', 'Cambios aplicados'));
    expect(result.current.toasts).toEqual([
      expect.objectContaining({ title: 'Guardado', variant: 'success' }),
    ]);

    act(() => jest.advanceTimersByTime(4200));
    expect(result.current.toasts).toEqual([]);
    jest.useRealTimers();
  });

  it('uses a silent fallback outside the provider', () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toEqual([]);
    expect(result.current.push()).toBeUndefined();
    expect(result.current.dismiss()).toBeUndefined();
    expect(warning).toHaveBeenCalledTimes(1);
    warning.mockRestore();
  });
});