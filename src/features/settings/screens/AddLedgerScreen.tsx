import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, InteractionManager, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, Input } from '../../../shared/components/ui';
import { LedgerRepository } from '../../../database/repositories';
import { CATEGORY_COLORS } from '../../../constants/colors';
import { LEDGER_ICONS } from '../../../constants/icons';
import { useTheme } from '../../../hooks/useColorScheme';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ledgerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  description: z.string().optional(),
  icon: z.string(),
  color: z.string(),
});

type LedgerFormSchema = z.infer<typeof ledgerSchema>;

export function AddLedgerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LedgerFormSchema>({
    resolver: zodResolver(ledgerSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: 'wallet',
      color: CATEGORY_COLORS[0],
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  const onSubmit = async (data: LedgerFormSchema) => {
    setIsLoading(true);
    try {
      await LedgerRepository.create({
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
      });

      Keyboard.dismiss();
      InteractionManager.runAfterInteractions(() => navigation.goBack());
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating ledger:', error);
      Alert.alert('Error', 'Failed to create ledger');
    }
  };

  const IconComponent = (LucideIcons as any)[
    selectedIcon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
  ] || LucideIcons.Wallet;

  return (
    <Screen scrollable={false}>
      <Header title="Add Ledger" showClose />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Name */}
        <View className="mb-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Ledger Name"
                placeholder="e.g., Personal, Business"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description (optional)"
                placeholder="What is this ledger for?"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={2}
              />
            )}
          />
        </View>

        {/* Icon & Color */}
        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium text-foreground">Icon & Color</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowIconPicker(!showIconPicker)}
              className="h-14 w-14 items-center justify-center rounded-xl"
              style={{ backgroundColor: selectedColor }}
            >
              <IconComponent size={24} color="#ffffff" />
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
              <View className="flex-row gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setValue('color', color)}
                    className={`h-10 w-10 rounded-full ${
                      selectedColor === color ? 'border-2 border-foreground' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Icon Grid */}
        {showIconPicker && (
          <View className="mb-4 rounded-xl bg-secondary p-3">
            <Text className="mb-2 text-sm font-medium text-foreground">Select Icon</Text>
            <View className="flex-row flex-wrap gap-2">
              {LEDGER_ICONS.map((iconName) => {
                const IconComp = (LucideIcons as any)[
                  iconName.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
                ];
                if (!IconComp) return null;
                return (
                  <TouchableOpacity
                    key={iconName}
                    onPress={() => {
                      setValue('icon', iconName);
                      setShowIconPicker(false);
                    }}
                    className={`h-10 w-10 items-center justify-center rounded-lg ${
                      selectedIcon === iconName ? 'bg-primary' : 'bg-background'
                    }`}
                  >
                    <IconComp
                      size={20}
                      color={selectedIcon === iconName ? colors.onPrimary : colors.foreground}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Submit */}
        <View className="mt-2">
          <Button onPress={handleSubmit(onSubmit)} loading={isLoading}>
            Create Ledger
          </Button>
        </View>

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}


