import { render } from '@testing-library/react-native';
import React from 'react';

import { ThemePreferencesProvider } from '@/hooks/use-app-theme';

type RenderWithThemeOptions = {
  hydrateOnMountInTest?: boolean;
};

export function renderWithTheme(
  ui: React.ReactElement,
  options?: RenderWithThemeOptions
) {
  return render(
    <ThemePreferencesProvider
      hydrateOnMountInTest={options?.hydrateOnMountInTest}
    >
      {ui}
    </ThemePreferencesProvider>
  );
}
