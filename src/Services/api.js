const readViteEnv = (key, fallback) => {
  try {
    const env = Function('return import.meta.env')();
    return env?.[key] ?? fallback;
  } catch {
    return fallback;
  }
};

const BASE_URL = readViteEnv('VITE_API_URL', 'http://localhost:4000');

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = 'GET', body, headers, signal } = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    let payload = null;
    try {
      payload = await res.json();
    } catch {
      /* respuesta sin cuerpo */
    }
    throw new ApiError(payload?.message ?? `Error ${res.status}`, res.status, payload);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body, ...opts }),
  patch: (path, body, opts) => request(path, { method: 'PATCH', body, ...opts }),
  delete: (path, opts) => request(path, { method: 'DELETE', ...opts }),
};