import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Header } from '../../../shared/components/layout';

export function TransactionDetailScreen() {
  return (
    <Screen>
      <Header title="Transaction Details" showBack />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">Transaction Detail Screen - Coming Soon</Text>
      </View>
    </Screen>
  );
}
