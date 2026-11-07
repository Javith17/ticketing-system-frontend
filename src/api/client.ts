import { API_BASE_URL } from '../utils/env';

const TOKEN_KEY = 'ticketing-auth-token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  // FormData bodies (file uploads) must not get a JSON content-type - the
  // browser sets multipart/form-data with the correct boundary itself.
  const isFormData = rest.body instanceof FormData;
  const finalHeaders: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getAuthToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection.', 0);
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const rawMessage = (body as { message?: string | string[] } | null)?.message;
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage || response.statusText;
    throw new ApiError(message, response.status);
  }

  return body as T;
}

export const apiGet = <T>(path: string, options?: ApiRequestOptions): Promise<T> =>
  apiRequest<T>(path, { ...options, method: 'GET' });

export const apiPost = <T>(path: string, data?: unknown, options?: ApiRequestOptions): Promise<T> =>
  apiRequest<T>(path, {
    ...options,
    method: 'POST',
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

export const apiPatch = <T>(path: string, data?: unknown, options?: ApiRequestOptions): Promise<T> =>
  apiRequest<T>(path, {
    ...options,
    method: 'PATCH',
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

export const apiPatchForm = <T>(path: string, form: FormData, options?: ApiRequestOptions): Promise<T> =>
  apiRequest<T>(path, { ...options, method: 'PATCH', body: form });

export const apiPostForm = <T>(path: string, form: FormData, options?: ApiRequestOptions): Promise<T> =>
  apiRequest<T>(path, { ...options, method: 'POST', body: form });

export const apiPut = <T>(path: string, data?: unknown, options?: ApiRequestOptions): Promise<T> =>
  apiRequest<T>(path, {
    ...options,
    method: 'PUT',
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

export const apiDelete = <T>(path: string, options?: ApiRequestOptions): Promise<T> =>
  apiRequest<T>(path, { ...options, method: 'DELETE' });
