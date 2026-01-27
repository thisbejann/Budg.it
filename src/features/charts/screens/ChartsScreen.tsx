import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { VictoryPie, VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { X } from 'lucide-react-native';
import type { CategorySpending } from '../../../types/database';
import { Screen } from '../../../shared/components/layout';
import { Card, CardHeader, CardTitle, CardContent, GlassCard } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { TransactionRepository } from '../../../database/repositories';
import { formatPHP, formatPHPCompact } from '../../../shared/utils/currency';
import { getMonthStart, getMonthEnd, getToday, formatMonthKey } from '../../../shared/utils/date';
import { useTheme } from '../../../hooks/useColorScheme';

const screenWidth = Dimensions.get('window').width;

type ChartPeriod = 'week' | 'month' | '3months' | '6months';

export function ChartsScreen() {
  const navigation = useNavigation();
  const { activeLedgerId } = useLedgerStore();
  const { colors } = useTheme();

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

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  return (
    <Screen>
      {/* Modal Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
        <Text className="text-xl font-bold text-foreground">Charts & Insights</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-full bg-secondary"
        >
          <X size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Period Selector */}
        <View className="mb-4 flex-row gap-2">
          {(['month', '3months', '6months'] as ChartPeriod[]).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              className={`rounded-xl px-3 py-1.5 ${
                period === p ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  period === p ? 'text-white' : 'text-foreground'
                }`}
              >
                {p === 'month' ? 'This Month' : p === '3months' ? '3 Months' : '6 Months'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View className="mb-4 flex-row gap-3">
          <GlassCard className="flex-1">
            <Text className="text-xs text-muted-foreground">Total Expense</Text>
            <Text className="text-lg font-bold text-red-600">{formatPHP(totalExpense)}</Text>
          </GlassCard>
          <GlassCard className="flex-1">
            <Text className="text-xs text-muted-foreground">Total Income</Text>
            <Text className="text-lg font-bold text-green-600">{formatPHP(totalIncome)}</Text>
          </GlassCard>
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
                      <Text className="text-xs text-muted-foreground">{item.x}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text className="py-8 text-center text-sm text-muted-foreground">
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
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(t) => formatPHPCompact(t)}
                  style={{
                    tickLabels: { fontSize: 10, fill: colors.mutedForeground },
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
              <Text className="py-8 text-center text-sm text-muted-foreground">
                No data available
              </Text>
            )}
            <View className="mt-2 flex-row justify-center gap-4">
              <View className="flex-row items-center gap-1">
                <View className="h-3 w-3 rounded-full bg-red-500" />
                <Text className="text-xs text-muted-foreground">Expense</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View className="h-3 w-3 rounded-full bg-green-500" />
                <Text className="text-xs text-muted-foreground">Income</Text>
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
                className={`flex-row items-center justify-between py-2 ${
                  index < categoryData.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <View
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.category_color }}
                  />
                  <Text className="text-sm text-foreground">{cat.category_name}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-medium text-foreground">
                    {formatPHP(cat.total_amount)}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    ({cat.percentage.toFixed(1)}%)
                  </Text>
                </View>
              </View>
            ))}
            {categoryData.length === 0 && (
              <Text className="py-4 text-center text-sm text-muted-foreground">
                No categories with spending
              </Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </Screen>
  );
}
