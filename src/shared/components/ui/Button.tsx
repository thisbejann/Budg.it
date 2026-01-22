import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-primary',
  destructive: 'bg-destructive',
  outline: 'border border-input bg-background',
  secondary: 'bg-secondary',
  ghost: 'bg-transparent',
  link: 'bg-transparent',
};

const variantTextStyles: Record<ButtonVariant, string> = {
  default: 'text-white',
  destructive: 'text-white',
  outline: 'text-foreground',
  secondary: 'text-foreground',
  ghost: 'text-foreground',
  link: 'text-primary underline',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-12 px-4 py-3',
  sm: 'h-9 px-3 py-2',
  lg: 'h-14 px-8 py-4',
  icon: 'h-10 w-10',
};

const sizeTextStyles: Record<ButtonSize, string> = {
  default: 'text-base',
  sm: 'text-sm',
  lg: 'text-lg',
  icon: 'text-base',
};

export function Button({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`
        flex-row items-center justify-center rounded-lg
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDisabled ? 'opacity-50' : ''}
        ${className || ''}
      `}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'default' || variant === 'destructive' ? '#fff' : '#3b82f6'}
          size="small"
        />
      ) : typeof children === 'string' ? (
        <Text
          className={`
            font-semibold
            ${variantTextStyles[variant]}
            ${sizeTextStyles[size]}
          `}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export function IconButton({
  variant = 'ghost',
  size = 'icon',
  ...props
}: Omit<ButtonProps, 'size'> & { size?: ButtonSize }) {
  return <Button variant={variant} size={size} {...props} />;
}
