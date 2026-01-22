import React from 'react';
import { View, Text, ViewProps, TextProps, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

interface CardPressableProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`rounded-xl border border-border bg-card p-4 shadow-sm ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardPressable({ children, className, ...props }: CardPressableProps) {
  return (
    <TouchableOpacity
      className={`rounded-xl border border-border bg-card p-4 shadow-sm ${className || ''}`}
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
