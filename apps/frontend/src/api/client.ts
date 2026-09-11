import type { HttpError, HttpValidationError } from '../types/api.ts';

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ApiError extends Error {
  status: number;
  body: HttpValidationError | HttpError | unknown;

  constructor(status: number, body: HttpValidationError | HttpError | unknown) {
    super(`API error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  isValidationError(): this is ApiError & { status: 422; body: HttpValidationError } {
    return this.status === 422 && isHttpValidationError(this.body);
  }

  isNotFound(): this is ApiError & { status: 404; body: HttpError } {
    return this.status === 404 && isHttpError(this.body);
  }

  isNetworkError(): boolean {
    return this.status === 0;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }
}

function isHttpValidationError(body: unknown): body is HttpValidationError {
  return (
    typeof body === 'object' &&
    body !== null &&
    'detail' in body &&
    Array.isArray((body as HttpValidationError).detail)
  );
}

function isHttpError(body: unknown): body is HttpError {
  return (
    typeof body === 'object' &&
    body !== null &&
    'detail' in body &&
    typeof (body as HttpError).detail === 'string'
  );
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL.replace(/\/$/, '')}${normalizedPath}`;
}

function withMutationHeaders(method: string, headers: HeadersInit | undefined): Headers {
  const merged = new Headers(headers);

  if (MUTATION_METHODS.has(method) && !merged.has('Content-Type')) {
    merged.set('Content-Type', 'application/json');
  }

  return merged;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : undefined;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = withMutationHeaders(method, options.headers);
  const url = buildUrl(path);

  let response: Response;

  try {
    response = await fetch(url, { ...options, method, headers });
  } catch (cause) {
    throw new ApiError(0, cause);
  }

  let body: unknown;

  try {
    body = await parseResponseBody(response);
  } catch {
    throw new ApiError(response.status, undefined);
  }

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}

export function get<T>(path: string, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'GET' });
}

export function post<T>(
  path: string,
  body?: unknown,
  options?: Omit<RequestInit, 'method' | 'body'>,
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function put<T>(
  path: string,
  body?: unknown,
  options?: Omit<RequestInit, 'method' | 'body'>,
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function deleteRequest<T>(
  path: string,
  options?: Omit<RequestInit, 'method' | 'body'>,
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'DELETE' });
}

export { deleteRequest as delete };
