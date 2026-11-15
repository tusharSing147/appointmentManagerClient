import type {
  Appointment,
  AppointmentFilter,
  AppointmentInput,
  AppointmentListResponse,
  AppointmentStatus,
  FieldErrors,
  HealthResponse,
} from './types';

const API_BASE = String(import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

interface ApiErrorOptions {
  status?: number;
  errors?: FieldErrors;
}

export class ApiError extends Error {
  readonly status?: number;
  readonly fieldErrors?: FieldErrors;

  constructor(message: string, { status, errors }: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = errors;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError('Cannot reach the API. Check that the server is running.');
  }

  const contentType = response.headers.get('content-type') ?? '';
  const body: unknown = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const payload = body as { error?: string; errors?: FieldErrors } | null;
    throw new ApiError(payload?.error || `Request failed (${response.status}).`, {
      status: response.status,
      errors: payload?.errors,
    });
  }

  return body as T;
}

export interface ListOptions {
  status?: AppointmentFilter;
  search?: string;
}

export interface ApiCallOptions {
  signal?: AbortSignal;
}

interface AppointmentResponse {
  data: Appointment;
}

export const api = {
  health(): Promise<HealthResponse> {
    return request<HealthResponse>('/health');
  },

  list(
    { status = 'All', search = '' }: ListOptions = {},
    { signal }: ApiCallOptions = {},
  ): Promise<AppointmentListResponse> {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.set('status', status);
    if (search.trim()) params.set('search', search.trim());

    const query = params.toString();
    return request<AppointmentListResponse>(
      `/appointments${query ? `?${query}` : ''}`,
      { signal },
    );
  },

  create(payload: AppointmentInput): Promise<AppointmentResponse> {
    return request<AppointmentResponse>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateStatus(id: string, status: AppointmentStatus): Promise<AppointmentResponse> {
    return request<AppointmentResponse>(
      `/appointments/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
    );
  },
};
