import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Header } from '../../../shared/components/layout';

export function TransferScreen() {
  return (
    <Screen>
      <Header title="Transfer Funds" showClose />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">Transfer Screen - Coming Soon</Text>
      </View>
    </Screen>
  );
}
