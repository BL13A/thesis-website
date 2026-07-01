/** Vite env: create .env with VITE_API_URL=http://localhost:3000 for local web dev. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://192.168.8.124:3000'
).replace(/\/$/, '');

const TOKEN_KEY = 'tilevision_web_token';

type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface ApiRequestOptions {
  method?: ApiMethod;
  body?: unknown;
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL.replace(/\/$/, '');
}

export function getAuthApiUrl(path: string): string {
  return `${getApiBaseUrl()}/api/auth${path}`;
}

export function getInspectionsApiUrl(path = ''): string {
  return `${getApiBaseUrl()}/api/inspections${path}`;
}

export function getNotificationsApiUrl(path = ''): string {
  return `${getApiBaseUrl()}/api/notifications${path}`;
}

export function getTilesApiUrl(path = ''): string {
  return `${getApiBaseUrl()}/api/tiles${path}`;
}

export function getInventoryApiUrl(path = ''): string {
  return `${getApiBaseUrl()}/api/inventory${path}`;
}

export function getStockMovementsApiUrl(path = ''): string {
  return `${getApiBaseUrl()}/api/stock-movements${path}`;
}

export function getDeliveriesApiUrl(path = ''): string {
  return `${getApiBaseUrl()}/api/deliveries${path}`;
}

export function getRecognitionLogsApiUrl(path = ''): string {
  return `${getApiBaseUrl()}/api/recognition-logs${path}`;
}

export function getRecommendationsApiUrl(tileId: string): string {
  return `${getApiBaseUrl()}/api/recommendations/${tileId}`;
}

export function getInspectApiUrl(query = ''): string {
  return `${getApiBaseUrl()}/api/inspect${query}`;
}

export function getDashboardApiUrl(path = ''): string {
  return `${getApiBaseUrl()}/api/dashboard${path}`;
}

export function getProcurementApiUrl(path = ''): string {
  return `${getApiBaseUrl()}/api/procurement${path}`;
}

export function getSuppliersApiUrl(path = ''): string {
  return `${getApiBaseUrl()}/api/suppliers${path}`;
}

export function getReportsApiUrl(reportType: string): string {
  return `${getApiBaseUrl()}/api/reports/${reportType}`;
}

export function getAiApiUrl(path = ''): string {
  return `${getApiBaseUrl()}/api/ai${path}`;
}

export function saveAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function authHeaders(auth: boolean): Promise<Record<string, string>> {
  if (!auth) return {};
  const token = getAccessToken();
  if (!token) throw new ApiError('Not authenticated', 401);
  return { Authorization: `Bearer ${token}` };
}

async function parseResponse<T>(response: Response): Promise<T> {
  let result: T;
  try {
    result = (await response.json()) as T;
  } catch {
    throw new ApiError(`API request failed (${response.status})`, response.status);
  }

  if (!response.ok) {
    const message =
      typeof result === 'object' &&
      result !== null &&
      'error' in result &&
      typeof (result as { error?: string }).error === 'string'
        ? (result as { error: string }).error
        : `API request failed (${response.status})`;

    if (response.status === 401) unauthorizedHandler?.();
    throw new ApiError(message, response.status);
  }

  return result;
}

export async function apiRequest<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = options;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeaders(auth)),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(`Cannot reach TileVision API at ${API_BASE_URL}`, 0);
  }

  return parseResponse<T>(response);
}

export async function apiMultipartRequest<T>(
  url: string,
  options: { method?: ApiMethod; body: FormData; auth?: boolean } = { body: new FormData() },
): Promise<T> {
  const { method = 'POST', body, auth = false } = options;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: await authHeaders(auth),
      body,
    });
  } catch {
    throw new ApiError(`Cannot reach TileVision API at ${API_BASE_URL}`, 0);
  }

  return parseResponse<T>(response);
}
