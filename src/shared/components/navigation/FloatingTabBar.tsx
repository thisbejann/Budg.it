import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
} from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../../hooks/useColorScheme';

const TAB_BAR_HEIGHT = 56;
const TAB_BAR_MARGIN_BOTTOM = 24;
const TAB_BAR_MARGIN_HORIZONTAL = 48;

export const FLOATING_TAB_BAR_TOTAL_HEIGHT = TAB_BAR_HEIGHT + TAB_BAR_MARGIN_BOTTOM + 16;

const TAB_ICONS = [Home, Receipt, Wallet, BarChart3, Settings];

function TabItem({
  isFocused,
  onPress,
  onLongPress,
  Icon,
  colors,
  isDark,
}: {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  Icon: typeof Home;
  colors: ReturnType<typeof useTheme>['colors'];
  isDark: boolean;
}) {
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    bgOpacity.value = withSpring(isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 300,
    });
  }, [isFocused]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
    transform: [{ scale: 0.8 + bgOpacity.value * 0.2 }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
    transform: [{ scale: bgOpacity.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 12, stiffness: 500 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 500 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={onLongPress}
      activeOpacity={1}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={[containerStyle, { alignItems: 'center' }]}>
        <View style={{ width: 40, height: 32, alignItems: 'center', justifyContent: 'center' }}>
          {/* Active background indicator */}
          <Animated.View
            style={[
              indicatorStyle,
              {
                position: 'absolute',
                width: 40,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark ? 'rgba(212, 165, 116, 0.2)' : 'rgba(156, 112, 64, 0.15)',
              },
            ]}
          />
          <Icon
            size={22}
            color={isFocused ? colors.primary : colors.mutedForeground}
            strokeWidth={isFocused ? 2.2 : 1.8}
          />
        </View>
        {/* Active dot indicator */}
        <Animated.View
          style={[
            dotStyle,
            {
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.primary,
              marginTop: 3,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const bottomOffset = Math.max(insets.bottom, TAB_BAR_MARGIN_BOTTOM);

  return (
    <View
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: TAB_BAR_MARGIN_HORIZONTAL,
        right: TAB_BAR_MARGIN_HORIZONTAL,
        height: TAB_BAR_HEIGHT,
        borderRadius: TAB_BAR_HEIGHT / 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.5 : 0.15,
        shadowRadius: 16,
        elevation: 12,
      }}
    >
      {/* Blur background */}
      <BlurView
        intensity={isDark ? 60 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Fallback background color (for Android < 12 or when blur isn't available) */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDark ? 'rgba(20, 20, 28, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        }}
      />

      {/* Tab items */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const Icon = TAB_ICONS[index];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              Icon={Icon}
              colors={colors}
              isDark={isDark}
            />
          );
        })}
      </View>
    </View>
  );
}
