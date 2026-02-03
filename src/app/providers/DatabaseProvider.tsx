import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, useColorScheme } from 'react-native';
import { openDatabase } from '../../database';
import { useLedgerStore } from '../../store';
import { COLORS, COLORS_DARK } from '../../constants/colors';

interface DatabaseContextType {
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({ isReady: false });

export function useDatabase() {
  return useContext(DatabaseContext);
}

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { initialize } = useLedgerStore();
  const systemColorScheme = useColorScheme();
  const colors = systemColorScheme === 'dark' ? COLORS_DARK : COLORS;

  useEffect(() => {
    async function initDatabase() {
      try {
        // Open database and run migrations
        await openDatabase();

        // Initialize ledger store (creates default ledger if needed)
        await initialize();

        setIsReady(true);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
      }
    }

    initDatabase();
  }, [initialize]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-lg font-semibold text-destructive">Database Error</Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-sm text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}
