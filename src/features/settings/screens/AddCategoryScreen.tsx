import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Header } from '../../../shared/components/layout';

export function AddCategoryScreen() {
  return (
    <Screen>
      <Header title="Add Category" showClose />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">Add Category Screen - Coming Soon</Text>
      </View>
    </Screen>
  );
}
