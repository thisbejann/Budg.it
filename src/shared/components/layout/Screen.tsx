import React from 'react';
import { View, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useColorScheme';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  className?: string;
  contentClassName?: string;
}

export function Screen({
  children,
  scrollable = true,
  safeArea = true,
  refreshing = false,
  onRefresh,
  className,
  contentClassName,
}: ScreenProps) {
  const { isDark, colors } = useTheme();

  const content = scrollable ? (
    <ScrollView
      className={`flex-1 ${contentClassName || ''}`}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${contentClassName || ''}`}>{children}</View>
  );

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {safeArea ? (
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.background }}
          edges={['top', 'left', 'right']}
          className={className}
        >
          {content}
        </SafeAreaView>
      ) : (
        <View className={`flex-1 bg-background ${className || ''}`}>
          {content}
        </View>
      )}
    </>
  );
}

// Non-scrollable screen variant
export function FixedScreen({ children, className }: Pick<ScreenProps, 'children' | 'className'>) {
  return (
    <Screen scrollable={false} className={className}>
      {children}
    </Screen>
  );
}
