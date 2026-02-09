import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { useTheme } from '../../../hooks/useColorScheme';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', children, className, style, ...props }: BadgeProps) {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'default':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'destructive':
        return colors.destructive;
      case 'outline':
        return 'transparent';
      case 'success':
        return colors.income;
      case 'warning':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'default':
        return colors.primaryForeground;
      case 'secondary':
        return colors.secondaryForeground;
      case 'destructive':
        return colors.destructiveForeground;
      case 'outline':
        return colors.foreground;
      case 'success':
        return '#ffffff';
      case 'warning':
        return '#ffffff';
      default:
        return colors.primaryForeground;
    }
  };

  return (
    <View
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        ${variant === 'outline' ? 'border' : ''}
        ${className || ''}
      `}
      style={[
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && { borderColor: colors.border },
        style,
      ]}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className="text-xs font-semibold" style={{ color: getTextColor() }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

// Transaction type badges
export function ExpenseBadge() {
  return <Badge variant="destructive">Expense</Badge>;
}

export function IncomeBadge() {
  return <Badge variant="success">Income</Badge>;
}

// Account type badges
interface AccountTypeBadgeProps {
  type: 'debit' | 'credit' | 'owed' | 'debt';
}

const accountTypeLabels: Record<string, string> = {
  debit: 'Debit',
  credit: 'Credit',
  owed: 'Owed',
  debt: 'Debt',
};

export function AccountTypeBadge({ type }: AccountTypeBadgeProps) {
  const { colors } = useTheme();

  const bgColor =
    type === 'debit' ? colors.accountDebit :
    type === 'credit' ? colors.accountCredit :
    type === 'owed' ? colors.accountOwed : colors.accountDebt;

  return (
    <View
      className="inline-flex items-center rounded-full px-2.5 py-0.5"
      style={{ backgroundColor: bgColor }}
    >
      <Text className="text-xs font-semibold" style={{ color: '#ffffff' }}>
        {accountTypeLabels[type]}
      </Text>
    </View>
  );
}
