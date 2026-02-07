import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { useTheme } from '../../../hooks/useColorScheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, style, ...props }, ref) => {
    const { colors } = useTheme();

    const containerStyle = {
      backgroundColor: colors.surfaceVariant,
      borderColor: error ? colors.destructive : colors.outline,
      borderWidth: 1,
      borderRadius: 12,
    };

    return (
      <View className="w-full">
        {label && (
          <Text
            className="mb-1.5 text-sm font-medium"
            style={{ color: colors.foreground }}
          >
            {label}
          </Text>
        )}
        <View
          className={`flex-row items-center px-3 ${props.editable === false ? 'opacity-50' : ''}`}
          style={containerStyle}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className={`flex-1 py-3 text-base ${className || ''}`}
            style={[{ color: colors.foreground }, style]}
            placeholderTextColor={colors.mutedForeground}
            {...props}
          />
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
        {error && (
          <Text
            className="mt-1 text-sm"
            style={{ color: colors.destructive }}
          >
            {error}
          </Text>
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
  const { colors } = useTheme();

  const handleChange = (text: string) => {
    // Remove non-numeric characters except decimal point
    let cleaned = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    // Strip leading zeros (keep "0" and "0.xx")
    if (parts[0].length > 1) {
      parts[0] = parts[0].replace(/^0+/, '') || '0';
      cleaned = parts.join('.');
    }
    onChangeValue(cleaned);
  };

  return (
    <Input
      value={value}
      onChangeText={handleChange}
      keyboardType="decimal-pad"
      leftIcon={<Text className="text-lg" style={{ color: colors.mutedForeground }}>₱</Text>}
      {...props}
    />
  );
}
