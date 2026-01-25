import React from 'react';
import { View, ViewProps, TouchableOpacity, TouchableOpacityProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../../hooks/useColorScheme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  noPadding?: boolean;
}

interface GlassCardPressableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  intensity?: number;
  noPadding?: boolean;
}

// Check if device should use fallback (low-end device detection)
const shouldUseFallback = () => {
  // On Android, BlurView can be expensive on lower-end devices
  // For now, always use blur but can be extended with device checks
  return Platform.OS === 'android' && Platform.Version < 31;
};

export function GlassCard({
  children,
  className,
  intensity,
  noPadding = false,
  style,
  ...props
}: GlassCardProps) {
  const { isDark, glass } = useTheme();
  const blurIntensity = intensity ?? (isDark ? 40 : 60);
  const useFallback = shouldUseFallback();

  const containerStyle = {
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: glass.border,
  };

  const padding = noPadding ? '' : 'p-4';

  if (useFallback) {
    return (
      <View
        className={`${padding} ${className || ''}`}
        style={[
          containerStyle,
          { backgroundColor: glass.card },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]} {...props}>
      <BlurView
        intensity={blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        className={`${padding} ${className || ''}`}
        style={{ flex: 1 }}
      >
        {children}
      </BlurView>
    </View>
  );
}

export function GlassCardPressable({
  children,
  className,
  intensity,
  noPadding = false,
  style,
  ...props
}: GlassCardPressableProps) {
  const { isDark, glass } = useTheme();
  const blurIntensity = intensity ?? (isDark ? 40 : 60);
  const useFallback = shouldUseFallback();

  const containerStyle = {
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: glass.border,
  };

  const padding = noPadding ? '' : 'p-4';

  if (useFallback) {
    return (
      <TouchableOpacity
        className={`${padding} ${className || ''}`}
        style={[
          containerStyle,
          { backgroundColor: glass.card },
          style,
        ]}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      activeOpacity={0.7}
      {...props}
    >
      <BlurView
        intensity={blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        className={`${padding} ${className || ''}`}
        style={{ flex: 1 }}
      >
        {children}
      </BlurView>
    </TouchableOpacity>
  );
}
