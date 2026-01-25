import React from 'react';
import { View, ScrollView, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import { COLORS } from '../../../constants/colors';

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
  const Container = safeArea ? SafeAreaView : View;

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
    <Container className={`flex-1 bg-background ${className || ''}`}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      {content}
    </Container>
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
