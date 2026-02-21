import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, InteractionManager, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../types/navigation';
import type { Category } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, Input } from '../../../shared/components/ui';
import { CategoryRepository } from '../../../database/repositories';
import { CATEGORY_COLORS } from '../../../constants/colors';
import { CATEGORY_ICONS } from '../../../constants/icons';
import { useTheme } from '../../../hooks/useColorScheme';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditCategoryRouteProp = RouteProp<RootStackParamList, 'EditCategory'>;

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  icon: z.string(),
  color: z.string(),
});

type CategoryFormSchema = z.infer<typeof categorySchema>;

export function EditCategoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditCategoryRouteProp>();
  const categoryId = route.params.categoryId;
  const { colors } = useTheme();

  const [category, setCategory] = useState<Category | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormSchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: 'tag',
      color: CATEGORY_COLORS[0],
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      setIsLoadingData(true);
      const data = await CategoryRepository.getById(categoryId);

      if (!data) {
        Alert.alert('Error', 'Category not found');
        InteractionManager.runAfterInteractions(() => navigation.goBack());
        return;
      }

      setCategory(data);
      reset({
        name: data.name,
        icon: data.icon,
        color: data.color,
      });
    } catch (error) {
      console.error('Error loading category:', error);
      Alert.alert('Error', 'Failed to load category');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: CategoryFormSchema) => {
    setIsLoading(true);
    try {
      await CategoryRepository.update(categoryId, {
        name: data.name,
        icon: data.icon,
        color: data.color,
      });

      Keyboard.dismiss();
      InteractionManager.runAfterInteractions(() => navigation.goBack());
    } catch (error) {
      setIsLoading(false);
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category');
    }
  };

  const handleDelete = () => {
    if (category?.is_system) {
      Alert.alert('Cannot Delete', 'System categories cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? Transactions using this category will become uncategorized.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CategoryRepository.delete(categoryId);
              InteractionManager.runAfterInteractions(() => navigation.goBack());
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const IconComponent = (LucideIcons as any)[
    selectedIcon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
  ] || LucideIcons.Tag;

  if (isLoadingData) {
    return (
      <Screen>
        <Header title="Edit Category" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <Header title="Edit Category" showBack />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Category Type Badge */}
        {category && (
          <View className="mb-4 flex-row">
            <View
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor:
                  category.type === 'expense' ? colors.expense + '20' : colors.income + '20',
              }}
            >
              <Text
                style={{
                  color: category.type === 'expense' ? colors.expense : colors.income,
                }}
                className="text-sm font-medium"
              >
                {category.type === 'expense' ? 'Expense' : 'Income'} Category
              </Text>
            </View>
          </View>
        )}

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
                      color={selectedIcon === iconName ? colors.onPrimary : colors.foreground}
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
            Save Changes
          </Button>
        </View>

        {/* Delete Button */}
        {!category?.is_system && (
          <View className="mt-4">
            <Button variant="destructive" onPress={handleDelete}>
              Delete Category
            </Button>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}


