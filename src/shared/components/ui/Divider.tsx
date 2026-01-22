import React from 'react';
import { View, Text } from 'react-native';

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <View className={`flex-row items-center my-4 ${className || ''}`}>
        <View className="flex-1 h-px bg-border" />
        <Text className="mx-3 text-sm text-muted-foreground">{label}</Text>
        <View className="flex-1 h-px bg-border" />
      </View>
    );
  }

  return <View className={`h-px bg-border my-4 ${className || ''}`} />;
}

export function VerticalDivider({ className }: { className?: string }) {
  return <View className={`w-px bg-border mx-2 ${className || ''}`} />;
}
