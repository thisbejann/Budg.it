import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';
import { useUniwind } from 'uniwind';
import { COLORS, COLORS_DARK } from '../constants/colors';

export type ColorScheme = 'light' | 'dark';

// Get current system color scheme - always reads fresh
function getSystemColorScheme(): 'light' | 'dark' {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

// Subscribe to system color scheme changes
function subscribeToSystemColorScheme(callback: () => void) {
  const subscription = Appearance.addChangeListener(callback);
  return () => subscription.remove();
}

export function useColorScheme(): ColorScheme {
  // Use Uniwind's hook for reactive theme state
  const { theme } = useUniwind();

  // Subscribe to system color scheme changes (always subscribed, but only used when theme === 'system')
  const systemColorScheme = useSyncExternalStore(
    subscribeToSystemColorScheme,
    getSystemColorScheme,
    getSystemColorScheme
  );

  // Return resolved color scheme based on theme mode
  if (theme === 'system') {
    return systemColorScheme;
  }

  return theme as ColorScheme;
}

export function useColors() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? COLORS_DARK : COLORS;
}

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colorScheme,
    isDark,
    colors: isDark ? COLORS_DARK : COLORS,
  };
}
