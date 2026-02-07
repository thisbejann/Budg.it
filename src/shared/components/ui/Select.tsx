import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Select as HeroSelect } from 'heroui-native';
import { ChevronDown } from 'lucide-react-native';
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
  const { colors } = useTheme();

  const selectedOption = options.find((opt) => opt.value === value);

  const handleValueChange = (selected: { value: string; label: string } | undefined) => {
    if (selected) {
      // Convert back to original type (number if it was a number)
      const originalOption = options.find((opt) => String(opt.value) === selected.value);
      if (originalOption) {
        onValueChange(originalOption.value);
      }
    }
  };

  return (
    <View className="w-full">
      {label && (
        <Text className="mb-1.5 text-sm font-medium" style={{ color: colors.foreground }}>
          {label}
        </Text>
      )}

      <HeroSelect
        value={selectedOption ? { value: String(selectedOption.value), label: selectedOption.label } : undefined}
        onValueChange={handleValueChange}
        isDisabled={disabled}
      >
        <HeroSelect.Trigger
          className={`flex-row items-center justify-between px-3 ${disabled ? 'opacity-50' : ''}`}
          style={{
            backgroundColor: colors.surfaceVariant,
            borderColor: error ? colors.destructive : colors.outline,
            borderWidth: 1,
            borderRadius: 12,
          }}
        >
          <View className="flex-1 flex-row items-center py-3">
            {selectedOption?.icon && (
              <View className="mr-2">{selectedOption.icon}</View>
            )}
            <HeroSelect.Value
              placeholder={placeholder}
              className="text-base"
              style={{ color: selectedOption ? colors.foreground : colors.mutedForeground }}
            />
          </View>
          <ChevronDown size={20} color={colors.mutedForeground} />
        </HeroSelect.Trigger>

        <HeroSelect.Portal>
          <HeroSelect.Overlay className="bg-black/50" />
          <HeroSelect.Content
            presentation="bottom-sheet"
            snapPoints={['50%', '75%']}
            enableDynamicSizing={false}
            backgroundClassName="rounded-t-3xl"
            handleIndicatorClassName="bg-muted-foreground/30 w-10"
            contentContainerClassName="pb-8"
          >
            {label && (
              <HeroSelect.ListLabel className="px-4 pt-2 pb-3 text-lg font-semibold text-foreground">
                {label}
              </HeroSelect.ListLabel>
            )}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <HeroSelect.Item
                  key={String(option.value)}
                  value={String(option.value)}
                  label={option.label}
                  className="mx-3 rounded-xl px-4 py-4"
                >
                  {({ isSelected }) => (
                    <>
                      <View className="flex-1 flex-row items-center">
                        {option.icon && <View className="mr-3">{option.icon}</View>}
                        <HeroSelect.ItemLabel
                          className={`text-base ${isSelected ? 'font-semibold text-primary' : 'text-foreground'}`}
                        />
                      </View>
                      <HeroSelect.ItemIndicator
                        iconProps={{ size: 20, color: colors.primary }}
                      />
                    </>
                  )}
                </HeroSelect.Item>
              ))}
            </ScrollView>
          </HeroSelect.Content>
        </HeroSelect.Portal>
      </HeroSelect>

      {error && (
        <Text className="mt-1 text-sm" style={{ color: colors.destructive }}>{error}</Text>
      )}
    </View>
  );
}
