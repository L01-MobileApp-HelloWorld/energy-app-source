import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { AppColorsType, AppTheme, getAppColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemePreference = 'light' | 'dark' | 'system';

type AppThemeContextValue = {
  themePreference: ThemePreference;
  resolvedTheme: AppTheme;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  isHydrated: boolean;
};

const THEME_PREFERENCE_KEY = 'app-theme-preference';
const memoryStorage = new Map<string, string>();

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

function getBrowserStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  return null;
}

async function readStoredPreference(key: string) {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    const browserStorage = getBrowserStorage();
    if (browserStorage) {
      return browserStorage.getItem(key);
    }

    return memoryStorage.get(key) ?? null;
  }
}

async function writeStoredPreference(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
    return;
  } catch {
    const browserStorage = getBrowserStorage();
    if (browserStorage) {
      browserStorage.setItem(key, value);
      return;
    }

    memoryStorage.set(key, value);
  }
}

export async function persistThemePreference(preference: ThemePreference) {
  await writeStoredPreference(THEME_PREFERENCE_KEY, preference);
}

function resolveTheme(
  preference: ThemePreference,
  systemTheme: ReturnType<typeof useColorScheme>
): AppTheme {
  if (preference === 'system') {
    return systemTheme === 'dark' ? 'dark' : 'light';
  }

  return preference;
}

export function ThemePreferencesProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [isHydrated, setIsHydrated] = useState(false);
  const themePreferenceRef = useRef<ThemePreference>('system');

  useEffect(() => {
    themePreferenceRef.current = themePreference;
  }, [themePreference]);

  useEffect(() => {
    let isMounted = true;

    async function hydratePreference() {
      try {
        const storedPreference = await readStoredPreference(THEME_PREFERENCE_KEY);
        if (
          isMounted &&
          (storedPreference === 'light' ||
            storedPreference === 'dark' ||
            storedPreference === 'system')
        ) {
          setThemePreferenceState(storedPreference);
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    hydratePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const setThemePreference = useCallback(async (preference: ThemePreference) => {
    if (themePreferenceRef.current === preference) {
      return;
    }

    themePreferenceRef.current = preference;
    setThemePreferenceState(preference);
    await persistThemePreference(preference);
  }, []);

  const resolvedTheme = resolveTheme(themePreference, systemTheme);

  const value: AppThemeContextValue = useMemo(() => ({
    themePreference,
    resolvedTheme,
    setThemePreference,
    isHydrated,
  }), [isHydrated, resolvedTheme, setThemePreference, themePreference]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(AppThemeContext);

  if (!value) {
    throw new Error('useAppTheme must be used within ThemePreferencesProvider');
  }

  return value;
}

export function useAppColors(): AppColorsType {
  const { resolvedTheme } = useAppTheme();
  return getAppColors(resolvedTheme);
}

export { THEME_PREFERENCE_KEY };
