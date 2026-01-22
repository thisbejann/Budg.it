import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="mb-1.5 text-sm font-medium text-foreground">
            {label}
          </Text>
        )}
        <View
          className={`
            flex-row items-center rounded-lg border bg-background px-3
            ${error ? 'border-destructive' : 'border-input'}
            ${props.editable === false ? 'bg-muted opacity-50' : ''}
          `}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className={`
              flex-1 py-3 text-base text-foreground
              ${className || ''}
            `}
            placeholderTextColor="#9ca3af"
            {...props}
          />
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
        {error && (
          <Text className="mt-1 text-sm text-destructive">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

interface CurrencyInputProps extends Omit<InputProps, 'keyboardType'> {
  value: string;
  onChangeValue: (value: string) => void;
}

export function CurrencyInput({
  value,
  onChangeValue,
  ...props
}: CurrencyInputProps) {
  const handleChange = (text: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    onChangeValue(cleaned);
  };

  return (
    <Input
      value={value}
      onChangeText={handleChange}
      keyboardType="decimal-pad"
      leftIcon={<Text className="text-lg text-muted-foreground">₱</Text>}
      {...props}
    />
  );
}
