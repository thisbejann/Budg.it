import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../types/navigation';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, Input } from '../../../shared/components/ui';
import { CategoryRepository } from '../../../database/repositories';
import { COLORS, CATEGORY_COLORS } from '../../../constants/colors';
import { CATEGORY_ICONS } from '../../../constants/icons';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddCategoryRouteProp = RouteProp<RootStackParamList, 'AddCategory'>;

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  icon: z.string(),
  color: z.string(),
});

type CategoryFormSchema = z.infer<typeof categorySchema>;

export function AddCategoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddCategoryRouteProp>();
  const categoryType = route.params.type;

  const [isLoading, setIsLoading] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormSchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: 'tag',
      color: categoryType === 'expense' ? COLORS.expense : COLORS.income,
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  const onSubmit = async (data: CategoryFormSchema) => {
    try {
      setIsLoading(true);

      await CategoryRepository.create({
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: categoryType,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  const IconComponent = (LucideIcons as any)[
    selectedIcon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
  ] || LucideIcons.Tag;

  return (
    <Screen scrollable={false}>
      <Header title={`Add ${categoryType === 'expense' ? 'Expense' : 'Income'} Category`} showClose />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Name */}
        <View className="mb-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Category Name"
                placeholder="e.g., Food & Dining"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />
        </View>

        {/* Icon & Color Picker */}
        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium text-foreground">Icon & Color</Text>
          <View className="flex-row gap-3">
            {/* Icon Picker Button */}
            <TouchableOpacity
              onPress={() => setShowIconPicker(!showIconPicker)}
              className="h-14 w-14 items-center justify-center rounded-xl"
              style={{ backgroundColor: selectedColor }}
            >
              <IconComponent size={24} color="#ffffff" />
            </TouchableOpacity>

            {/* Color Options */}
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
              {CATEGORY_ICONS.map((iconName) => {
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
                      color={selectedIcon === iconName ? '#ffffff' : COLORS.foreground}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Submit Button */}
        <View className="mt-2">
          <Button onPress={handleSubmit(onSubmit)} loading={isLoading}>
            Create Category
          </Button>
        </View>

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}
