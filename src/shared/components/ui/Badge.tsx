import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { useTheme } from '../../../hooks/useColorScheme';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary',
  secondary: 'bg-secondary',
  destructive: 'bg-destructive',
  outline: 'border border-input bg-transparent',
  success: '',
  warning: '',
};

const variantTextStyles: Record<BadgeVariant, string> = {
  default: 'text-white',
  secondary: 'text-secondary-foreground',
  destructive: 'text-white',
  outline: 'text-foreground',
  success: 'text-white',
  warning: 'text-white',
};

export function Badge({ variant = 'default', children, className, style, ...props }: BadgeProps) {
  const { colors } = useTheme();

  const bgColor = variant === 'success' ? colors.income : variant === 'warning' ? '#eab308' : undefined;

  return (
    <View
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        ${variantStyles[variant]}
        ${className || ''}
      `}
      style={[bgColor ? { backgroundColor: bgColor } : undefined, style]}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={`text-xs font-semibold ${variantTextStyles[variant]}`}>
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
      <Text className="text-xs font-semibold text-white">
        {accountTypeLabels[type]}
      </Text>
    </View>
  );
}
