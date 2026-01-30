import React, { useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { HeroUINativeProvider } from 'heroui-native';
import { Uniwind } from 'uniwind';
import { DatabaseProvider } from './DatabaseProvider';
import { useThemeStore } from '../../store';

interface AppProvidersProps {
  children: React.ReactNode;
}

function ThemeSyncer({ children }: { children: React.ReactNode }) {
  const themeMode = useThemeStore((state) => state.themeMode);
  const systemColorScheme = useRNColorScheme();

  useEffect(() => {
    let effectiveTheme: 'light' | 'dark';

    if (themeMode === 'system') {
      effectiveTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
    } else {
      effectiveTheme = themeMode;
    }

    Uniwind.setTheme(effectiveTheme);
  }, [themeMode, systemColorScheme]);

  return <>{children}</>;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeroUINativeProvider>
          <ThemeSyncer>
            <NavigationContainer>
              <DatabaseProvider>{children}</DatabaseProvider>
            </NavigationContainer>
          </ThemeSyncer>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export { DatabaseProvider, useDatabase } from './DatabaseProvider';
