/**
 * Interface for a stored user in the app.
 * Persisted in SecureStore.
 */
export interface IStoredUser {
  _id: string;
  username: string;
  email: string;
  displayName?: string;
  preferences?: {
    darkMode?: boolean;
    language?: string;
    notificationsEnabled?: boolean;
    reminderTime?: string;
    reminderFrequency?: string;
    customReminderDays?: number[];
  };
  stats?: {
    totalQuizzes: number;
    currentStreak: number;
    longestStreak: number;
    lastQuizDate?: string;
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

export interface IUpdateProfilePayload {
  displayName?: string;
  preferences?: {
    darkMode?: boolean;
    notificationsEnabled?: boolean;
    reminderTime?: string;
    reminderFrequency?: string;
    customReminderDays?: number[];
  };
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface IFcmTokenResponse {
  success: boolean;
  data: {
    fcmTokens: string[];
  };
}

export interface INotificationPayload {
  title?: string;
  body?: string;
  deepLink?: string;
  data?: {
    type?: string;
    reminderTime?: string;
    reminderFrequency?: string;
  };
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
  updateProfile: (payload: IUpdateProfilePayload) => Promise<void>;
  changePassword: (payload: IChangePasswordPayload) => Promise<void>;
}
