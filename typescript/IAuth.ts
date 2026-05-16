/**
 * Interface for a stored user in the app.
 * Persisted in SecureStore/localStorage.
 */
export interface IStoredUser {
  _id: string;
  username: string;
  email: string;
  displayName?: string;
  stats?: {
    totalQuizzes: number;
    currentStreak: number;
    longestStreak: number;
  };
}

/**
 * Interface for authentication state in the app.
 */
export interface IAuthState {
  user: IStoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Interface for the auth API response from login/register endpoints.
 */
export interface IAuthApiResponse {
  user: IStoredUser;
  token: string;
  refreshToken?: string;
}

/**
 * Interface for the auth context value provided to the app.
 */
export interface IAuthContextValue extends IAuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    displayName: string | undefined,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
