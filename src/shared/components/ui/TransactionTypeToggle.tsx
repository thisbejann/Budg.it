import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { useTheme } from '../../../hooks/useColorScheme';

type TransactionType = 'expense' | 'income';

interface TransactionTypeToggleProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
}

const INDICATOR_PADDING = 4;

export function TransactionTypeToggle({ value, onChange }: TransactionTypeToggleProps) {
  const { colors } = useTheme();
  const isExpense = value === 'expense';
  const [containerWidth, setContainerWidth] = useState(0);

  const slidePosition = useSharedValue(isExpense ? 0 : 1);

  const halfWidth = containerWidth / 2;
  const indicatorWidth = halfWidth - INDICATOR_PADDING;

  React.useEffect(() => {
    slidePosition.value = withTiming(isExpense ? 0 : 1, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [isExpense]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slidePosition.value * halfWidth }],
  }));

  const indicatorColorStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      slidePosition.value,
      [0, 1],
      [colors.expense, colors.income]
    ),
  }));

  return (
    <View
      className="mb-4 flex-row overflow-hidden rounded-2xl p-1"
      style={{ backgroundColor: colors.muted }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Sliding indicator */}
      {containerWidth > 0 && (
        <Animated.View
          style={[
            indicatorStyle,
            indicatorColorStyle,
            {
              position: 'absolute',
              top: INDICATOR_PADDING,
              bottom: INDICATOR_PADDING,
              left: INDICATOR_PADDING,
              width: indicatorWidth,
              borderRadius: 14,
            },
          ]}
        />
      )}

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
