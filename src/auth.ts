import { API_URL } from './types';

export interface Session {
  id: number;
  email: string;
  role: string;
  /** Primer nombre del usuario, tal como viene en el token. */
  name: string;
}

export const getToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

/** Decodifica el payload de un JWT (base64url con posibles caracteres UTF-8). */
export const decodeToken = (token: string): Record<string, any> | null => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/** Sesión del usuario actual, o null si no hay token o ya expiró. */
export const getSession = (): Session | null => {
  const token = getToken();
  const payload = token ? decodeToken(token) : null;
  if (!payload || typeof payload.sub !== 'number') return null;
  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) return null;
  return { id: payload.sub, email: payload.email, role: payload.role ?? 'STUDENT', name: payload.name ?? '' };
};

/** Llama a la API con el token de sesión y traduce los errores del servidor a mensajes legibles. */
export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      const detail = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      if (detail) message = detail;
    } catch {
      /* la respuesta no es JSON */
    }
    throw new Error(message);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}
