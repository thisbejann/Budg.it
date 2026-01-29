import React from 'react';
import {
  View,
  Text,
  ViewProps,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../../hooks/useColorScheme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

interface CardPressableProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export function Card({
  children,
  className,
  style,
  ...props
}: CardProps) {
  const { colors, isDark } = useTheme();

  const containerStyle = {
    borderRadius: 16,
    backgroundColor: colors.card,
    // Enhanced MD3 Elevation 2
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.12,
    shadowRadius: 6,
    elevation: 3,
    // Subtle border for better definition in dark mode
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? colors.border : 'transparent',
  };

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

export function CardPressable({
  children,
  className,
  style,
  ...props
}: CardPressableProps) {
  const { colors, isDark } = useTheme();

  const containerStyle = {
    borderRadius: 16,
    backgroundColor: colors.card,
    // Enhanced MD3 Elevation 2
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.12,
    shadowRadius: 6,
    elevation: 3,
    // Subtle border for better definition in dark mode
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? colors.border : 'transparent',
  };

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

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <View className={`flex-col space-y-1.5 pb-2 ${className || ''}`} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({
  children,
  className,
  style,
  ...props
}: TextProps & { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text
      className={`text-lg font-semibold leading-none tracking-tight ${
        className || ''
      }`}
      style={[{ color: colors.foreground }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CardDescription({
  children,
  className,
  style,
  ...props
}: TextProps & { children: React.ReactNode }) {
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
    <View
      className={`flex-row items-center pt-4 ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
