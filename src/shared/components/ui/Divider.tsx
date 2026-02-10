import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../hooks/useColorScheme';

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  const { isDark } = useTheme();

  if (label) {
    return (
      <View className={`flex-row items-center my-4 ${className || ''}`}>
        <View className="flex-1 h-px bg-border" style={isDark ? { opacity: 0.3 } : undefined} />
        <Text className="mx-3 text-sm text-muted-foreground">{label}</Text>
        <View className="flex-1 h-px bg-border" style={isDark ? { opacity: 0.3 } : undefined} />
      </View>
    );
  }

  return (
    <View
      className={`h-px bg-border my-4 ${className || ''}`}
      style={isDark ? { opacity: 0.3 } : undefined}
    />
  );
}

export function VerticalDivider({ className }: { className?: string }) {
  const { isDark } = useTheme();

  return (
    <View
      className={`w-px bg-border mx-2 ${className || ''}`}
      style={isDark ? { opacity: 0.3 } : undefined}
    />
  );
}
