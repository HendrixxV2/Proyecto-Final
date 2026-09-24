import { useCallback, useEffect, useRef, useState } from 'react';

export function useFetch(fetcher, deps = [], { immediate = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(immediate);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current(signal);
      setData(result);
      return result;
    } catch (err) {
      if (err?.name !== 'AbortError') setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!immediate) return undefined;
    const controller = new AbortController();
    execute(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, refetch: execute, setData };
}