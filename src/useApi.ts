import { useEffect, useState } from 'react';
import { api } from './auth';

type Result<T> = { key: string | null; data: T | null; error: string | null };

/**
 * Consulta GET a la API. `reloadKey` permite volver a consultar tras una acción.
 * Mientras llega la respuesta se conserva el dato anterior y `loading` es verdadero.
 */
export function useApi<T>(path: string | null, reloadKey = 0) {
  const key = path === null ? null : `${path}#${reloadKey}`;
  const [result, setResult] = useState<Result<T>>({ key: null, data: null, error: null });

  useEffect(() => {
    if (path === null) return;
    let active = true;
    api<T>(path)
      .then((data) => active && setResult({ key, data, error: null }))
      .catch((err: Error) => active && setResult({ key, data: null, error: err.message }));
    return () => {
      active = false;
    };
  }, [path, key]);

  return {
    data: result.data,
    loading: key !== null && result.key !== key,
    error: result.key === key ? result.error : null,
  };
}
