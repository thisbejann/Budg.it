import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
import { COLORS } from '../../../constants/colors';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TransactionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { activeLedgerId } = useLedgerStore();

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

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const getIcon = (iconName: string, color: string = '#fff') => {
    const IconComponent = (LucideIcons as any)[
      iconName.split('-').map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1))).join('')
    ] || LucideIcons.Circle;
    return <IconComponent size={16} color={color} />;
  };

  const markedDates = Object.entries(dailyTotals).reduce((acc, [date, total]) => {
    acc[date] = {
      marked: true,
      dotColor: total.expense > total.income ? COLORS.expense : COLORS.income,
      selected: date === selectedDate,
      selectedColor: COLORS.primary,
    };
    return acc;
  }, {} as Record<string, any>);

  // Add selected date if not in totals
  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: COLORS.primary,
    };
  }

  const filteredTransactions =
    viewMode === 'calendar'
      ? transactions.filter((t) => t.date === selectedDate)
      : transactions;

  const renderTransaction = ({ item }: { item: TransactionWithDetails }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id })}
      className="flex-row items-center justify-between border-b border-border px-4 py-3"
    >
      <View className="flex-row items-center gap-3">
        <IconAvatar
          size="sm"
          icon={getIcon(item.category_icon || 'circle')}
          backgroundColor={item.category_color || COLORS.mutedForeground}
        />
        <View>
          <Text className="text-sm font-medium text-foreground">
            {item.category_name || 'Uncategorized'}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {item.account_name}
            {item.notes ? ` • ${item.notes}` : ''}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text
          className={`text-sm font-semibold ${
            item.type === 'expense' ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {item.type === 'expense' ? '-' : '+'}
          {formatPHP(item.amount)}
        </Text>
        {viewMode === 'list' && (
          <Text className="text-xs text-muted-foreground">{formatDate(item.date)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen scrollable={false}>
      <SimpleHeader title="Transactions" />

      {/* View Toggle */}
      <View className="flex-row items-center justify-between border-b border-border px-4 py-2">
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`flex-row items-center gap-1 rounded-lg px-3 py-1.5 ${
              viewMode === 'list' ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <List size={16} color={viewMode === 'list' ? '#fff' : COLORS.foreground} />
            <Text
              className={`text-sm font-medium ${
                viewMode === 'list' ? 'text-white' : 'text-foreground'
              }`}
            >
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('calendar')}
            className={`flex-row items-center gap-1 rounded-lg px-3 py-1.5 ${
              viewMode === 'calendar' ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <CalendarIcon
              size={16}
              color={viewMode === 'calendar' ? '#fff' : COLORS.foreground}
            />
            <Text
              className={`text-sm font-medium ${
                viewMode === 'calendar' ? 'text-white' : 'text-foreground'
              }`}
            >
              Calendar
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTransaction')}
          className="rounded-full bg-primary p-2"
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            backgroundColor: COLORS.background,
            calendarBackground: COLORS.background,
            textSectionTitleColor: COLORS.mutedForeground,
            selectedDayBackgroundColor: COLORS.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: COLORS.primary,
            dayTextColor: COLORS.foreground,
            textDisabledColor: COLORS.mutedForeground,
            monthTextColor: COLORS.foreground,
            arrowColor: COLORS.primary,
          }}
        />
      )}

      {/* Daily Summary for Calendar View */}
      {viewMode === 'calendar' && dailyTotals[selectedDate] && (
        <View className="flex-row justify-around border-b border-border py-2">
          <View className="items-center">
            <Text className="text-xs text-muted-foreground">Income</Text>
            <Text className="text-sm font-semibold text-green-600">
              {formatPHP(dailyTotals[selectedDate].income)}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-muted-foreground">Expense</Text>
            <Text className="text-sm font-semibold text-red-600">
              {formatPHP(dailyTotals[selectedDate].expense)}
            </Text>
          </View>
        </View>
      )}

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <EmptyState
            icon={<LucideIcons.Receipt size={48} color={COLORS.mutedForeground} />}
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
    </Screen>
  );
}
