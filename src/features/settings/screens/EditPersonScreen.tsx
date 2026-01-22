import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Header } from '../../../shared/components/layout';

export function EditPersonScreen() {
  return (
    <Screen>
      <Header title="Edit Person" showBack />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">Edit Person Screen - Coming Soon</Text>
      </View>
    </Screen>
  );
}
