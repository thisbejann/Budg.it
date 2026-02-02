import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../types/navigation';
import type { AccountWithPerson, CategoryWithSubcategories, TransactionTemplateWithDetails } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, CurrencyInput, Input, Select, SelectOption } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { TemplateRepository, AccountRepository, CategoryRepository } from '../../../database/repositories';
import { COLORS, CATEGORY_COLORS } from '../../../constants/colors';
import { CATEGORY_ICONS } from '../../../constants/icons';
import { useTheme } from '../../../hooks/useColorScheme';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditTemplateRouteProp = RouteProp<RootStackParamList, 'EditTemplate'>;

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: z.enum(['expense', 'income']),
  account_id: z.number().optional(),
  category_id: z.number().optional(),
  subcategory_id: z.number().optional(),
  amount: z.string().optional(),
  notes: z.string().optional(),
  icon: z.string(),
  color: z.string(),
});

type TemplateFormSchema = z.infer<typeof templateSchema>;

export function EditTemplateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditTemplateRouteProp>();
  const templateId = route.params.templateId;
  const { activeLedgerId } = useLedgerStore();
  const { colors } = useTheme();

  const [template, setTemplate] = useState<TransactionTemplateWithDetails | null>(null);
  const [accounts, setAccounts] = useState<AccountWithPerson[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
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
  } = useForm<TemplateFormSchema>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      type: 'expense',
      icon: 'file-text',
      color: CATEGORY_COLORS[0],
      amount: '',
      notes: '',
    },
  });

  const selectedType = watch('type');
  const selectedCategoryId = watch('category_id');
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  useEffect(() => {
    loadData();
  }, [templateId]);

  const loadData = async () => {
    if (!activeLedgerId) return;

    try {
      setIsLoadingData(true);
      const [tmpl, accts, cats] = await Promise.all([
        TemplateRepository.getById(templateId),
        AccountRepository.getAllByLedger(activeLedgerId),
        CategoryRepository.getAllWithSubcategories(),
      ]);

      if (!tmpl) {
        Alert.alert('Error', 'Template not found');
        navigation.goBack();
        return;
      }

      setTemplate(tmpl);
      setAccounts(accts);
      setCategories(cats);

      reset({
        name: tmpl.name,
        type: tmpl.type,
        account_id: tmpl.account_id || undefined,
        category_id: tmpl.category_id || undefined,
        subcategory_id: tmpl.subcategory_id || undefined,
        amount: tmpl.amount?.toString() || '',
        notes: tmpl.notes || '',
        icon: tmpl.icon,
        color: tmpl.color,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load template');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: TemplateFormSchema) => {
    try {
      setIsLoading(true);

      await TemplateRepository.update(templateId, {
        name: data.name,
        type: data.type,
        account_id: data.account_id,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        notes: data.notes,
        icon: data.icon,
        color: data.color,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error updating template:', error);
      Alert.alert('Error', 'Failed to update template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TemplateRepository.delete(templateId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting template:', error);
              Alert.alert('Error', 'Failed to delete template');
            }
          },
        },
      ]
    );
  };

  const accountOptions: SelectOption[] = accounts.map((acc) => ({
    label: acc.name,
    value: acc.id,
  }));

  const filteredCategories = categories.filter((cat) => cat.type === selectedType);
  const categoryOptions: SelectOption[] = filteredCategories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  const selectedCategory = filteredCategories.find((c) => c.id === selectedCategoryId);
  const subcategoryOptions: SelectOption[] =
    selectedCategory?.subcategories.map((sub) => ({
      label: sub.name,
      value: sub.id,
    })) || [];

  const IconComponent = (LucideIcons as any)[
    selectedIcon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
  ] || LucideIcons.FileText;

  if (isLoadingData) {
    return (
      <Screen>
        <Header title="Edit Template" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <Header title="Edit Template" showBack />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Usage Stats */}
        {template && (
          <View className="mb-4 rounded-xl bg-secondary p-3">
            <Text className="text-sm text-muted-foreground">
              Used {template.usage_count} times
              {template.last_used_at && ` • Last used: ${template.last_used_at.split('T')[0]}`}
            </Text>
          </View>
        )}

        {/* Name */}
        <View className="mb-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Template Name"
                placeholder="e.g., Morning Coffee"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />
        </View>

        {/* Type Toggle */}
        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium text-foreground">Type</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => {
                setValue('type', 'expense');
                setValue('category_id', undefined);
                setValue('subcategory_id', undefined);
              }}
              className={`flex-1 items-center rounded-lg py-3 ${
                selectedType === 'expense' ? 'bg-red-500' : 'bg-secondary'
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedType === 'expense' ? 'text-white' : 'text-foreground'
                }`}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setValue('type', 'income');
                setValue('category_id', undefined);
                setValue('subcategory_id', undefined);
              }}
              className={`flex-1 items-center rounded-lg py-3 ${
                selectedType === 'income' ? 'bg-green-500' : 'bg-secondary'
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedType === 'income' ? 'text-white' : 'text-foreground'
                }`}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>
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
              {CATEGORY_ICONS.slice(0, 40).map((iconName) => {
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
                      color={selectedIcon === iconName ? '#ffffff' : colors.foreground}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Amount (Optional) */}
        <View className="mb-4">
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <CurrencyInput
                label="Default Amount (optional)"
                placeholder="0.00"
                value={value || ''}
                onChangeValue={onChange}
              />
            )}
          />
        </View>

        {/* Account (Optional) */}
        <View className="mb-4">
          <Controller
            control={control}
            name="account_id"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Default Account (optional)"
                placeholder="Select account"
                value={value}
                options={accountOptions}
                onValueChange={onChange}
              />
            )}
          />
        </View>

        {/* Category (Optional) */}
        <View className="mb-4">
          <Controller
            control={control}
            name="category_id"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Default Category (optional)"
                placeholder="Select category"
                value={value}
                options={categoryOptions}
                onValueChange={(v) => {
                  onChange(v);
                  setValue('subcategory_id', undefined);
                }}
              />
            )}
          />
        </View>

        {/* Subcategory */}
        {subcategoryOptions.length > 0 && (
          <View className="mb-4">
            <Controller
              control={control}
              name="subcategory_id"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Default Subcategory (optional)"
                  placeholder="Select subcategory"
                  value={value}
                  options={subcategoryOptions}
                  onValueChange={onChange}
                />
              )}
            />
          </View>
        )}

        {/* Notes */}
        <View className="mb-6">
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Default Notes (optional)"
                value={value}
                onChangeText={onChange}
                placeholder="Add a note"
                multiline
                numberOfLines={2}
              />
            )}
          />
        </View>

        {/* Submit */}
        <Button onPress={handleSubmit(onSubmit)} loading={isLoading}>
          Save Changes
        </Button>

        {/* Delete */}
        <View className="mt-4">
          <Button variant="destructive" onPress={handleDelete}>
            Delete Template
          </Button>
        </View>

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}
