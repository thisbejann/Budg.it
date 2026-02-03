import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useTheme } from '../../hooks/useColorScheme';
import { BottomTabNavigator } from './BottomTabNavigator';

// Import modal/form screens
import { AddTransactionScreen } from '../../features/transactions/screens/AddTransactionScreen';
import { EditTransactionScreen } from '../../features/transactions/screens/EditTransactionScreen';
import { TransactionDetailScreen } from '../../features/transactions/screens/TransactionDetailScreen';
import { AddAccountScreen } from '../../features/accounts/screens/AddAccountScreen';
import { EditAccountScreen } from '../../features/accounts/screens/EditAccountScreen';
import { AccountDetailScreen } from '../../features/accounts/screens/AccountDetailScreen';
import { TransferScreen } from '../../features/transfers/screens/TransferScreen';
import { CategoriesScreen } from '../../features/settings/screens/CategoriesScreen';
import { AddCategoryScreen } from '../../features/settings/screens/AddCategoryScreen';
import { EditCategoryScreen } from '../../features/settings/screens/EditCategoryScreen';
import { AddSubcategoryScreen } from '../../features/settings/screens/AddSubcategoryScreen';
import { EditSubcategoryScreen } from '../../features/settings/screens/EditSubcategoryScreen';
import { TemplatesScreen } from '../../features/settings/screens/TemplatesScreen';
import { AddTemplateScreen } from '../../features/settings/screens/AddTemplateScreen';
import { EditTemplateScreen } from '../../features/settings/screens/EditTemplateScreen';
import { LedgersScreen } from '../../features/settings/screens/LedgersScreen';
import { AddLedgerScreen } from '../../features/settings/screens/AddLedgerScreen';
import { EditLedgerScreen } from '../../features/settings/screens/EditLedgerScreen';
import { AddPersonScreen } from '../../features/settings/screens/AddPersonScreen';
import { EditPersonScreen } from '../../features/settings/screens/EditPersonScreen';
import { ExportScreen } from '../../features/settings/screens/ExportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      {/* Main Tab Navigator */}
      <Stack.Screen name="Main" component={BottomTabNavigator} />

      {/* Transaction Screens */}
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="EditTransaction" component={EditTransactionScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />

      {/* Account Screens */}
      <Stack.Screen
        name="AddAccount"
        component={AddAccountScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="EditAccount" component={EditAccountScreen} />
      <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />

      {/* Transfer Screen */}
      <Stack.Screen
        name="Transfer"
        component={TransferScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />

      {/* Category Screens */}
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen
        name="AddCategory"
        component={AddCategoryScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="EditCategory" component={EditCategoryScreen} />
      <Stack.Screen
        name="AddSubcategory"
        component={AddSubcategoryScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="EditSubcategory" component={EditSubcategoryScreen} />

      {/* Template Screens */}
      <Stack.Screen name="Templates" component={TemplatesScreen} />
      <Stack.Screen
        name="AddTemplate"
        component={AddTemplateScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="EditTemplate" component={EditTemplateScreen} />

      {/* Ledger Screens */}
      <Stack.Screen name="Ledgers" component={LedgersScreen} />
      <Stack.Screen
        name="AddLedger"
        component={AddLedgerScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="EditLedger" component={EditLedgerScreen} />

      {/* Person Screens */}
      <Stack.Screen
        name="AddPerson"
        component={AddPersonScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="EditPerson" component={EditPersonScreen} />

      {/* Export Screen */}
      <Stack.Screen name="Export" component={ExportScreen} />
    </Stack.Navigator>
  );
}
