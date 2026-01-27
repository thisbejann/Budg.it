import React from 'react';
import { View, Text, ViewProps, TextProps, TouchableOpacity, TouchableOpacityProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../../hooks/useColorScheme';

type CardVariant = 'solid' | 'glass';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: CardVariant;
}

interface CardPressableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: CardVariant;
}

// Use BlurView only on iOS where it works well
const useBlur = Platform.OS === 'ios';

export function Card({ children, className, variant = 'glass', style, ...props }: CardProps) {
  const { isDark, colors } = useTheme();

  const containerStyle = {
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  };

  if (variant === 'solid' || !useBlur) {
    return (
      <View
        className={`p-4 ${className || ''}`}
        style={[containerStyle, style]}
        {...props}
      >
        {children}
      </View>
    );
  }

  // iOS: Use BlurView for real frosted glass effect
  return (
    <View style={[{ borderRadius: 16, overflow: 'hidden' }, style]} {...props}>
      <BlurView
        intensity={isDark ? 50 : 80}
        tint={isDark ? 'dark' : 'light'}
        className={`p-4 ${className || ''}`}
        style={{ flex: 1 }}
      >
        {children}
      </BlurView>
    </View>
  );
}

export function CardPressable({ children, className, variant = 'glass', style, ...props }: CardPressableProps) {
  const { isDark } = useTheme();

  const containerStyle = {
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  };

  if (variant === 'solid' || !useBlur) {
    return (
      <TouchableOpacity
        className={`p-4 ${className || ''}`}
        style={[containerStyle, style]}
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
      style={[{ borderRadius: 16, overflow: 'hidden' }, style]}
      activeOpacity={0.7}
      {...props}
    >
      <BlurView
        intensity={isDark ? 50 : 80}
        tint={isDark ? 'dark' : 'light'}
        className={`p-4 ${className || ''}`}
        style={{ flex: 1 }}
      >
        {children}
      </BlurView>
    </TouchableOpacity>
  );
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <View className={`flex-col space-y-1.5 pb-2 ${className || ''}`} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ children, className, style, ...props }: TextProps & { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text
      className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}
      style={[{ color: colors.foreground }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CardDescription({ children, className, style, ...props }: TextProps & { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text
      className={`text-sm ${className || ''}`}
      style={[{ color: colors.mutedForeground }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CardContent({ children, className, ...props }: CardProps) {
  return (
    <View className={`${className || ''}`} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ children, className, ...props }: CardProps) {
  return (
    <View className={`flex-row items-center pt-4 ${className || ''}`} {...props}>
      {children}
    </View>
  );
}
