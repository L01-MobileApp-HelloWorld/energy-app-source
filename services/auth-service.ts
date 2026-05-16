import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { IStoredUser } from '@/typescript';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_DATA_KEY = 'auth_user_data';

// Fallback for web (SecureStore is native-only)
const memoryStore = new Map<string, string>();

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {
      memoryStore.set(key, value);
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore.get(key) ?? null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {
      memoryStore.delete(key);
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

// ─── Public API ───────────────────────────────────────────────────────────────


export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    setItem(ACCESS_TOKEN_KEY, accessToken),
    setItem(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function saveUser(user: IStoredUser): Promise<void> {
  await setItem(USER_DATA_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<IStoredUser | null> {
  const data = await getItem(USER_DATA_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as IStoredUser;
  } catch {
    return null;
  }
}

export async function clearAuth(): Promise<void> {
  await Promise.all([
    deleteItem(ACCESS_TOKEN_KEY),
    deleteItem(REFRESH_TOKEN_KEY),
    deleteItem(USER_DATA_KEY),
  ]);
}
