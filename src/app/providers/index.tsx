import React, { useEffect, useState } from 'react';
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
  const [hydrated, setHydrated] = useState(useThemeStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useThemeStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  // Sync theme mode with Uniwind
  useEffect(() => {
    if (!hydrated) return;

    // Pass themeMode directly to Uniwind - it handles 'system' mode internally
    // When 'system' is passed, Uniwind enables adaptive theming automatically
    Uniwind.setTheme(themeMode);
  }, [themeMode, hydrated]);

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
