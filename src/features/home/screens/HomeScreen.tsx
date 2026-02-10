import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
// Safe haptic wrapper — native module may not be in current dev build
const triggerHaptic = () => {
  try {
    const Haptics = require('expo-haptics');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {}
};
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { TransactionWithDetails, CategorySpending } from '../../../types/database';
import { Screen } from '../../../shared/components/layout';
import { Card, CardHeader, CardTitle, CardContent, FAB, IconAvatar } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { TransactionRepository, AccountRepository } from '../../../database/repositories';
import { formatPHP, formatPHPCompact } from '../../../shared/utils/currency';
import { getMonthStart, getMonthEnd, formatDate, formatMonthYear, getToday } from '../../../shared/utils/date';
import { useTheme } from '../../../hooks/useColorScheme';
import { FLOATING_TAB_BAR_TOTAL_HEIGHT } from '../../../shared/components/navigation/FloatingTabBar';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { activeLedger, activeLedgerId } = useLedgerStore();
  const { colors, isDark } = useTheme();

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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getIcon = (iconName: string, color: string = colors.foreground) => {
    const IconComponent = (LucideIcons as any)[
      iconName.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
    ] || LucideIcons.Circle;
    return <IconComponent size={16} color={color} />;
  };

  const handleFABPress = () => {
    triggerHaptic();
    navigation.navigate('AddTransaction');
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={refreshing} onRefresh={onRefresh} hasTabBar>
        <View className="px-4 py-6">
        {/* Hero Header */}
        <Animated.View entering={FadeInDown.delay(0).springify()} className="mb-6">
          <Text
            className="text-3xl font-bold"
            style={{ color: colors.foreground, letterSpacing: -0.8 }}
          >
            {activeLedger?.name || 'Budget Tracker'}
          </Text>
          <Text
            className="text-sm font-medium"
            style={{ color: colors.primary }}
          >
            {formatMonthYear(getToday())}
          </Text>
        </Animated.View>

        {/* Quick Transfer Action */}
        <Animated.View entering={FadeInDown.delay(80).springify()} className="mb-6">
          <TouchableOpacity
            onPress={() => navigation.navigate('Transfer')}
            className="flex-row items-center justify-center gap-2 px-4 py-3"
            style={{
              backgroundColor: isDark ? colors.surfaceContainer : colors.secondaryContainer,
              borderRadius: 16,
              borderWidth: isDark ? 1 : 0,
              borderColor: 'rgba(255, 255, 255, 0.06)',
            }}
          >
            <ArrowLeftRight size={20} color={colors.primary} />
            <Text className="font-semibold" style={{ color: colors.primary }}>Transfer</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Monthly Summary Card */}
        <Animated.View entering={FadeInDown.delay(160).springify()}>
          <Card variant={isDark ? 'glass' : 'default'} className="mb-4">
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <ArrowDownLeft size={16} color={colors.income} />
                    <Text className="text-sm" style={{ color: colors.mutedForeground }}>Income</Text>
                  </View>
                  <Text className="text-lg font-semibold" style={{ color: colors.income }}>
                    {formatPHP(monthlyIncome)}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <ArrowUpRight size={16} color={colors.expense} />
                    <Text className="text-sm" style={{ color: colors.mutedForeground }}>Expense</Text>
                  </View>
                  <Text className="text-lg font-semibold" style={{ color: colors.expense }}>
                    {formatPHP(monthlySpending)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm" style={{ color: colors.mutedForeground }}>Net</Text>
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: monthlyIncome - monthlySpending >= 0 ? colors.income : colors.expense }}
                  >
                    {formatPHP(monthlyIncome - monthlySpending, true)}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Account Balances Card */}
        <Animated.View entering={FadeInDown.delay(240).springify()}>
          <Card variant={isDark ? 'glass' : 'default'} className="mb-4">
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <CardTitle>Accounts</CardTitle>
                <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Accounts' })}>
                  <ChevronRight size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent>
              <View className="flex-row flex-wrap gap-y-3">
                <View className="w-1/2 pr-2">
                  <Text className="text-xs" style={{ color: colors.mutedForeground }}>Cash & Bank</Text>
                  <Text className="text-base font-semibold" style={{ color: colors.accountDebit }}>
                    {formatPHPCompact(balanceSummary.debit)}
                  </Text>
                </View>
                <View className="w-1/2 pl-2">
                  <Text className="text-xs" style={{ color: colors.mutedForeground }}>Credit Cards</Text>
                  <Text className="text-base font-semibold" style={{ color: colors.accountCredit }}>
                    {formatPHPCompact(balanceSummary.credit)}
                  </Text>
                </View>
                <View className="w-1/2 pr-2">
                  <Text className="text-xs" style={{ color: colors.mutedForeground }}>Owed to Me</Text>
                  <Text className="text-base font-semibold" style={{ color: colors.accountOwed }}>
                    {formatPHPCompact(balanceSummary.owed)}
                  </Text>
                </View>
                <View className="w-1/2 pl-2">
                  <Text className="text-xs" style={{ color: colors.mutedForeground }}>I Owe</Text>
                  <Text className="text-base font-semibold" style={{ color: colors.accountDebt }}>
                    {formatPHPCompact(balanceSummary.debt)}
                  </Text>
                </View>
              </View>
              <View
                className="mt-3 pt-3"
                style={{ borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }}
              >
                <Text className="text-xs" style={{ color: colors.mutedForeground }}>Net Worth</Text>
                <Text
                  className="text-xl font-bold"
                  style={{
                    color: balanceSummary.netWorth >= 0
                      ? (isDark ? colors.primary : colors.income)
                      : colors.expense,
                  }}
                >
                  {formatPHP(balanceSummary.netWorth)}
                </Text>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Top Categories */}
        {categorySpending.length > 0 && (
          <Animated.View entering={FadeInDown.delay(320).springify()}>
            <Card className="mb-4">
              <CardHeader>
                <View className="flex-row items-center justify-between">
                  <CardTitle>Top Spending</CardTitle>
                  <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Charts' })}>
                    <ChevronRight size={20} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </CardHeader>
              <CardContent>
                {categorySpending.map((cat, index) => (
                  <View
                    key={cat.category_id}
                    className="flex-row items-center justify-between py-2"
                    style={index < categorySpending.length - 1 ? { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border } : undefined}
                  >
                    <View className="flex-row items-center gap-3">
                      <IconAvatar
                        size="sm"
                        icon={getIcon(cat.category_icon, '#fff')}
                        backgroundColor={cat.category_color}
                      />
                      <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                        {cat.category_name}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                        {formatPHP(cat.total_amount)}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.mutedForeground }}>
                        {cat.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </CardContent>
            </Card>
          </Animated.View>
        )}

        {/* Recent Transactions */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Transactions' })}>
                  <ChevronRight size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <Text className="py-4 text-center text-sm" style={{ color: colors.mutedForeground }}>
                  No transactions yet
                </Text>
              ) : (
                recentTransactions.map((transaction, index) => (
                  <TouchableOpacity
                    key={transaction.id}
                    onPress={() => navigation.navigate('TransactionDetail', { transactionId: transaction.id })}
                    className="flex-row items-center justify-between py-3"
                    style={index < recentTransactions.length - 1 ? { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border } : undefined}
                  >
                    <View className="flex-row items-center gap-3">
                      <IconAvatar
                        size="sm"
                        icon={getIcon(transaction.category_icon || 'circle', '#fff')}
                        backgroundColor={transaction.category_color || colors.mutedForeground}
                      />
                      <View>
                        <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                          {transaction.category_name || 'Uncategorized'}
                        </Text>
                        <Text className="text-xs" style={{ color: colors.mutedForeground }}>
                          {formatDate(transaction.date)} • {transaction.account_name}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: transaction.type === 'expense' ? colors.expense : colors.income }}
                    >
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatPHP(transaction.amount)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </CardContent>
          </Card>
        </Animated.View>
        </View>
      </Screen>

      {/* Floating Action Button */}
      <SafeAreaView edges={['bottom', 'right']} style={{ position: 'absolute', bottom: FLOATING_TAB_BAR_TOTAL_HEIGHT, right: 0 }}>
        <View style={{ padding: 16 }}>
          <FAB onPress={handleFABPress}>
            <Plus size={24} color={colors.onPrimary} />
          </FAB>
        </View>
      </SafeAreaView>
    </View>
  );
}
