import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { apiClient } from '@/services/api-client';
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  saveTokens,
  saveUser,
} from '@/services/auth-service';
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
  const [state, setState] = useState<IAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

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
            '/api/auth/profile',
          );
          const user = res.data.user;
          await saveUser(user);
          if (mounted) setState({ user, isAuthenticated: true, isLoading: false });
        } catch {
          // Token might be expired — try refresh
          const refreshToken = await getRefreshToken();
          if (refreshToken) {
            try {
              const refreshRes = await apiClient.post<{
                success: boolean;
                data: { token: string; refreshToken: string };
              }>('/api/auth/refresh', { refreshToken });

              const newToken = refreshRes.data.token;
              const newRefreshToken = refreshRes.data.refreshToken;
              await saveTokens(newToken, newRefreshToken);
              apiClient.setAuthToken(newToken);

              // Fetch profile with new token
              const profileRes = await apiClient.get<{
                success: boolean;
                data: { user: IStoredUser };
              }>('/api/auth/profile');
              const user = profileRes.data.user;
              await saveUser(user);
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
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<{ success: boolean; data: IAuthApiResponse }>(
      '/api/auth/login',
      { email, password },
    );

    const { user, refreshToken } = res.data;
    const token = requireAccessToken(res.data);
    await saveTokens(token, refreshToken);
    await saveUser(user);
    apiClient.setAuthToken(token);

    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    async (
      username: string,
      displayName: string | undefined,
      email: string,
      password: string,
    ) => {
      const res = await apiClient.post<{ success: boolean; data: IAuthApiResponse }>(
        '/api/auth/register',
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
      apiClient.setAuthToken(token);

      setState({ user, isAuthenticated: true, isLoading: false });
    },
    [],
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/api/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore API errors on logout — clear locally anyway
    }

    await clearAuth();
    apiClient.clearAuthToken();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  // ── Refresh user profile ───────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { user: IStoredUser } }>(
        '/api/auth/profile',
      );
      const user = res.data.user;
      await saveUser(user);
      setState((prev) => ({ ...prev, user }));
    } catch {
      // silently fail
    }
  }, []);

  const updateProfile = useCallback(async (payload: IUpdateProfilePayload) => {
    const normalizedPayload = {
      username: payload.username.trim(),
      ...(payload.displayName?.trim()
        ? { displayName: payload.displayName.trim() }
        : { displayName: '' }),
    };

    const res = await apiClient.patch<{ success: boolean; data: { user: IStoredUser } }>(
      '/api/auth/profile',
      normalizedPayload,
    );
    const user = res.data.user;
    await saveUser(user);
    setState((prev) => ({ ...prev, user }));
  }, []);

  const changePassword = useCallback(async (payload: IChangePasswordPayload) => {
    await apiClient.patch<{ success: boolean; message?: string }>(
      '/api/auth/change-password',
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
