import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { useTheme } from '../../../hooks/useColorScheme';

export interface SelectOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string | number | null;
  options: SelectOption[];
  onValueChange: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
}

export function Select({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onValueChange,
  error,
  disabled,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (option: SelectOption) => {
    onValueChange(option.value);
    setIsOpen(false);
  };

  return (
    <View className="w-full">
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-foreground">
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        className={`
          flex-row items-center justify-between rounded-lg border bg-background px-3 py-3
          ${error ? 'border-destructive' : 'border-input'}
          ${disabled ? 'opacity-50' : ''}
        `}
        activeOpacity={0.7}
      >
        <View className="flex-1 flex-row items-center">
          {selectedOption?.icon && (
            <View className="mr-2">{selectedOption.icon}</View>
          )}
          <Text
            className={`text-base ${
              selectedOption ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {selectedOption?.label || placeholder}
          </Text>
        </View>
        <ChevronDown size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
      {error && (
        <Text className="mt-1 text-sm text-destructive">{error}</Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-black/50">
          <View className="mt-auto max-h-[70%] rounded-t-3xl bg-background">
            <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
              <Text className="text-lg font-semibold text-foreground">
                {label || 'Select'}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <X size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className={`
                    flex-row items-center justify-between px-4 py-3
                    ${item.value === value ? 'bg-secondary' : ''}
                  `}
                  activeOpacity={0.7}
                >
                  <View className="flex-1 flex-row items-center">
                    {item.icon && <View className="mr-3">{item.icon}</View>}
                    <Text className="text-base text-foreground">
                      {item.label}
                    </Text>
                  </View>
                  {item.value === value && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View className="h-px bg-border" />
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
