import React from 'react';
import {
  View,
  ViewProps,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { Card as HeroCard } from 'heroui-native';
import { useTheme } from '../../../hooks/useColorScheme';

type CardVariant = 'default' | 'glass' | 'elevated';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: CardVariant;
}

interface CardPressableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: CardVariant;
}

export function Card({
  children,
  className,
  style,
  variant = 'default',
  ...props
}: CardProps) {
  const { colors, isDark } = useTheme();

  if (variant === 'glass' && isDark) {
    return (
      <View
        className={`overflow-hidden p-4 ${className || ''}`}
        style={[
          {
            borderRadius: 20,
            backgroundColor: 'rgba(20, 20, 28, 0.6)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
          },
          style,
        ]}
        {...props}
      >
        {/* Top inner highlight */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 20,
            right: 20,
            height: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          }}
        />
        {children}
      </View>
    );
  }

  const cardStyle = {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? colors.border : colors.outlineVariant,
    ...(variant === 'elevated'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.4 : 0.1,
          shadowRadius: 12,
          elevation: 6,
        }
      : {}),
  };

  return (
    <HeroCard
      className={`p-4 ${className || ''}`}
      style={[cardStyle, style]}
      {...props}
    >
      {isDark && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 20,
            right: 20,
            height: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        />
      )}
      {children}
    </HeroCard>
  );
}

export function CardPressable({
  children,
  className,
  style,
  onPress,
  variant = 'default',
  ...props
}: CardPressableProps) {
  const { colors, isDark } = useTheme();

  const containerStyle = {
    borderRadius: 20,
    backgroundColor: variant === 'glass' && isDark ? 'rgba(20, 20, 28, 0.6)' : colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDark ? 0.35 : 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: variant === 'glass' && isDark ? 'rgba(255, 255, 255, 0.08)' : isDark ? colors.border : colors.outlineVariant,
  };

  return (
    <TouchableOpacity
      className={`p-4 ${className || ''}`}
      style={[containerStyle, style]}
      activeOpacity={0.7}
      onPress={onPress}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

export function CardHeader({ children, className, ...props }: Omit<CardProps, 'variant'>) {
  return (
    <HeroCard.Header className={className} {...props}>
      {children}
    </HeroCard.Header>
  );
}

export function CardTitle({
  children,
  className,
  style,
  ...props
}: TextProps & { children: React.ReactNode }) {
  return (
    <HeroCard.Title className={className} style={style} {...props}>
      {children}
    </HeroCard.Title>
  );
}

export function CardDescription({
  children,
  className,
  style,
  ...props
}: TextProps & { children: React.ReactNode }) {
  return (
    <HeroCard.Description className={className} style={style} {...props}>
      {children}
    </HeroCard.Description>
  );
}

export function CardContent({ children, className, ...props }: Omit<CardProps, 'variant'>) {
  return (
    <HeroCard.Body className={className} {...props}>
      {children}
    </HeroCard.Body>
  );
}

export function CardFooter({ children, className, ...props }: Omit<CardProps, 'variant'>) {
  return (
    <HeroCard.Footer className={`flex-row items-center ${className || ''}`} {...props}>
      {children}
    </HeroCard.Footer>
  );
}
