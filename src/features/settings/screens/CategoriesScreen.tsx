import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Header } from '../../../shared/components/layout';

export function CategoriesScreen() {
  return (
    <Screen>
      <Header title="Categories" showBack />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">Categories Screen - Coming Soon</Text>
      </View>
    </Screen>
  );
}
