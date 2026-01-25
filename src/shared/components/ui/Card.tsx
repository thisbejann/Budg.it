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

const shouldUseFallback = () => {
  return Platform.OS === 'android' && Platform.Version < 31;
};

export function Card({ children, className, variant = 'glass', ...props }: CardProps) {
  const { isDark, glass } = useTheme();

  if (variant === 'solid') {
    return (
      <View
        className={`rounded-2xl border border-border bg-card p-4 shadow-sm ${className || ''}`}
        {...props}
      >
        {children}
      </View>
    );
  }

  // Glass variant
  const useFallback = shouldUseFallback();
  const containerStyle = {
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: glass.border,
  };

  if (useFallback) {
    return (
      <View
        className={`p-4 ${className || ''}`}
        style={[containerStyle, { backgroundColor: glass.card }]}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={containerStyle} {...props}>
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        className={`p-4 ${className || ''}`}
        style={{ flex: 1 }}
      >
        {children}
      </BlurView>
    </View>
  );
}

export function CardPressable({ children, className, variant = 'glass', ...props }: CardPressableProps) {
  const { isDark, glass } = useTheme();

  if (variant === 'solid') {
    return (
      <TouchableOpacity
        className={`rounded-2xl border border-border bg-card p-4 shadow-sm ${className || ''}`}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Glass variant
  const useFallback = shouldUseFallback();
  const containerStyle = {
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: glass.border,
  };

  if (useFallback) {
    return (
      <TouchableOpacity
        className={`p-4 ${className || ''}`}
        style={[containerStyle, { backgroundColor: glass.card }]}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={containerStyle}
      activeOpacity={0.7}
      {...props}
    >
      <BlurView
        intensity={isDark ? 40 : 60}
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

export function CardTitle({ children, className, ...props }: TextProps & { children: React.ReactNode }) {
  return (
    <Text
      className={`text-lg font-semibold leading-none tracking-tight text-card-foreground ${className || ''}`}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CardDescription({ children, className, ...props }: TextProps & { children: React.ReactNode }) {
  return (
    <Text className={`text-sm text-muted-foreground ${className || ''}`} {...props}>
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
