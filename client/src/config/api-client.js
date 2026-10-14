import { API_BASE } from './api.js';

export class ApiRequestError extends Error {
  constructor(kind, status = null, detail = '', body = null) {
    super(kind);
    this.name = 'ApiRequestError';
    this.kind = kind;
    this.status = status;
    this.detail = detail;
    this.body = body;
  }
}

export async function requestJson(path, { base = API_BASE, fetchImpl = fetch, ...init } = {}) {
  if (typeof path !== 'string' || !path.startsWith('/api/')) {
    throw new TypeError('API path must start with /api/');
  }
  let response;
  try {
    response = await fetchImpl(`${base.replace(/\/+$/, '')}${path}`, init);
  } catch {
    throw new ApiRequestError('network');
  }
  if (!response.ok) {
    const kind = response.status === 401 ? 'unauthorized' : response.status >= 500 ? 'server' : 'http';
    const body = await response.json().catch(() => null);
    throw new ApiRequestError(kind, response.status, typeof body?.error === 'string' ? body.error : '', body);
  }
  try {
    return await response.json();
  } catch {
    throw new ApiRequestError('invalid', response.status);
  }
}
