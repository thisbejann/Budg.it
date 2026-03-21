import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useColorScheme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { colors, isDark } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? colors.surfaceContainer : colors.muted,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonListItem() {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Skeleton width={40} height={40} borderRadius={20} />
      <View className="flex-1 gap-2">
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={10} />
      </View>
      <Skeleton width={64} height={14} />
    </View>
  );
}

export function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <View className="mb-4 rounded-xl p-4" style={{ height }}>
      <Skeleton width="40%" height={14} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={height - 50} borderRadius={8} />
    </View>
  );
}

export function AccountsScreenSkeleton() {
  return (
    <View className="flex-1">
      {/* Section header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-row items-center gap-2">
          <Skeleton width={3} height={16} borderRadius={2} />
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width={80} height={14} />
        </View>
        <Skeleton width={64} height={14} />
      </View>
      {[1, 2, 3].map((i) => (
        <SkeletonListItem key={i} />
      ))}
      {/* Second section */}
      <View className="mt-2 flex-row items-center justify-between px-4 py-2">
        <View className="flex-row items-center gap-2">
          <Skeleton width={3} height={16} borderRadius={2} />
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width={80} height={14} />
        </View>
        <Skeleton width={64} height={14} />
      </View>
      {[1, 2].map((i) => (
        <SkeletonListItem key={i} />
      ))}
    </View>
  );
}

export function TransactionsScreenSkeleton() {
  return (
    <View className="flex-1">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonListItem key={i} />
      ))}
    </View>
  );
}

export function ChartsScreenSkeleton() {
  return (
    <View className="flex-1 px-4 py-4">
      {/* Period pills */}
      <View className="mb-4 flex-row gap-2">
        <Skeleton width={80} height={36} borderRadius={20} />
        <Skeleton width={80} height={36} borderRadius={20} />
        <Skeleton width={80} height={36} borderRadius={20} />
      </View>
      {/* Summary cards */}
      <View className="mb-4 flex-row gap-3">
        <View className="flex-1">
          <Skeleton height={60} borderRadius={12} />
        </View>
        <View className="flex-1">
          <Skeleton height={60} borderRadius={12} />
        </View>
      </View>
      {/* Pie chart area */}
      <Skeleton height={280} borderRadius={12} style={{ marginBottom: 16 }} />
      {/* Bar chart area */}
      <Skeleton height={280} borderRadius={12} />
    </View>
  );
}
