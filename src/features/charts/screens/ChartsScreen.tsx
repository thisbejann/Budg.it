import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { VictoryPie, VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import type { CategorySpending } from '../../../types/database';
import { Screen, SimpleHeader } from '../../../shared/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { TransactionRepository } from '../../../database/repositories';
import { formatPHP, formatPHPCompact } from '../../../shared/utils/currency';
import { getMonthStart, getMonthEnd, getToday, formatMonthKey } from '../../../shared/utils/date';
import { useTheme } from '../../../hooks/useColorScheme';

const screenWidth = Dimensions.get('window').width;

type ChartPeriod = 'week' | 'month' | '3months' | '6months';

export function ChartsScreen() {
  const { activeLedgerId } = useLedgerStore();
  const { colors, isDark } = useTheme();

  const [period, setPeriod] = useState<ChartPeriod>('month');
  const [categoryData, setCategoryData] = useState<CategorySpending[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; income: number; expense: number }[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  const loadData = useCallback(async () => {
    if (!activeLedgerId) return;

    try {
      const today = getToday();
      const monthStart = getMonthStart(today);
      const monthEnd = getMonthEnd(today);

      const [categories, monthly] = await Promise.all([
        TransactionRepository.getCategorySpending(activeLedgerId, monthStart, monthEnd, 'expense'),
        TransactionRepository.getMonthlyTotals(activeLedgerId, 6),
      ]);

      setCategoryData(categories);
      setMonthlyData(monthly);

      const expenseTotal = categories.reduce((sum, c) => sum + c.total_amount, 0);
      setTotalExpense(expenseTotal);

      const incomeTotal = monthly.reduce((sum, m) => sum + m.income, 0);
      setTotalIncome(incomeTotal);
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  }, [activeLedgerId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const pieData = categoryData.slice(0, 6).map((cat) => ({
    x: cat.category_name,
    y: cat.total_amount,
    color: cat.category_color,
  }));

  const barData = monthlyData.map((m) => ({
    month: formatMonthKey(m.month),
    expense: m.expense,
    income: m.income,
  }));

  // Gold pill style for period selector
  const pillStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? colors.primary : (isDark ? colors.surfaceContainer : colors.secondaryContainer),
    borderRadius: 20,
  });

  const pillTextColor = (isActive: boolean) =>
    isActive ? colors.onPrimary : (isDark ? colors.mutedForeground : colors.onSecondaryContainer);

  return (
    <Screen hasTabBar>
      <SimpleHeader title="Charts & Insights" />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Period Selector */}
        <View className="mb-4 flex-row gap-2">
          {(['month', '3months', '6months'] as ChartPeriod[]).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              className="px-4 py-1.5"
              style={pillStyle(period === p)}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: pillTextColor(period === p) }}
              >
                {p === 'month' ? 'This Month' : p === '3months' ? '3 Months' : '6 Months'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View className="mb-4 flex-row gap-3">
          <Card variant={isDark ? 'glass' : 'default'} className="flex-1">
            <CardContent>
              <Text className="text-xs" style={{ color: colors.mutedForeground }}>Total Expense</Text>
              <Text className="text-lg font-bold" style={{ color: colors.expense }}>{formatPHP(totalExpense)}</Text>
            </CardContent>
          </Card>
          <Card variant={isDark ? 'glass' : 'default'} className="flex-1">
            <CardContent>
              <Text className="text-xs" style={{ color: colors.mutedForeground }}>Total Income</Text>
              <Text className="text-lg font-bold" style={{ color: colors.income }}>{formatPHP(totalIncome)}</Text>
            </CardContent>
          </Card>
        </View>

        {/* Pie Chart - Spending by Category */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <View className="items-center">
                <VictoryPie
                  data={pieData}
                  width={screenWidth - 64}
                  height={250}
                  colorScale={pieData.map((d) => d.color)}
                  innerRadius={60}
                  labelRadius={({ innerRadius }) => (innerRadius as number) + 40}
                  style={{
                    labels: { fill: colors.foreground, fontSize: 10 },
                  }}
                  labels={({ datum }) => `${datum.x}\n${formatPHPCompact(datum.y)}`}
                />
                {/* Legend */}
                <View className="mt-2 flex-row flex-wrap justify-center gap-2">
                  {pieData.map((item, index) => (
                    <View key={index} className="flex-row items-center gap-1">
                      <View
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <Text className="text-xs" style={{ color: colors.mutedForeground }}>{item.x}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text className="py-8 text-center text-sm" style={{ color: colors.mutedForeground }}>
                No spending data for this period
              </Text>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Monthly Comparison */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <VictoryChart
                width={screenWidth - 64}
                height={250}
                theme={VictoryTheme.material}
                domainPadding={{ x: 20 }}
              >
                <VictoryAxis
                  tickFormat={(t) => t}
                  style={{
                    tickLabels: { fontSize: 10, fill: colors.mutedForeground },
                    axis: { stroke: isDark ? 'rgba(255,255,255,0.1)' : colors.border },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(t) => formatPHPCompact(t)}
                  style={{
                    tickLabels: { fontSize: 10, fill: colors.mutedForeground },
                    axis: { stroke: isDark ? 'rgba(255,255,255,0.1)' : colors.border },
                    grid: { stroke: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' },
                  }}
                />
                <VictoryBar
                  data={barData}
                  x="month"
                  y="expense"
                  style={{ data: { fill: colors.expense, width: 15 } }}
                />
                <VictoryBar
                  data={barData}
                  x="month"
                  y="income"
                  style={{ data: { fill: colors.income, width: 15 } }}
                />
              </VictoryChart>
            ) : (
              <Text className="py-8 text-center text-sm" style={{ color: colors.mutedForeground }}>
                No data available
              </Text>
            )}
            <View className="mt-2 flex-row justify-center gap-4">
              <View className="flex-row items-center gap-1">
                <View className="h-3 w-3 rounded-full" style={{ backgroundColor: colors.expense }} />
                <Text className="text-xs" style={{ color: colors.mutedForeground }}>Expense</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="h-3 w-3 rounded-full" style={{ backgroundColor: colors.income }} />
                <Text className="text-xs" style={{ color: colors.mutedForeground }}>Income</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Category Breakdown List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.map((cat, index) => (
              <View
                key={cat.category_id}
                className="flex-row items-center justify-between py-2"
                style={index < categoryData.length - 1 ? { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border } : undefined}
              >
                <View className="flex-row items-center gap-2">
                  <View
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.category_color }}
                  />
                  <Text className="text-sm" style={{ color: colors.foreground }}>{cat.category_name}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                    {formatPHP(cat.total_amount)}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.mutedForeground }}>
                    ({cat.percentage.toFixed(1)}%)
                  </Text>
                </View>
              </View>
            ))}
            {categoryData.length === 0 && (
              <Text className="py-4 text-center text-sm" style={{ color: colors.mutedForeground }}>
                No categories with spending
              </Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </Screen>
  );
}
