import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Header } from '../../../shared/components/layout';

export function EditTransactionScreen() {
  return (
    <Screen>
      <Header title="Edit Transaction" showBack />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">Edit Transaction Screen - Coming Soon</Text>
      </View>
    </Screen>
  );
}
