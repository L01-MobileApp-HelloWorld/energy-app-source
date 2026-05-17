/**
 * Primitive value types allowed in query parameters.
 */
export type IQueryValue = string | number | boolean | null | undefined;

/**
 * Query parameters for API requests.
 */
export type IQueryParams = Record<string, IQueryValue>;

/**
 * Options for making API requests.
 */
export interface IRequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  body?: unknown;
  headers?: HeadersInit;
  query?: IQueryParams;
}

/**
 * Standard API response shape from the backend.
 */
export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field: string; message: string; value?: unknown }[];
}

/**
 * Interface for API answer payload when submitting a quiz.
 */
export interface IApiAnswer {
  questionId: number;
  group: 'energy' | 'work' | 'psychology' | 'environment';
  selectedOption: number;
  score: number;
}

/**
 * Interface for the server result returned after quiz submission.
 */
export interface IServerResult {
  _id?: string;
  userId?: string;
  scores: {
    energy: number;
    work: number;
    psychology: number;
    environment: number;
    total: number;
  };
  state: string;
  createdAt?: string;
  stateDetails: {
    name: string;
    emoji: string;
    color?: string;
    description: string;
    recommendations: string[];
  };
}
