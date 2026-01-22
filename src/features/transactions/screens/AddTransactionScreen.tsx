import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { AccountWithPerson, CategoryWithSubcategories } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, CurrencyInput, Input, Select, SelectOption } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { TransactionRepository, AccountRepository, CategoryRepository, TemplateRepository } from '../../../database/repositories';
import { getToday, getCurrentTime } from '../../../shared/utils/date';
import { COLORS } from '../../../constants/colors';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const transactionSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  account_id: z.number({ required_error: 'Account is required' }),
  category_id: z.number().optional(),
  subcategory_id: z.number().optional(),
  type: z.enum(['expense', 'income']),
  date: z.string(),
  time: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export function AddTransactionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { activeLedgerId } = useLedgerStore();

  const [accounts, setAccounts] = useState<AccountWithPerson[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const templateId = (route.params as any)?.templateId;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: '',
      type: 'expense',
      date: getToday(),
      time: getCurrentTime(),
    },
  });

  const selectedType = watch('type');
  const selectedCategoryId = watch('category_id');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!activeLedgerId) return;

    try {
      const [accts, cats] = await Promise.all([
        AccountRepository.getAllByLedger(activeLedgerId),
        CategoryRepository.getAllWithSubcategories(),
      ]);

      setAccounts(accts);
      setCategories(cats);

      // Load template if provided
      if (templateId) {
        const template = await TemplateRepository.getById(templateId);
        if (template) {
          if (template.amount) setValue('amount', template.amount.toString());
          if (template.account_id) setValue('account_id', template.account_id);
          if (template.category_id) setValue('category_id', template.category_id);
          if (template.subcategory_id) setValue('subcategory_id', template.subcategory_id);
          setValue('type', template.type);
          if (template.notes) setValue('notes', template.notes);

          // Increment template usage
          await TemplateRepository.incrementUsage(templateId);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    if (!activeLedgerId) return;

    try {
      setIsLoading(true);

      await TransactionRepository.create(activeLedgerId, {
        account_id: data.account_id,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id,
        amount: parseFloat(data.amount),
        type: data.type,
        date: data.date,
        time: data.time,
        notes: data.notes,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('Error', 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
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

  return (
    <Screen scrollable={false}>
      <Header title="Add Transaction" showClose />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Type Toggle */}
        <View className="mb-4 flex-row gap-2">
          <TouchableOpacity
            onPress={() => setValue('type', 'expense')}
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
            onPress={() => setValue('type', 'income')}
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

        {/* Amount */}
        <View className="mb-4">
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <CurrencyInput
                label="Amount"
                placeholder="0.00"
                value={value}
                onChangeValue={onChange}
                error={errors.amount?.message}
              />
            )}
          />
        </View>

        {/* Account */}
        <View className="mb-4">
          <Controller
            control={control}
            name="account_id"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Account"
                placeholder="Select account"
                value={value}
                options={accountOptions}
                onValueChange={onChange}
                error={errors.account_id?.message}
              />
            )}
          />
        </View>

        {/* Category */}
        <View className="mb-4">
          <Controller
            control={control}
            name="category_id"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Category"
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
                  label="Subcategory"
                  placeholder="Select subcategory (optional)"
                  value={value}
                  options={subcategoryOptions}
                  onValueChange={onChange}
                />
              )}
            />
          </View>
        )}

        {/* Date */}
        <View className="mb-4">
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Date"
                value={value}
                onChangeText={onChange}
                placeholder="YYYY-MM-DD"
              />
            )}
          />
        </View>

        {/* Notes */}
        <View className="mb-6">
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Notes"
                value={value}
                onChangeText={onChange}
                placeholder="Add a note (optional)"
                multiline
                numberOfLines={2}
              />
            )}
          />
        </View>

        {/* Submit Button */}
        <Button onPress={handleSubmit(onSubmit)} loading={isLoading}>
          Add Transaction
        </Button>
      </ScrollView>
    </Screen>
  );
}
