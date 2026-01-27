import { useColorScheme as useRNColorScheme } from 'react-native';
import { COLORS, COLORS_DARK, GLASS } from '../constants/colors';
import { useThemeStore } from '../store';

export type ColorScheme = 'light' | 'dark';

export function useColorScheme(): ColorScheme {
  const systemColorScheme = useRNColorScheme();
  const themeMode = useThemeStore((state) => state.themeMode);

  if (themeMode === 'system') {
    // systemColorScheme can be 'light', 'dark', 'unspecified', or undefined
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  }
  return themeMode;
}

export function useColors() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? COLORS_DARK : COLORS;
}

export function useGlassColors() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? GLASS.dark : GLASS.light;
}

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colorScheme,
    isDark,
    colors: isDark ? COLORS_DARK : COLORS,
    glass: isDark ? GLASS.dark : GLASS.light,
  };
}
