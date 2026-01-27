import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ChevronRight,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { TransactionWithDetails, CategorySpending } from '../../../types/database';
import { Screen } from '../../../shared/components/layout';
import { Card, CardHeader, CardTitle, CardContent, GlassCard, GlassCardPressable, IconAvatar } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { TransactionRepository, AccountRepository } from '../../../database/repositories';
import { formatPHP, formatPHPCompact } from '../../../shared/utils/currency';
import { getMonthStart, getMonthEnd, formatDate, formatMonthYear, getToday } from '../../../shared/utils/date';
import { useTheme } from '../../../hooks/useColorScheme';
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

  const { colors } = useTheme();

  const getIcon = (iconName: string | null | undefined, color: string = colors.foreground) => {
    if (!iconName) {
      return <LucideIcons.Circle size={16} color={color} />;
    }
    const pascalName = iconName.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('');
    const IconComponent = (LucideIcons as any)[pascalName];
    if (!IconComponent) {
      return <LucideIcons.Circle size={16} color={color} />;
    }
    return <IconComponent size={16} color={color} />;
  };

  const netSavings = monthlyIncome - monthlySpending;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      {/* Decorative gradient background for glassmorphism effect */}
      <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
        <View
          className="absolute -top-10 -right-10 h-72 w-72 rounded-full opacity-50"
          style={{ backgroundColor: colors.primary }}
        />
        <View
          className="absolute top-48 -left-24 h-56 w-56 rounded-full opacity-40"
          style={{ backgroundColor: '#22c55e' }}
        />
        <View
          className="absolute top-[400px] -right-10 h-48 w-48 rounded-full opacity-35"
          style={{ backgroundColor: '#8b5cf6' }}
        />
      </View>
      <View className="px-4 py-6 pb-24">
        {/* Header with Ledger Name */}
        <Animated.View entering={FadeInDown.delay(0).duration(400)} className="mb-6">
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            {activeLedger?.name || 'Budget Tracker'}
          </Text>
          <Text className="text-sm" style={{ color: colors.mutedForeground }}>
            {formatMonthYear(getToday())}
          </Text>
        </Animated.View>

        {/* Balance Hero Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-4">
          <GlassCard className="items-center py-6">
            <Text className="text-sm mb-1" style={{ color: colors.mutedForeground }}>Net Worth</Text>
            <Text
              className="text-3xl font-bold"
              style={{ color: balanceSummary.netWorth >= 0 ? '#22c55e' : '#ef4444' }}
            >
              {formatPHP(balanceSummary.netWorth)}
            </Text>
            <View className="flex-row items-center gap-4 mt-4">
              <TouchableOpacity
                onPress={() => navigation.navigate('Transfer')}
                className="flex-row items-center gap-2 rounded-full px-4 py-2"
                style={{ backgroundColor: colors.secondary }}
              >
                <ArrowLeftRight size={16} color={colors.foreground} />
                <Text className="text-sm font-medium" style={{ color: colors.foreground }}>Transfer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Main', { screen: 'Accounts' })}
                className="flex-row items-center gap-2 rounded-full px-4 py-2"
                style={{ backgroundColor: colors.secondary }}
              >
                <Wallet size={16} color={colors.foreground} />
                <Text className="text-sm font-medium" style={{ color: colors.foreground }}>Accounts</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Stats Grid (2x2) */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} className="flex-row flex-wrap mb-4 -mx-1.5">
          {/* Income */}
          <View className="w-1/2 px-1.5 mb-3">
            <GlassCard>
              <View className="flex-row items-center gap-2 mb-2">
                <View className="h-8 w-8 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                  <TrendingUp size={16} color="#22c55e" />
                </View>
                <Text className="text-xs" style={{ color: colors.mutedForeground }}>Income</Text>
              </View>
              <Text className="text-lg font-bold" style={{ color: '#22c55e' }}>
                {formatPHPCompact(monthlyIncome)}
              </Text>
            </GlassCard>
          </View>

          {/* Expenses */}
          <View className="w-1/2 px-1.5 mb-3">
            <GlassCard>
              <View className="flex-row items-center gap-2 mb-2">
                <View className="h-8 w-8 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <TrendingDown size={16} color="#ef4444" />
                </View>
                <Text className="text-xs" style={{ color: colors.mutedForeground }}>Expenses</Text>
              </View>
              <Text className="text-lg font-bold" style={{ color: '#ef4444' }}>
                {formatPHPCompact(monthlySpending)}
              </Text>
            </GlassCard>
          </View>

          {/* Net Savings */}
          <View className="w-1/2 px-1.5">
            <GlassCard>
              <View className="flex-row items-center gap-2 mb-2">
                <View
                  className="h-8 w-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: netSavings >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}
                >
                  {netSavings >= 0 ? (
                    <ArrowDownLeft size={16} color="#22c55e" />
                  ) : (
                    <ArrowUpRight size={16} color="#ef4444" />
                  )}
                </View>
                <Text className="text-xs" style={{ color: colors.mutedForeground }}>Net Savings</Text>
              </View>
              <Text className="text-lg font-bold" style={{ color: netSavings >= 0 ? '#22c55e' : '#ef4444' }}>
                {formatPHPCompact(Math.abs(netSavings))}
              </Text>
            </GlassCard>
          </View>

          {/* View Charts */}
          <View className="w-1/2 px-1.5">
            <GlassCardPressable onPress={() => navigation.navigate('Charts')}>
              <View className="flex-row items-center gap-2 mb-2">
                <View className="h-8 w-8 rounded-full items-center justify-center" style={{ backgroundColor: `${colors.primary}33` }}>
                  <BarChart3 size={16} color={colors.primary} />
                </View>
                <Text className="text-xs" style={{ color: colors.mutedForeground }}>Analytics</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>View Charts</Text>
                <ChevronRight size={16} color={colors.primary} />
              </View>
            </GlassCardPressable>
          </View>
        </Animated.View>

        {/* Top Categories */}
        {categorySpending.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} className="mb-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Top Spending</CardTitle>
                <TouchableOpacity onPress={() => navigation.navigate('Charts')}>
                  <ChevronRight size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </CardHeader>
              <CardContent>
                {categorySpending.map((cat, index) => (
                  <View
                    key={cat.category_id}
                    className="flex-row items-center justify-between py-2"
                    style={index < categorySpending.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : undefined}
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
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Transactions' })}>
                <ChevronRight size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
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
                    style={index < recentTransactions.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : undefined}
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
                          {formatDate(transaction.date)} • {transaction.account_name || 'Unknown Account'}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: transaction.type === 'expense' ? '#ef4444' : '#22c55e' }}
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
  );
}
