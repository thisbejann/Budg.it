import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { useTheme } from '../../../hooks/useColorScheme';

type TransactionType = 'expense' | 'income';

interface TransactionTypeToggleProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
}

export function TransactionTypeToggle({ value, onChange }: TransactionTypeToggleProps) {
  const { colors } = useTheme();
  const isExpense = value === 'expense';

  const slidePosition = useSharedValue(isExpense ? 0 : 1);

  React.useEffect(() => {
    slidePosition.value = withSpring(isExpense ? 0 : 1, {
      damping: 18,
      stiffness: 280,
    });
  }, [isExpense]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${slidePosition.value * 50}%` as any,
  }));

  const indicatorColorStyle = useAnimatedStyle(() => {
    const progress = slidePosition.value;
    // Crossfade between expense (red) and income (green)
    return {
      backgroundColor: progress < 0.5 ? colors.expense : colors.income,
    };
  });

  return (
    <View
      className="mb-4 flex-row overflow-hidden rounded-2xl p-1"
      style={{ backgroundColor: colors.muted }}
    >
      {/* Sliding indicator */}
      <Animated.View
        style={[
          indicatorStyle,
          indicatorColorStyle,
          {
            position: 'absolute',
            top: 4,
            bottom: 4,
            width: '48.5%',
            borderRadius: 14,
          },
        ]}
      />

      {/* Expense */}
      <Pressable
        onPress={() => onChange('expense')}
        accessibilityRole="radio"
        accessibilityLabel="Expense"
        accessibilityState={{ selected: isExpense }}
        className="z-10 flex-1 flex-row items-center justify-center gap-2 py-3"
      >
        <ArrowUpRight
          size={18}
          color={isExpense ? '#FFFFFF' : colors.mutedForeground}
        />
        <Text
          className="text-sm font-bold"
          style={{ color: isExpense ? '#FFFFFF' : colors.mutedForeground }}
        >
          Expense
        </Text>
      </Pressable>

      {/* Income */}
      <Pressable
        onPress={() => onChange('income')}
        accessibilityRole="radio"
        accessibilityLabel="Income"
        accessibilityState={{ selected: !isExpense }}
        className="z-10 flex-1 flex-row items-center justify-center gap-2 py-3"
      >
        <ArrowDownLeft
          size={18}
          color={!isExpense ? '#FFFFFF' : colors.mutedForeground}
        />
        <Text
          className="text-sm font-bold"
          style={{ color: !isExpense ? '#FFFFFF' : colors.mutedForeground }}
        >
          Income
        </Text>
      </Pressable>
    </View>
  );
}
