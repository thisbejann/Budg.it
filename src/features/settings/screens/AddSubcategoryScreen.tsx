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
import { CATEGORY_ICONS } from '../../../constants/icons';
import { useTheme } from '../../../hooks/useColorScheme';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddSubcategoryRouteProp = RouteProp<RootStackParamList, 'AddSubcategory'>;

const subcategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  icon: z.string().optional(),
});

type SubcategoryFormSchema = z.infer<typeof subcategorySchema>;

export function AddSubcategoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddSubcategoryRouteProp>();
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
    formState: { errors },
  } = useForm<SubcategoryFormSchema>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: '',
      icon: '',
    },
  });

  const selectedIcon = watch('icon');

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
    } catch (error) {
      console.error('Error loading category:', error);
      Alert.alert('Error', 'Failed to load category');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: SubcategoryFormSchema) => {
    setIsLoading(true);
    try {
      await CategoryRepository.createSubcategory({
        category_id: categoryId,
        name: data.name,
        icon: data.icon || undefined,
      });

      Keyboard.dismiss();
      InteractionManager.runAfterInteractions(() => navigation.goBack());
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating subcategory:', error);
      Alert.alert('Error', 'Failed to create subcategory');
    }
  };

  const IconComponent = selectedIcon
    ? (LucideIcons as any)[
        selectedIcon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
      ]
    : null;

  if (isLoadingData) {
    return (
      <Screen>
        <Header title="Add Subcategory" showClose />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <Header title="Add Subcategory" showClose />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Parent Category Info */}
        {category && (
          <View className="mb-4 flex-row items-center gap-3 rounded-xl bg-secondary p-3">
            {(() => {
              const ParentIcon = (LucideIcons as any)[
                category.icon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
              ] || LucideIcons.Tag;
              return (
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: category.color }}
                >
                  <ParentIcon size={18} color="#ffffff" />
                </View>
              );
            })()}
            <View>
              <Text className="text-xs text-muted-foreground">Parent Category</Text>
              <Text className="font-medium text-foreground">{category.name}</Text>
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
                label="Subcategory Name"
                placeholder="e.g., Fast Food"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />
        </View>

        {/* Icon Picker (Optional) */}
        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium text-foreground">Icon (Optional)</Text>
          <TouchableOpacity
            onPress={() => setShowIconPicker(!showIconPicker)}
            className="flex-row items-center gap-3 rounded-xl border border-border p-3"
          >
            {IconComponent ? (
              <View
                className="h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: category?.color || colors.primary }}
              >
                <IconComponent size={20} color="#ffffff" />
              </View>
            ) : (
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <LucideIcons.Plus size={20} color={colors.mutedForeground} />
              </View>
            )}
            <Text className="flex-1 text-foreground">
              {selectedIcon ? 'Change icon' : 'Select an icon'}
            </Text>
            {selectedIcon && (
              <TouchableOpacity
                onPress={() => setValue('icon', '')}
                className="p-1"
              >
                <LucideIcons.X size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Icon Grid */}
        {showIconPicker && (
          <View className="mb-4 rounded-xl bg-secondary p-3">
            <Text className="mb-2 text-sm font-medium text-foreground">Select Icon</Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORY_ICONS.slice(0, 50).map((iconName) => {
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
            Create Subcategory
          </Button>
        </View>

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}


