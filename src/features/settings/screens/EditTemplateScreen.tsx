import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Header } from '../../../shared/components/layout';

export function EditTemplateScreen() {
  return (
    <Screen>
      <Header title="Edit Template" showBack />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">Edit Template Screen - Coming Soon</Text>
      </View>
    </Screen>
  );
}
