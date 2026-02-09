import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../types/navigation';
import type {
  AccountWithPerson,
  TransactionWithDetails,
} from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import {
  AccountTypeBadge,
  Card,
  CardContent,
  IconAvatar,
  EmptyState,
} from '../../../shared/components/ui';
import {
  AccountRepository,
  TransactionRepository,
} from '../../../database/repositories';
import { useLedgerStore } from '../../../store';
import { formatPHP } from '../../../shared/utils/currency';
import { useTheme } from '../../../hooks/useColorScheme';
import * as LucideIcons from 'lucide-react-native';
import {
  Pencil,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
} from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AccountDetailRouteProp = RouteProp<RootStackParamList, 'AccountDetail'>;

export function AccountDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AccountDetailRouteProp>();
  const accountId = route.params.accountId;
  const { activeLedgerId } = useLedgerStore();
  const { colors } = useTheme();

  const [account, setAccount] = useState<AccountWithPerson | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!activeLedgerId) return;

    try {
      setIsLoading(true);
      const [acct, txns] = await Promise.all([
        AccountRepository.getById(accountId),
        TransactionRepository.getByLedger(activeLedgerId, { accountId }),
      ]);

      setAccount(acct);
      setTransactions(txns);
    } catch (error) {
      console.error('Error loading account details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, activeLedgerId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'debit':
        return colors.accountDebit;
      case 'credit':
        return colors.accountCredit;
      case 'owed':
        return colors.accountOwed;
      case 'debt':
        return colors.accountDebt;
      default:
        return colors.primary;
    }
  };

  const IconComponent = account
    ? (LucideIcons as any)[
        account.icon
          .split('-')
          .map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)))
          .join('')
      ] || LucideIcons.Wallet
    : LucideIcons.Wallet;

  const renderTransaction = ({ item }: { item: TransactionWithDetails }) => {
    const isExpense = item.type === 'expense';
    const CategoryIcon = item.category_icon
      ? (LucideIcons as any)[
          item.category_icon
            .split('-')
            .map((s, i) =>
              i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1),
            )
            .join('')
        ]
      : null;

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('TransactionDetail', { transactionId: item.id })
        }
        className="flex-row items-center justify-between border-b border-border px-4 py-3"
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: item.category_color || colors.muted }}
          >
            {CategoryIcon ? (
              <CategoryIcon size={18} color="#ffffff" />
            ) : isExpense ? (
              <ArrowUpRight size={18} color="#ffffff" />
            ) : (
              <ArrowDownLeft size={18} color="#ffffff" />
            )}
          </View>
          <View>
            <Text className="font-medium" style={{ color: colors.foreground }}>
              {item.category_name || (isExpense ? 'Expense' : 'Income')}
            </Text>
            <Text className="text-xs" style={{ color: colors.mutedForeground }}>
              {item.date}
              {item.subcategory_name && ` • ${item.subcategory_name}`}
            </Text>
          </View>
        </View>
        <Text
          className="font-semibold"
          style={{ color: isExpense ? colors.expense : colors.income }}
        >
          {isExpense ? '-' : '+'}
          {formatPHP(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <Screen>
        <Header title="Account Details" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!account) {
    return (
      <Screen>
        <Header title="Account Details" showBack />
        <View className="flex-1 items-center justify-center p-4">
          <Text style={{ color: colors.mutedForeground }}>
            Account not found
          </Text>
        </View>
      </Screen>
    );
  }

  const typeColor = getAccountTypeColor(account.account_type);

  return (
    <Screen scrollable={false}>
      <Header
        title="Account Details"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('EditAccount', { accountId })}
            className="p-2"
          >
            <Pencil size={20} color={colors.foreground} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        renderItem={renderTransaction}
        ListHeaderComponent={
          <View>
            {/* Account Card */}
            <View className="px-4 py-4">
              <Card>
                <CardContent className="p-4">
                  <View className="flex-row items-center gap-4">
                    <IconAvatar
                      size="xl"
                      icon={<IconComponent size={28} color="#ffffff" />}
                      backgroundColor={account.color}
                    />
                    <View className="flex-1">
                      <Text
                        className="text-lg font-bold"
                        style={{ color: colors.foreground }}
                      >
                        {account.name}
                      </Text>
                      <View className="mt-1 flex-row items-center gap-2">
                        <AccountTypeBadge type={account.account_type} />
                        {account.person_name && (
                          <Text
                            className="text-xs"
                            style={{ color: colors.mutedForeground }}
                          >
                            {account.person_name}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Balance */}
                  <View
                    className="mt-4 rounded-xl p-4"
                    style={{ backgroundColor: typeColor + '15' }}
                  >
                    <Text
                      className="text-sm"
                      style={{ color: colors.mutedForeground }}
                    >
                      Current Balance
                    </Text>
                    <Text
                      className="text-2xl font-bold"
                      style={{ color: typeColor }}
                    >
                      {formatPHP(account.current_balance)}
                    </Text>
                    {account.account_type === 'credit' &&
                      account.credit_limit && (
                        <View className="mt-2">
                          <View className="flex-row justify-between">
                            <Text
                              className="text-xs"
                              style={{ color: colors.mutedForeground }}
                            >
                              Credit Limit
                            </Text>
                            <Text
                              className="text-xs"
                              style={{ color: colors.mutedForeground }}
                            >
                              {formatPHP(account.credit_limit)}
                            </Text>
                          </View>
                          <View className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                            <View
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(
                                  (account.current_balance /
                                    account.credit_limit) *
                                    100,
                                  100,
                                )}%`,
                                backgroundColor: typeColor,
                              }}
                            />
                          </View>
                          <Text
                            className="mt-1 text-xs"
                            style={{ color: colors.mutedForeground }}
                          >
                            Available:{' '}
                            {formatPHP(
                              account.credit_limit - account.current_balance,
                            )}
                          </Text>
                        </View>
                      )}
                  </View>

                  {/* Initial Balance */}
                  <View className="mt-3 flex-row justify-between">
                    <Text
                      className="text-sm"
                      style={{ color: colors.mutedForeground }}
                    >
                      Initial Balance
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{ color: colors.foreground }}
                    >
                      {formatPHP(account.initial_balance)}
                    </Text>
                  </View>

                  {/* Notes */}
                  {account.notes && (
                    <View className="mt-3 rounded-lg bg-secondary p-3">
                      <Text
                        className="text-sm"
                        style={{ color: colors.mutedForeground }}
                      >
                        {account.notes}
                      </Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            </View>

            {/* Transactions Header */}
            <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
              <Text
                className="text-base font-semibold"
                style={{ color: colors.foreground }}
              >
                Transactions ({transactions.length})
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="py-12">
            <EmptyState
              icon={<Receipt size={48} color={colors.mutedForeground} />}
              title="No transactions"
              description="Transactions for this account will appear here"
            />
          </View>
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </Screen>
  );
}
