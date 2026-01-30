import React from 'react';
import {
  View,
  Text,
  ViewProps,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { Card as HeroCard, Surface } from 'heroui-native';
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
  return (
    <HeroCard
      className={`p-4 border border-divider ${className || ''}`}
      style={style}
      {...props}
    >
      <HeroCard.Body>
        {children}
      </HeroCard.Body>
    </HeroCard>
  );
}

export function CardPressable({
  children,
  className,
  style,
  onPress,
  ...props
}: CardPressableProps) {
  const { colors, isDark } = useTheme();

  const containerStyle = {
    borderRadius: 16,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.12,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: isDark ? colors.border : colors.outlineVariant,
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

export function CardHeader({ children, className, ...props }: CardProps) {
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

export function CardContent({ children, className, ...props }: CardProps) {
  return (
    <HeroCard.Body className={className} {...props}>
      {children}
    </HeroCard.Body>
  );
}

export function CardFooter({ children, className, ...props }: CardProps) {
  return (
    <HeroCard.Footer className={`flex-row items-center ${className || ''}`} {...props}>
      {children}
    </HeroCard.Footer>
  );
}
