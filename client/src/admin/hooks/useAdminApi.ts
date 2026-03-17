import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

interface UseAdminApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminApi<T>(url: string): UseAdminApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    axios
      .get<T>(url)
      .then((r) => {
        if (!cancelled) setData(r.data);
      })
      .catch((err: AxiosError<{ error: string }>) => {
        if (!cancelled) setError(err.response?.data?.error ?? err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [url, tick]);

  return { data, loading, error, refetch };
}
