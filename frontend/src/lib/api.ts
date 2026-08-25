const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type UserType = 'admin' | 'client';

export interface User {
  id: number | string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  age: number;
  type: UserType;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
}

export interface PaginatedUsers {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  users: User[];
}

export interface StatsCount {
  total_users: number;
}

export interface StatsAverageAge {
  average_age: number;
}

export interface CityCount {
  city: string;
  count: number;
}

export interface StatsTopCities {
  cities: CityCount[];
}

export interface FieldError {
  field: string;
  message: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  age: number;
  password: string;
}

export interface UpdateMePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  age?: number;
  password?: string;
}

export interface AdminUserPayload extends UpdateMePayload {
  type?: UserType;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  city?: string;
  type?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  age?: number | string;
  [key: string]: string | number | undefined;
}

export class ApiError extends Error {
  status: number;
  errors?: FieldError[];

  constructor(message: string, status: number, errors?: FieldError[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  params?: Record<string, string | number | undefined | null>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, params } = options;
  let url = `${API_BASE_URL}${path}`;

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString();
    if (query) url += `?${query}`;
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const detail = (data as { detail?: unknown } | null)?.detail;
    const message = detail || 'Something went wrong. Please try again.';
    throw new ApiError(
      typeof message === 'string' ? message : 'Validation failed',
      res.status,
      (data as { errors?: FieldError[] } | null)?.errors
    );
  }

  return data as T;
}

export const api = {
  register: (payload: RegisterPayload) =>
    request<User>('/register', { method: 'POST', body: payload }),
  login: (payload: { email: string; password: string }) =>
    request<LoginResponse>('/login', { method: 'POST', body: payload }),
  me: (token: string) => request<User>('/users/me', { token }),
  updateMe: (token: string, payload: UpdateMePayload) =>
    request<User>('/users/me', { method: 'PUT', body: payload, token }),
  listUsers: (token: string, params: ListUsersParams) =>
    request<PaginatedUsers>('/users', { token, params }),
  createUser: (token: string, payload: AdminUserPayload) =>
    request<User>('/users', { method: 'POST', body: payload, token }),
  updateUser: (token: string, id: number | string, payload: AdminUserPayload) =>
    request<User>(`/users/${id}`, { method: 'PUT', body: payload, token }),
  deleteUser: (token: string, id: number | string) =>
    request<void>(`/users/${id}`, { method: 'DELETE', token }),
  statsCount: () => request<StatsCount>('/stats/count'),
  statsAverageAge: () => request<StatsAverageAge>('/stats/average-age'),
  statsTopCities: () => request<StatsTopCities>('/stats/top-cities'),
};
