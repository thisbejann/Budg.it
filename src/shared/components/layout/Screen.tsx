import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useColorScheme';
import { FLOATING_TAB_BAR_TOTAL_HEIGHT } from '../navigation/FloatingTabBar';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  className?: string;
  contentClassName?: string;
  /** Set to false to disable bottom padding for floating tab bar (e.g. in modal screens) */
  hasTabBar?: boolean;
}

export function Screen({
  children,
  scrollable = true,
  safeArea = true,
  refreshing = false,
  onRefresh,
  className,
  contentClassName,
  hasTabBar = false,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const content = scrollable ? (
    <ScrollView
      className={`flex-1 ${contentClassName || ''}`}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: hasTabBar ? FLOATING_TAB_BAR_TOTAL_HEIGHT : 0,
      }}
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
    <View
      className={`flex-1 ${className || ''}`}
      style={{
        backgroundColor: colors.background,
        paddingTop: safeArea ? insets.top : 0,
        paddingLeft: safeArea ? insets.left : 0,
        paddingRight: safeArea ? insets.right : 0,
      }}
    >
      {content}
    </View>
  );
}

export function FixedScreen({ children, className }: Pick<ScreenProps, 'children' | 'className'>) {
  return (
    <Screen scrollable={false} className={className}>
      {children}
    </Screen>
  );
}
