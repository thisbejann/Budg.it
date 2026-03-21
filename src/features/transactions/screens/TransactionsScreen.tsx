import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, MainTabScreenProps } from '../../../types/navigation';
import type { TransactionWithDetails, DailyTotal } from '../../../types/database';
import { Screen, SimpleHeader } from '../../../shared/components/layout';
import { IconAvatar, EmptyState, TransactionsScreenSkeleton } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { TransactionRepository } from '../../../database/repositories';
import { formatPHP } from '../../../shared/utils/currency';
import { formatDate, getMonthStart, getMonthEnd, getToday } from '../../../shared/utils/date';
import { useTheme } from '../../../hooks/useColorScheme';
import * as LucideIcons from 'lucide-react-native';
import { getIconComponent } from '../../../shared/utils/icon';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Compact currency format for day tiles: 1.2K, 500, 2.3M */
function formatCompact(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toFixed(0);
}

/** Returns a 2D grid of dates for the month (Mon-start), with nulls for padding. */
function getMonthGridDates(dateStr: string): (string | null)[][] {
  const date = parseISO(dateStr);
  const mStart = startOfMonth(date);
  const mEnd = endOfMonth(date);
  const firstDayIndex = (getDay(mStart) + 6) % 7; // Mon=0 … Sun=6

  const weeks: (string | null)[][] = [];
  let week: (string | null)[] = Array(firstDayIndex).fill(null);

  let current = new Date(mStart);
  while (current <= mEnd) {
    week.push(format(current, 'yyyy-MM-dd'));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    current = addDays(current, 1);
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

export function TransactionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { activeLedgerId } = useLedgerStore();
  const { colors, isDark } = useTheme();
  const shouldAnimateEntry = process.env.EXPO_OS !== 'android';

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [dailyTotals, setDailyTotals] = useState<Record<string, DailyTotal>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ---------- Data loading ----------

  const loadTransactions = useCallback(async () => {
    if (!activeLedgerId) return;
    try {
      setIsLoading(true);
      setError(null);
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
      const totalsMap: Record<string, DailyTotal> = {};
      totals.forEach((t) => {
        totalsMap[t.date] = t;
      });
      setDailyTotals(totalsMap);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [activeLedgerId, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  // ---------- Calendar computations ----------

  const today = getToday();
  const monthGrid = useMemo(() => getMonthGridDates(selectedDate), [selectedDate]);
  const monthLabel = useMemo(
    () => format(parseISO(selectedDate), 'MMMM yyyy'),
    [selectedDate]
  );
  const currentMonth = selectedDate.substring(0, 7);

  const goToPrevMonth = () => {
    setSelectedDate(
      format(startOfMonth(subMonths(parseISO(selectedDate), 1)), 'yyyy-MM-dd')
    );
  };

  const goToNextMonth = () => {
    setSelectedDate(
      format(startOfMonth(addMonths(parseISO(selectedDate), 1)), 'yyyy-MM-dd')
    );
  };

  const handleDayPress = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  // ---------- Rendering helpers ----------

  const getIcon = (iconName: string, color: string = colors.onPrimary) => {
    const IconComponent = getIconComponent(iconName);
    return <IconComponent size={16} color={color} />;
  };

  const renderDayCell = (dateStr: string | null, index: number) => {
    if (!dateStr) {
      return <View key={`empty-${index}`} style={{ flex: 1, height: 62 }} />;
    }

    const isSelected = dateStr === selectedDate;
    const isToday = dateStr === today;
    const dayData = dailyTotals[dateStr];
    const dayNum = parseInt(dateStr.split('-')[2], 10);
    const inMonth = dateStr.startsWith(currentMonth);
    const hasData = dayData && inMonth;

    return (
      <TouchableOpacity
        key={dateStr}
        onPress={() => handleDayPress(dateStr)}
        style={{
          flex: 1,
          height: 62,
          alignItems: 'center',
          paddingTop: 4,
        }}
        accessibilityRole="button"
        accessibilityLabel={`${formatDate(dateStr)}${isSelected ? ', selected' : ''}${isToday ? ', today' : ''}`}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            borderCurve: 'continuous',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSelected ? colors.primary : 'transparent',
            ...(isToday && !isSelected
              ? { borderWidth: 1.5, borderColor: colors.primary }
              : {}),
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: isToday || isSelected ? '600' : '400',
              color: isSelected
                ? colors.onPrimary
                : isToday
                  ? colors.primary
                  : inMonth
                    ? colors.foreground
                    : colors.mutedForeground,
            }}
          >
            {dayNum}
          </Text>
        </View>
        {hasData ? (
          <View style={{ alignItems: 'center', marginTop: 1 }}>
            {dayData.expense > 0 && (
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '600',
                  lineHeight: 12,
                  color: isSelected ? colors.onPrimary : colors.expense,
                }}
                numberOfLines={1}
              >
                {formatCompact(dayData.expense)}
              </Text>
            )}
            {dayData.income > 0 && (
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '600',
                  lineHeight: 12,
                  color: isSelected ? colors.onPrimary : colors.income,
                }}
                numberOfLines={1}
              >
                {formatCompact(dayData.income)}
              </Text>
            )}
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const filteredTransactions =
    viewMode === 'calendar'
      ? transactions.filter((t) => t.date === selectedDate)
      : transactions;

  const selectedDayData = dailyTotals[selectedDate];

  const renderTransaction = ({ item, index }: { item: TransactionWithDetails; index: number }) => (
    <Animated.View entering={shouldAnimateEntry ? FadeInDown.delay(index * 40).springify() : undefined}>
      <TouchableOpacity
        onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id })}
        accessibilityRole="button"
        accessibilityLabel={`${item.category_name || 'Uncategorized'}, ${item.type === 'expense' ? 'expense' : 'income'} ${formatPHP(item.amount)}`}
        className="flex-row items-center justify-between px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: isDark ? colors.dividerSubtle : colors.border }}
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
    </Animated.View>
  );

  // Toggle pill styles
  const pillStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? colors.primary : (isDark ? colors.surfaceContainer : colors.secondaryContainer),
    borderRadius: 20,
  });

  const pillTextColor = (isActive: boolean) =>
    isActive ? colors.onPrimary : (isDark ? colors.mutedForeground : colors.onSecondaryContainer);

  return (
    <Screen scrollable={true} hasTabBar={true}>
      <SimpleHeader title="Transactions" />

      {/* View Toggle */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            accessibilityRole="radio"
            accessibilityLabel="List view"
            accessibilityState={{ selected: viewMode === 'list' }}
            className="flex-row items-center gap-1 px-4 py-2.5"
            style={pillStyle(viewMode === 'list')}
          >
            <List size={16} color={pillTextColor(viewMode === 'list')} />
            <Text className="text-sm font-medium" style={{ color: pillTextColor(viewMode === 'list') }}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('calendar')}
            accessibilityRole="radio"
            accessibilityLabel="Calendar view"
            accessibilityState={{ selected: viewMode === 'calendar' }}
            className="flex-row items-center gap-1 px-4 py-2.5"
            style={pillStyle(viewMode === 'calendar')}
          >
            <CalendarIcon size={16} color={pillTextColor(viewMode === 'calendar')} />
            <Text className="text-sm font-medium" style={{ color: pillTextColor(viewMode === 'calendar') }}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTransaction')}
          accessibilityRole="button"
          accessibilityLabel="Add transaction"
          className="rounded-full p-3"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {/* ========== Calendar View ========== */}
      {viewMode === 'calendar' && (
        <View>
          {/* Month Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <TouchableOpacity
              onPress={goToPrevMonth}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 4 }}
              accessibilityLabel="Previous month"
            >
              <ChevronLeft size={20} color={colors.foreground} />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.foreground,
                letterSpacing: -0.3,
              }}
            >
              {monthLabel}
            </Text>

            <TouchableOpacity
              onPress={goToNextMonth}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 4 }}
              accessibilityLabel="Next month"
            >
              <ChevronRight size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Day-of-week Labels */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 8 }}>
            {DAY_LABELS.map((label, i) => (
              <View
                key={i}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: colors.mutedForeground,
                  }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {/* Month Grid */}
          {monthGrid.map((week, wi) => (
            <View
              key={`week-${wi}`}
              style={{ flexDirection: 'row', paddingHorizontal: 8 }}
            >
              {week.map((d, di) => renderDayCell(d, di))}
            </View>
          ))}

          {/* Day Summary Bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginTop: 4,
              borderBottomWidth: 1,
              borderBottomColor: isDark
                ? colors.dividerSubtle
                : colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: colors.foreground,
              }}
            >
              {formatDate(selectedDate)}
            </Text>
            {selectedDayData && (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {selectedDayData.expense > 0 && (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: colors.expense,
                    }}
                  >
                    -{formatPHP(selectedDayData.expense)}
                  </Text>
                )}
                {selectedDayData.income > 0 && (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: colors.income,
                    }}
                  >
                    +{formatPHP(selectedDayData.income)}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Transaction List */}
      {isLoading ? (
        <TransactionsScreenSkeleton />
      ) : error ? (
        <EmptyState
          icon={<LucideIcons.AlertTriangle size={48} color={colors.mutedForeground} />}
          title="Something went wrong"
          description={error}
          actionLabel="Try Again"
          onAction={loadTransactions}
        />
      ) : filteredTransactions.length === 0 ? (
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
      ) : (
        filteredTransactions.map((item, index) =>
          <React.Fragment key={item.id}>
            {renderTransaction({ item, index })}
          </React.Fragment>
        )
      )}
    </Screen>
  );
}
