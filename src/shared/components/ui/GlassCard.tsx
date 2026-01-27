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

// Use BlurView only on iOS where it works well
const useBlur = Platform.OS === 'ios';

export function GlassCard({
  children,
  className,
  intensity,
  noPadding = false,
  style,
  ...props
}: GlassCardProps) {
  const { isDark } = useTheme();
  const blurIntensity = intensity ?? (isDark ? 50 : 80);

  const containerStyle = {
    borderRadius: 20,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  };

  const glassBackground = isDark
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(255, 255, 255, 0.7)';

  const padding = noPadding ? '' : 'p-4';

  if (!useBlur) {
    // Android: Use semi-transparent background (no blur)
    return (
      <View
        className={`${padding} ${className || ''}`}
        style={[
          containerStyle,
          { backgroundColor: glassBackground },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  // iOS: Use BlurView for real frosted glass effect
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
  const { isDark } = useTheme();
  const blurIntensity = intensity ?? (isDark ? 50 : 80);

  const containerStyle = {
    borderRadius: 20,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  };

  const glassBackground = isDark
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(255, 255, 255, 0.7)';

  const padding = noPadding ? '' : 'p-4';

  if (!useBlur) {
    // Android: Use semi-transparent background (no blur)
    return (
      <TouchableOpacity
        className={`${padding} ${className || ''}`}
        style={[
          containerStyle,
          { backgroundColor: glassBackground },
          style,
        ]}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // iOS: Use BlurView for real frosted glass effect
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
