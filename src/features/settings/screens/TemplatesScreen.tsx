import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Header } from '../../../shared/components/layout';

export function TemplatesScreen() {
  return (
    <Screen>
      <Header title="Quick Add Templates" showBack />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">Templates Screen - Coming Soon</Text>
      </View>
    </Screen>
  );
}
