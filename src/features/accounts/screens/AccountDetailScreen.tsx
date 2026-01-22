import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Header } from '../../../shared/components/layout';

export function AccountDetailScreen() {
  return (
    <Screen>
      <Header title="Account Details" showBack />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">Account Detail Screen - Coming Soon</Text>
      </View>
    </Screen>
  );
}
