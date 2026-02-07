import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, Calendar as CalendarIcon, List } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, MainTabScreenProps } from '../../../types/navigation';
import type { TransactionWithDetails, DailyTotal } from '../../../types/database';
import { Screen, SimpleHeader } from '../../../shared/components/layout';
import { IconAvatar, EmptyState } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { TransactionRepository } from '../../../database/repositories';
import { formatPHP } from '../../../shared/utils/currency';
import { formatDate, getMonthStart, getMonthEnd, getToday } from '../../../shared/utils/date';
import { useTheme } from '../../../hooks/useColorScheme';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TransactionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { activeLedgerId } = useLedgerStore();
  const { colors } = useTheme();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [dailyTotals, setDailyTotals] = useState<Record<string, DailyTotal>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    if (!activeLedgerId) return;

    try {
      setIsLoading(true);
      const monthStart = getMonthStart(selectedDate);
      const monthEnd = getMonthEnd(selectedDate);

      const [txns, totals] = await Promise.all([
        TransactionRepository.getByLedger(activeLedgerId, {
          startDate: monthStart,
          endDate: monthEnd,
        }),
        TransactionRepository.getDailyTotals(activeLedgerId, monthStart, monthEnd),
      ]);

      setTransactions(txns);

      // Convert to record for calendar marking
      const totalsMap: Record<string, DailyTotal> = {};
      totals.forEach((t) => {
        totalsMap[t.date] = t;
      });
      setDailyTotals(totalsMap);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeLedgerId, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const getIcon = (iconName: string, color: string = '#fff') => {
    const IconComponent = (LucideIcons as any)[
      iconName.split('-').map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1))).join('')
    ] || LucideIcons.Circle;
    return <IconComponent size={16} color={color} />;
  };

  const formatCompact = (amount: number): string => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toFixed(0);
  };

  const renderDayComponent = useMemo(() => {
    return ({ date, state }: { date?: { dateString: string; day: number }; state?: string }) => {
      if (!date) return null;
      const isSelected = date.dateString === selectedDate;
      const isToday = date.dateString === getToday();
      const dayData = dailyTotals[date.dateString];
      const isDisabled = state === 'disabled';

      return (
        <TouchableOpacity
          onPress={() => setSelectedDate(date.dateString)}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 50,
            borderRadius: 8,
            ...(isSelected ? { backgroundColor: colors.primary } : {}),
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: isToday ? '700' : '400',
              color: isSelected
                ? colors.onPrimary
                : isDisabled
                  ? colors.mutedForeground
                  : isToday
                    ? colors.primary
                    : colors.foreground,
            }}
          >
            {date.day}
          </Text>
          {dayData && !isDisabled && (
            <View style={{ alignItems: 'center', marginTop: 1 }}>
              {dayData.expense > 0 && (
                <Text
                  style={{
                    fontSize: 7,
                    color: isSelected ? colors.onPrimary : colors.expense,
                    lineHeight: 9,
                  }}
                  numberOfLines={1}
                >
                  {formatCompact(dayData.expense)}
                </Text>
              )}
              {dayData.income > 0 && (
                <Text
                  style={{
                    fontSize: 7,
                    color: isSelected ? colors.onPrimary : colors.income,
                    lineHeight: 9,
                  }}
                  numberOfLines={1}
                >
                  {formatCompact(dayData.income)}
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    };
  }, [selectedDate, dailyTotals, colors]);

  const markedDates = Object.entries(dailyTotals).reduce((acc, [date, total]) => {
    acc[date] = {
      marked: true,
      dotColor: total.expense > total.income ? colors.expense : colors.income,
      selected: date === selectedDate,
      selectedColor: colors.primary,
    };
    return acc;
  }, {} as Record<string, any>);

  // Add selected date if not in totals
  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: colors.primary,
    };
  }

  const filteredTransactions =
    viewMode === 'calendar'
      ? transactions.filter((t) => t.date === selectedDate)
      : transactions;

  const renderTransaction = ({ item }: { item: TransactionWithDetails }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id })}
      className="flex-row items-center justify-between px-4 py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      <View className="flex-row items-center gap-3">
        <IconAvatar
          size="sm"
          icon={getIcon(item.category_icon || 'circle')}
          backgroundColor={item.category_color || colors.mutedForeground}
        />
        <View>
          <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
            {item.category_name || 'Uncategorized'}
          </Text>
          <Text className="text-xs" style={{ color: colors.mutedForeground }}>
            {item.account_name}
            {item.notes ? ` • ${item.notes}` : ''}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text
          className="text-sm font-semibold"
          style={{ color: item.type === 'expense' ? colors.expense : colors.income }}
        >
          {item.type === 'expense' ? '-' : '+'}
          {formatPHP(item.amount)}
        </Text>
        {viewMode === 'list' && (
          <Text className="text-xs" style={{ color: colors.mutedForeground }}>{formatDate(item.date)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen scrollable={false}>
      <SimpleHeader title="Transactions" />

      {/* View Toggle */}
      <View
        className="flex-row items-center justify-between px-4 py-2"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className="flex-row items-center gap-1 rounded-lg px-3 py-1.5"
            style={{ backgroundColor: viewMode === 'list' ? colors.primary : colors.secondaryContainer }}
          >
            <List size={16} color={viewMode === 'list' ? colors.onPrimary : colors.onSecondaryContainer} />
            <Text
              className="text-sm font-medium"
              style={{ color: viewMode === 'list' ? colors.onPrimary : colors.onSecondaryContainer }}
            >
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('calendar')}
            className="flex-row items-center gap-1 rounded-lg px-3 py-1.5"
            style={{ backgroundColor: viewMode === 'calendar' ? colors.primary : colors.secondaryContainer }}
          >
            <CalendarIcon
              size={16}
              color={viewMode === 'calendar' ? colors.onPrimary : colors.onSecondaryContainer}
            />
            <Text
              className="text-sm font-medium"
              style={{ color: viewMode === 'calendar' ? colors.onPrimary : colors.onSecondaryContainer }}
            >
              Calendar
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTransaction')}
          className="rounded-full p-2"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          dayComponent={renderDayComponent}
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.background,
            textSectionTitleColor: colors.mutedForeground,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.onPrimary,
            todayTextColor: colors.primary,
            dayTextColor: colors.foreground,
            textDisabledColor: colors.mutedForeground,
            monthTextColor: colors.foreground,
            arrowColor: colors.primary,
          }}
        />
      )}

      {/* Daily Summary for Calendar View */}
      {viewMode === 'calendar' && dailyTotals[selectedDate] && (
        <View
          className="flex-row justify-around py-2"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <View className="items-center">
            <Text className="text-xs" style={{ color: colors.mutedForeground }}>Income</Text>
            <Text className="text-sm font-semibold" style={{ color: colors.income }}>
              {formatPHP(dailyTotals[selectedDate].income)}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs" style={{ color: colors.mutedForeground }}>Expense</Text>
            <Text className="text-sm font-semibold" style={{ color: colors.expense }}>
              {formatPHP(dailyTotals[selectedDate].expense)}
            </Text>
          </View>
        </View>
      )}

      {/* Transaction List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <EmptyState
              icon={<LucideIcons.Receipt size={48} color={colors.mutedForeground} />}
              title="No transactions"
              description={
                viewMode === 'calendar'
                  ? 'No transactions on this day'
                  : 'Start tracking your expenses'
              }
              actionLabel="Add Transaction"
              onAction={() => navigation.navigate('AddTransaction')}
            />
          }
        />
      )}
    </Screen>
  );
}
