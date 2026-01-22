import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ChevronRight } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { TransactionWithDetails, CategorySpending } from '../../../types/database';
import { Screen } from '../../../shared/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, IconAvatar } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { TransactionRepository, AccountRepository } from '../../../database/repositories';
import { formatPHP, formatPHPCompact } from '../../../shared/utils/currency';
import { getMonthStart, getMonthEnd, formatDate, formatMonthYear, getToday } from '../../../shared/utils/date';
import { COLORS } from '../../../constants/colors';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { activeLedger, activeLedgerId } = useLedgerStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithDetails[]>([]);
  const [balanceSummary, setBalanceSummary] = useState({
    debit: 0,
    credit: 0,
    owed: 0,
    debt: 0,
    netWorth: 0,
  });

  const loadData = useCallback(async () => {
    if (!activeLedgerId) return;

    try {
      const today = getToday();
      const monthStart = getMonthStart(today);
      const monthEnd = getMonthEnd(today);

      const [spending, income, categories, transactions, summary] = await Promise.all([
        TransactionRepository.getTotalForPeriod(activeLedgerId, monthStart, monthEnd, 'expense'),
        TransactionRepository.getTotalForPeriod(activeLedgerId, monthStart, monthEnd, 'income'),
        TransactionRepository.getCategorySpending(activeLedgerId, monthStart, monthEnd, 'expense'),
        TransactionRepository.getRecent(activeLedgerId, 5),
        AccountRepository.getBalanceSummary(activeLedgerId),
      ]);

      setMonthlySpending(spending);
      setMonthlyIncome(income);
      setCategorySpending(categories.slice(0, 5));
      setRecentTransactions(transactions);
      setBalanceSummary(summary);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeLedgerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getIcon = (iconName: string, color: string = COLORS.foreground) => {
    const IconComponent = (LucideIcons as any)[
      iconName.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
    ] || LucideIcons.Circle;
    return <IconComponent size={16} color={color} />;
  };

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <View className="px-4 py-6">
        {/* Header with Ledger Name */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">
            {activeLedger?.name || 'Budget Tracker'}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {formatMonthYear(getToday())}
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="mb-6 flex-row gap-3">
          <TouchableOpacity
            onPress={() => navigation.navigate('AddTransaction')}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-primary py-3"
          >
            <Plus size={20} color="#fff" />
            <Text className="font-semibold text-white">Add Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Transfer')}
            className="flex-row items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3"
          >
            <ArrowLeftRight size={20} color={COLORS.foreground} />
          </TouchableOpacity>
        </View>

        {/* Monthly Summary Card */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-1">
                  <ArrowDownLeft size={16} color={COLORS.income} />
                  <Text className="text-sm text-muted-foreground">Income</Text>
                </View>
                <Text className="text-lg font-semibold text-green-600">
                  {formatPHP(monthlyIncome)}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1">
                  <ArrowUpRight size={16} color={COLORS.expense} />
                  <Text className="text-sm text-muted-foreground">Expense</Text>
                </View>
                <Text className="text-lg font-semibold text-red-600">
                  {formatPHP(monthlySpending)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground">Net</Text>
                <Text
                  className={`text-lg font-semibold ${
                    monthlyIncome - monthlySpending >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatPHP(monthlyIncome - monthlySpending, true)}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Account Balances Card */}
        <Card className="mb-4">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Accounts</CardTitle>
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Accounts' })}>
              <ChevronRight size={20} color={COLORS.mutedForeground} />
            </TouchableOpacity>
          </CardHeader>
          <CardContent>
            <View className="flex-row flex-wrap gap-y-3">
              <View className="w-1/2 pr-2">
                <Text className="text-xs text-muted-foreground">Cash & Bank</Text>
                <Text className="text-base font-semibold text-green-600">
                  {formatPHPCompact(balanceSummary.debit)}
                </Text>
              </View>
              <View className="w-1/2 pl-2">
                <Text className="text-xs text-muted-foreground">Credit Cards</Text>
                <Text className="text-base font-semibold text-orange-600">
                  {formatPHPCompact(balanceSummary.credit)}
                </Text>
              </View>
              <View className="w-1/2 pr-2">
                <Text className="text-xs text-muted-foreground">Owed to Me</Text>
                <Text className="text-base font-semibold text-blue-600">
                  {formatPHPCompact(balanceSummary.owed)}
                </Text>
              </View>
              <View className="w-1/2 pl-2">
                <Text className="text-xs text-muted-foreground">I Owe</Text>
                <Text className="text-base font-semibold text-red-600">
                  {formatPHPCompact(balanceSummary.debt)}
                </Text>
              </View>
            </View>
            <View className="mt-3 border-t border-border pt-3">
              <Text className="text-xs text-muted-foreground">Net Worth</Text>
              <Text
                className={`text-xl font-bold ${
                  balanceSummary.netWorth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatPHP(balanceSummary.netWorth)}
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Top Categories */}
        {categorySpending.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Top Spending</CardTitle>
              <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Charts' })}>
                <ChevronRight size={20} color={COLORS.mutedForeground} />
              </TouchableOpacity>
            </CardHeader>
            <CardContent>
              {categorySpending.map((cat, index) => (
                <View
                  key={cat.category_id}
                  className={`flex-row items-center justify-between py-2 ${
                    index < categorySpending.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <IconAvatar
                      size="sm"
                      icon={getIcon(cat.category_icon, '#fff')}
                      backgroundColor={cat.category_color}
                    />
                    <Text className="text-sm font-medium text-foreground">
                      {cat.category_name}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-semibold text-foreground">
                      {formatPHP(cat.total_amount)}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {cat.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Transactions' })}>
              <ChevronRight size={20} color={COLORS.mutedForeground} />
            </TouchableOpacity>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <Text className="py-4 text-center text-sm text-muted-foreground">
                No transactions yet
              </Text>
            ) : (
              recentTransactions.map((transaction, index) => (
                <TouchableOpacity
                  key={transaction.id}
                  onPress={() => navigation.navigate('TransactionDetail', { transactionId: transaction.id })}
                  className={`flex-row items-center justify-between py-3 ${
                    index < recentTransactions.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <IconAvatar
                      size="sm"
                      icon={getIcon(transaction.category_icon || 'circle', '#fff')}
                      backgroundColor={transaction.category_color || COLORS.mutedForeground}
                    />
                    <View>
                      <Text className="text-sm font-medium text-foreground">
                        {transaction.category_name || 'Uncategorized'}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {formatDate(transaction.date)} • {transaction.account_name}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className={`text-sm font-semibold ${
                      transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatPHP(transaction.amount)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </CardContent>
        </Card>
      </View>
    </Screen>
  );
}
