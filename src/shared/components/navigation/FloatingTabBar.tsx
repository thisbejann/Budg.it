import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, type LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
  Settings,
  Plus,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../../hooks/useColorScheme';
import { QuickTemplateSheet } from './QuickTemplateSheet';

const TAB_BAR_HEIGHT = 60;
const TAB_BAR_MARGIN_BOTTOM = 24;
const TAB_BAR_MARGIN_LEFT = 16;
const TAB_BAR_GAP = 10;
const ACTION_BUTTON_SIZE = 60;
const ACTION_BUTTON_MARGIN_RIGHT = 16;
const GRADIENT_HEIGHT = 100;``
const PILL_PADDING_H = 6;

export const FLOATING_TAB_BAR_TOTAL_HEIGHT = TAB_BAR_HEIGHT + TAB_BAR_MARGIN_BOTTOM + 16;

const TAB_ICONS = [Home, Receipt, Wallet, Settings];
const TAB_LABELS = ['Home', 'Transactions', 'Accounts', 'Settings'];
const TAB_SHORT_LABELS = ['Home', 'Txns', 'Accounts', 'Settings'];

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

const TabItem = React.memo(function TabItem({
  isFocused,
  onPress,
  onLongPress,
  Icon,
  label,
  shortLabel,
  colors,
}: {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  Icon: typeof Home;
  label: string;
  shortLabel: string;
  colors: ReturnType<typeof useTheme>['colors'];
  isDark: boolean;
}) {
  const scale = useSharedValue(isFocused ? 1.08 : 1);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.08 : 1, SPRING_CONFIG);
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={onLongPress}
      activeOpacity={1}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={{ alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6 }}>
        <Animated.View style={iconStyle}>
          <Icon
            size={20}
            color={isFocused ? colors.primary : colors.mutedForeground}
            strokeWidth={isFocused ? 2.2 : 1.8}
          />
        </Animated.View>
        <Text
          style={{
            fontSize: 10,
            marginTop: 2,
            fontWeight: isFocused ? '600' : '400',
            color: isFocused ? colors.primary : colors.mutedForeground,
          }}
          numberOfLines={1}
        >
          {shortLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const rootNavigation = useNavigation();

  const bottomOffset = Math.max(insets.bottom, TAB_BAR_MARGIN_BOTTOM);

  // Measure actual container width for accurate indicator positioning
  const [containerWidth, setContainerWidth] = useState(0);
  const tabCount = state.routes.length;
  const innerWidth = containerWidth > 0 ? containerWidth - PILL_PADDING_H * 2 : 0;
  const tabWidth = innerWidth > 0 ? innerWidth / tabCount : 0;

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const indicatorX = useSharedValue(state.index * tabWidth);

  React.useEffect(() => {
    if (tabWidth > 0) {
      indicatorX.value = withSpring(state.index * tabWidth, SPRING_CONFIG);
    }
  }, [state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const [templateSheetVisible, setTemplateSheetVisible] = useState(false);

  const handleAddTransaction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    rootNavigation.navigate('AddTransaction');
  };

  const handleLongPressAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTemplateSheetVisible(true);
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}
      pointerEvents="box-none"
    >
      {/* Background gradient fade */}
      <LinearGradient
        colors={isDark
          ? ['transparent', 'rgba(10, 10, 15, 0.6)', 'rgba(10, 10, 15, 0.95)']
          : ['transparent', 'rgba(250, 250, 248, 0.6)', 'rgba(250, 250, 248, 0.95)']
        }
        locations={[0, 0.45, 1]}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: GRADIENT_HEIGHT + bottomOffset + TAB_BAR_HEIGHT,
        }}
        pointerEvents="none"
      />

      {/* Tab bar row */}
      <View
        style={{
          marginBottom: bottomOffset,
          marginLeft: TAB_BAR_MARGIN_LEFT,
          marginRight: ACTION_BUTTON_MARGIN_RIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          gap: TAB_BAR_GAP,
        }}
      >
        {/* Tab Bar Pill */}
        <View
          style={{
            flex: 1,
            height: TAB_BAR_HEIGHT,
            borderRadius: 32,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.borderSubtle,
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

          {/* Solid fallback */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isDark ? 'rgba(20, 20, 28, 0.95)' : 'rgba(250, 250, 248, 0.95)',
            }}
          />

          {/* Tab items with sliding indicator */}
          <View
            onLayout={onContainerLayout}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: PILL_PADDING_H,
            }}
          >
            {/* Sliding active indicator */}
            {tabWidth > 0 && (
            <Animated.View
              style={[
                indicatorStyle,
                {
                  position: 'absolute',
                  left: PILL_PADDING_H,
                  width: tabWidth,
                  top: 4,
                  bottom: 4,
                  borderRadius: 30,
                  backgroundColor: colors.primaryMuted,
                },
              ]}
            />
            )}

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
                  label={TAB_LABELS[index] || route.name}
                  shortLabel={TAB_SHORT_LABELS[index] || route.name}
                  colors={colors}
                  isDark={isDark}
                />
              );
            })}
          </View>
        </View>

        {/* Add Transaction Action Button */}
        <TouchableOpacity
          onPress={handleAddTransaction}
          onLongPress={handleLongPressAdd}
          activeOpacity={0.8}
          accessibilityLabel="Add Transaction"
          accessibilityRole="button"
          style={{
            width: ACTION_BUTTON_SIZE,
            height: ACTION_BUTTON_SIZE,
            borderRadius: ACTION_BUTTON_SIZE / 2,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.borderSubtle,
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

          {/* Solid fallback */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isDark ? 'rgba(20, 20, 28, 0.95)' : 'rgba(250, 250, 248, 0.95)',
            }}
          />

          {/* Icon */}
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus
              size={24}
              color={colors.primary}
              strokeWidth={2.5}
            />
          </View>
        </TouchableOpacity>
      </View>

      <QuickTemplateSheet
        visible={templateSheetVisible}
        onClose={() => setTemplateSheetVisible(false)}
        onCreated={() => {}}
      />
    </View>
  );
}
