import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../types/navigation';
import { FloatingTabBar } from '../../shared/components/navigation/FloatingTabBar';

// Import screens
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { TransactionsScreen } from '../../features/transactions/screens/TransactionsScreen';
import { AccountsScreen } from '../../features/accounts/screens/AccountsScreen';
import { ChartsScreen } from '../../features/charts/screens/ChartsScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: 'absolute' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Charts" component={ChartsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
