import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';
import { useTheme } from '../../../hooks/useColorScheme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      {icon && <View className="mb-4">{icon}</View>}
      <Text
        className="text-center text-lg font-semibold"
        style={{ color: colors.foreground }}
      >
        {title}
      </Text>
      {description && (
        <Text
          className="mt-2 text-center text-sm"
          style={{ color: colors.mutedForeground }}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <View className="mt-4 w-full">
          <Button onPress={onAction}>{actionLabel}</Button>
        </View>
      )}
    </View>
  );
}
