import React from 'react';
import { View, Text, ViewProps } from 'react-native';

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
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
};

const variantTextStyles: Record<BadgeVariant, string> = {
  default: 'text-white',
  secondary: 'text-secondary-foreground',
  destructive: 'text-white',
  outline: 'text-foreground',
  success: 'text-white',
  warning: 'text-white',
};

export function Badge({ variant = 'default', children, className, ...props }: BadgeProps) {
  return (
    <View
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        ${variantStyles[variant]}
        ${className || ''}
      `}
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

const accountTypeColors: Record<string, string> = {
  debit: 'bg-green-500',
  credit: 'bg-orange-500',
  owed: 'bg-blue-500',
  debt: 'bg-red-500',
};

const accountTypeLabels: Record<string, string> = {
  debit: 'Debit',
  credit: 'Credit',
  owed: 'Owed',
  debt: 'Debt',
};

export function AccountTypeBadge({ type }: AccountTypeBadgeProps) {
  return (
    <View className={`inline-flex items-center rounded-full px-2.5 py-0.5 ${accountTypeColors[type]}`}>
      <Text className="text-xs font-semibold text-white">
        {accountTypeLabels[type]}
      </Text>
    </View>
  );
}
