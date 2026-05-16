type QueryValue = string | number | boolean | null | undefined;

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export type QueryParams = Record<string, QueryValue>;

export type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  body?: unknown;
  headers?: HeadersInit;
  query?: QueryParams;
};

/** Standard API response shape from the backend */
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string; value?: unknown }>;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class ApiClient {
  private readonly baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>('GET', endpoint, options);
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>('PATCH', endpoint, { ...options, body });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>('DELETE', endpoint, options);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { body, headers, query, ...restOptions } = options;
    const url = this.buildUrl(endpoint, query);
    const normalizedHeaders = new Headers(headers);
    const isJsonBody = body !== undefined && body !== null && !(body instanceof FormData);

    if (isJsonBody && !normalizedHeaders.has('Content-Type')) {
      normalizedHeaders.set('Content-Type', 'application/json');
    }

    if (!normalizedHeaders.has('Accept')) {
      normalizedHeaders.set('Accept', 'application/json');
    }

    if (this.authToken && !normalizedHeaders.has('Authorization')) {
      normalizedHeaders.set('Authorization', `Bearer ${this.authToken}`);
    }

    const response = await fetch(url, {
      ...restOptions,
      method,
      headers: normalizedHeaders,
      body: this.serializeBody(body),
    });

    const data = await this.parseResponse(response);

    if (!response.ok) {
      const message =
        typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof data.message === 'string'
          ? data.message
          : `Request failed with status ${response.status}`;

      throw new ApiError(message, response.status, data);
    }

    return data as T;
  }

  private buildUrl(endpoint: string, query?: QueryParams) {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${path}`);

    if (!query) {
      return url.toString();
    }

    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      url.searchParams.append(key, String(value));
    });

    return url.toString();
  }

  private serializeBody(body: unknown) {
    if (body === undefined || body === null) {
      return undefined;
    }

    if (
      typeof body === 'string' ||
      body instanceof FormData ||
      body instanceof URLSearchParams ||
      body instanceof Blob
    ) {
      return body;
    }

    return JSON.stringify(body);
  }

  private async parseResponse(response: Response) {
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('Content-Type') ?? '';

    if (contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }
}

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const apiClient = new ApiClient(apiBaseUrl);
