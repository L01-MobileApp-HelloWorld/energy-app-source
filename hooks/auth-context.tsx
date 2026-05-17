import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { apiClient } from '@/services/api-client';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
  clearAuth,
  getAccessToken,
  getStoredFcmToken,
  getRefreshToken,
  getStoredUser,
  saveTokens,
  saveUser,
} from '@/services/auth-service';
import {
  handleInitialNotification,
  registerFcmToken,
  subscribeToFcmTokenRefresh,
  subscribeToNotificationOpens,
  unregisterFcmToken,
} from '@/services/notification-service';
import type {
  IAuthApiResponse,
  IChangePasswordPayload,
  IAuthContextValue,
  IAuthState,
  IStoredUser,
  IUpdateProfilePayload,
} from '@/typescript';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<IAuthContextValue | null>(null);

function requireAccessToken(payload: IAuthApiResponse): string {
  if (typeof payload.token !== 'string' || payload.token.length === 0) {
    throw new Error('Auth response is missing a valid access token');
  }

  return payload.token;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { themePreference, setThemePreference } = useAppTheme();
  const [state, setState] = useState<IAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const syncThemePreferenceFromUser = useCallback(
    async (user: IStoredUser) => {
      if (typeof user.preferences?.darkMode !== 'boolean') {
        return;
      }

      await setThemePreference(user.preferences.darkMode ? 'dark' : 'light');
    },
    [setThemePreference],
  );

  useEffect(() => {
    if (state.isLoading || state.isAuthenticated || state.user || themePreference === 'system') {
      return;
    }

    void setThemePreference('system');
  }, [setThemePreference, state.isAuthenticated, state.isLoading, state.user, themePreference]);

  // ── Restore session on app launch ──────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function restore() {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (mounted) setState({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        // Set token on api client
        apiClient.setAuthToken(token);

        // Try to get cached user first
        const cachedUser = await getStoredUser();

        // Verify token is still valid by fetching profile
        try {
          const res = await apiClient.get<{ success: boolean; data: { user: IStoredUser } }>(
            '/auth/profile',
          );
          const user = res.data.user;
          await saveUser(user);
          await syncThemePreferenceFromUser(user);
          if (mounted) setState({ user, isAuthenticated: true, isLoading: false });
        } catch {
          // Token might be expired — try refresh
          const refreshToken = await getRefreshToken();
          if (refreshToken) {
            try {
              const refreshRes = await apiClient.post<{
                success: boolean;
                data: { token: string; refreshToken: string };
              }>('/auth/refresh', { refreshToken });

              const newToken = refreshRes.data.token;
              const newRefreshToken = refreshRes.data.refreshToken;
              await saveTokens(newToken, newRefreshToken);
              apiClient.setAuthToken(newToken);

              // Fetch profile with new token
              const profileRes = await apiClient.get<{
                success: boolean;
                data: { user: IStoredUser };
              }>('/auth/profile');
              const user = profileRes.data.user;
              await saveUser(user);
              await syncThemePreferenceFromUser(user);
              if (mounted) setState({ user, isAuthenticated: true, isLoading: false });
            } catch {
              // Refresh also failed — clear session
              await clearAuth();
              apiClient.clearAuthToken();
              if (mounted) setState({ user: null, isAuthenticated: false, isLoading: false });
            }
          } else if (cachedUser) {
            // No refresh token but have cached user — use offline
            if (mounted) setState({ user: cachedUser, isAuthenticated: true, isLoading: false });
          } else {
            await clearAuth();
            apiClient.clearAuthToken();
            if (mounted) setState({ user: null, isAuthenticated: false, isLoading: false });
          }
        }
      } catch {
        if (mounted) setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    }

    restore();
    return () => {
      mounted = false;
    };
  }, [syncThemePreferenceFromUser]);

  useEffect(() => {
    if (!state.isAuthenticated) {
      return;
    }

    let active = true;

    void handleInitialNotification();

    const unsubscribeTokenRefresh = subscribeToFcmTokenRefresh();
    const unsubscribeNotificationOpens = subscribeToNotificationOpens();

    void (async () => {
      try {
        await registerFcmToken();
      } catch {
        if (!active) {
          return;
        }
      }
    })();

    return () => {
      active = false;
      unsubscribeTokenRefresh();
      unsubscribeNotificationOpens();
    };
  }, [state.isAuthenticated]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<{ success: boolean; data: IAuthApiResponse }>(
      '/auth/login',
      { email, password },
    );

    const { user, refreshToken } = res.data;
    const token = requireAccessToken(res.data);
    await saveTokens(token, refreshToken);
    await saveUser(user);
    await syncThemePreferenceFromUser(user);
    apiClient.setAuthToken(token);

    setState({ user, isAuthenticated: true, isLoading: false });
  }, [setThemePreference, syncThemePreferenceFromUser]);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    async (
      username: string,
      displayName: string | undefined,
      email: string,
      password: string,
    ) => {
      const res = await apiClient.post<{ success: boolean; data: IAuthApiResponse }>(
        '/auth/register',
        {
          username,
          email,
          password,
          ...(displayName ? { displayName } : {}),
        },
      );

      const { user, refreshToken } = res.data;
      const token = requireAccessToken(res.data);
      await saveTokens(token, refreshToken);
      await saveUser(user);
      await syncThemePreferenceFromUser(user);
      apiClient.setAuthToken(token);

      setState({ user, isAuthenticated: true, isLoading: false });
    },
    [setThemePreference, syncThemePreferenceFromUser],
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const fcmToken = await getStoredFcmToken();
      if (fcmToken) {
        await unregisterFcmToken(fcmToken);
      }

      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore API errors on logout — clear locally anyway
    }

    await clearAuth();
    await setThemePreference('system');
    apiClient.clearAuthToken();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, [setThemePreference]);

  // ── Refresh user profile ───────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { user: IStoredUser } }>(
        '/auth/profile',
      );
      const user = res.data.user;
      await saveUser(user);
      await syncThemePreferenceFromUser(user);
      setState((prev) => ({ ...prev, user }));
    } catch {
      // silently fail
    }
  }, [syncThemePreferenceFromUser]);

  const updateProfile = useCallback(async (payload: IUpdateProfilePayload) => {
    const normalizedPayload: IUpdateProfilePayload = {};
    const normalizedPreferences: NonNullable<IUpdateProfilePayload['preferences']> = {};

    if (typeof payload.displayName === 'string') {
      normalizedPayload.displayName = payload.displayName.trim();
    }

    if (typeof payload.preferences?.darkMode === 'boolean') {
      normalizedPreferences.darkMode = payload.preferences.darkMode;
    }

    if (typeof payload.preferences?.notificationsEnabled === 'boolean') {
      normalizedPreferences.notificationsEnabled = payload.preferences.notificationsEnabled;
    }

    if (typeof payload.preferences?.reminderTime === 'string') {
      normalizedPreferences.reminderTime = payload.preferences.reminderTime;
    }

    if (typeof payload.preferences?.reminderFrequency === 'string') {
      normalizedPreferences.reminderFrequency = payload.preferences.reminderFrequency;
    }

    if (Array.isArray(payload.preferences?.customReminderDays)) {
      normalizedPreferences.customReminderDays = payload.preferences.customReminderDays;
    }

    if (Object.keys(normalizedPreferences).length > 0) {
      normalizedPayload.preferences = normalizedPreferences;
    }

    if (typeof normalizedPayload.preferences?.darkMode === 'boolean') {
      setState((prev) => {
        if (!prev.user) {
          return prev;
        }

        const nextUser: IStoredUser = {
          ...prev.user,
          preferences: {
            ...prev.user.preferences,
            ...normalizedPayload.preferences,
          },
        };

        void saveUser(nextUser);
        return { ...prev, user: nextUser };
      });
    }

    const res = await apiClient.put<{ success: boolean; data: { user: IStoredUser } }>(
      '/auth/profile',
      normalizedPayload,
    );
    const user = res.data.user;
    await saveUser(user);
    await syncThemePreferenceFromUser(user);
    setState((prev) => ({ ...prev, user }));
  }, [syncThemePreferenceFromUser]);

  const changePassword = useCallback(async (payload: IChangePasswordPayload) => {
    await apiClient.put<{ success: boolean; message?: string }>(
      '/auth/change-password',
      {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      },
    );
  }, []);

  const value: IAuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): IAuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
