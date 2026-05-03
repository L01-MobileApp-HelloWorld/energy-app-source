import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

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

  const setThemePreference = async (preference: ThemePreference) => {
    setThemePreferenceState(preference);
    await writeStoredPreference(THEME_PREFERENCE_KEY, preference);
  };

  const value: AppThemeContextValue = {
    themePreference,
    resolvedTheme: resolveTheme(themePreference, systemTheme),
    setThemePreference,
    isHydrated,
  };

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
