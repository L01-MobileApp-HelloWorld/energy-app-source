import { render } from '@testing-library/react-native';
import React from 'react';

import { ThemePreferencesProvider } from '@/hooks/use-app-theme';

export function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemePreferencesProvider>{ui}</ThemePreferencesProvider>);
}
