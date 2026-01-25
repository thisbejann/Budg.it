import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../../constants/colors';
import { useTheme } from '../../../hooks/useColorScheme';

type InputVariant = 'default' | 'glass';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: InputVariant;
}

const shouldUseFallback = () => {
  return Platform.OS === 'android' && Platform.Version < 31;
};

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, variant = 'default', ...props }, ref) => {
    const { isDark, glass, colors } = useTheme();
    const useFallback = shouldUseFallback();

    const renderInputContent = (additionalStyle?: object) => (
      <View
        className="flex-row items-center px-4"
        style={additionalStyle}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          ref={ref}
          className={`
            flex-1 py-4 text-base text-foreground
            ${className || ''}
          `}
          style={{ minHeight: 48 }}
          placeholderTextColor={colors.mutedForeground}
          {...props}
        />
        {rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>
    );

    const renderGlassInput = () => {
      const containerStyle = {
        borderRadius: 12,
        overflow: 'hidden' as const,
        borderWidth: 1,
        borderColor: error ? COLORS.destructive : glass.border,
      };

      if (useFallback) {
        return (
          <View
            style={[containerStyle, { backgroundColor: glass.card }]}
          >
            {renderInputContent()}
          </View>
        );
      }

      return (
        <View style={containerStyle}>
          <BlurView
            intensity={isDark ? 30 : 50}
            tint={isDark ? 'dark' : 'light'}
          >
            {renderInputContent()}
          </BlurView>
        </View>
      );
    };

    const renderDefaultInput = () => (
      <View
        className={`
          flex-row items-center rounded-xl border bg-background px-4
          ${error ? 'border-destructive' : 'border-input'}
          ${props.editable === false ? 'bg-muted opacity-50' : ''}
        `}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          ref={ref}
          className={`
            flex-1 py-4 text-base text-foreground
            ${className || ''}
          `}
          style={{ minHeight: 48 }}
          placeholderTextColor={colors.mutedForeground}
          {...props}
        />
        {rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>
    );

    return (
      <View className="w-full">
        {label && (
          <Text className="mb-2 text-sm font-medium text-foreground">
            {label}
          </Text>
        )}
        {variant === 'glass' ? renderGlassInput() : renderDefaultInput()}
        {error && (
          <Text className="mt-1.5 text-sm text-destructive">{error}</Text>
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
  variant = 'default',
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
      variant={variant}
      leftIcon={<Text className="text-lg text-muted-foreground">₱</Text>}
      {...props}
    />
  );
}
