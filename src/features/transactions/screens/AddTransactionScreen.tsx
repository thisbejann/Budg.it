import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type {
  AccountWithPerson,
  CategoryWithSubcategories,
  TransactionTemplateWithDetails,
} from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import {
  Button,
  CurrencyInput,
  Input,
  DateInput,
  TimeInput,
  Select,
  SelectOption,
} from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import {
  TransactionRepository,
  AccountRepository,
  CategoryRepository,
  TemplateRepository,
} from '../../../database/repositories';
import { getToday, getCurrentTime } from '../../../shared/utils/date';
import { useTheme } from '../../../hooks/useColorScheme';
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
  const { colors } = useTheme();

  const [accounts, setAccounts] = useState<AccountWithPerson[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [templates, setTemplates] = useState<TransactionTemplateWithDetails[]>([]);
  const [appliedTemplateId, setAppliedTemplateId] = useState<number | null>(null);
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
      const [accts, cats, tmpls] = await Promise.all([
        AccountRepository.getAllByLedger(activeLedgerId),
        CategoryRepository.getAllWithSubcategories(),
        TemplateRepository.getPopular(activeLedgerId),
      ]);

      setAccounts(accts);
      setCategories(cats);
      setTemplates(tmpls);

      // Load template if provided
      if (templateId) {
        const template = await TemplateRepository.getById(templateId);
        if (template) {
          setValue('amount', template.amount ? template.amount.toString() : '');
          setValue('account_id', template.account_id as any);
          setValue('category_id', template.category_id ?? undefined);
          setValue('subcategory_id', template.subcategory_id ?? undefined);
          setValue('type', template.type);
          setValue('notes', template.notes ?? '');
          setAppliedTemplateId(template.id);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const applyTemplate = (template: TransactionTemplateWithDetails) => {
    setValue('amount', template.amount ? template.amount.toString() : '');
    setValue('account_id', template.account_id as any);
    setValue('category_id', template.category_id ?? undefined);
    setValue('subcategory_id', template.subcategory_id ?? undefined);
    setValue('type', template.type);
    setValue('notes', template.notes ?? '');
    setAppliedTemplateId(template.id);
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

      if (appliedTemplateId) {
        await TemplateRepository.incrementUsage(appliedTemplateId);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('Error', 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const accountOptions: SelectOption[] = accounts.map(acc => ({
    label: acc.name,
    value: acc.id,
  }));

  const filteredCategories = categories.filter(
    cat => cat.type === selectedType,
  );
  const categoryOptions: SelectOption[] = filteredCategories.map(cat => ({
    label: cat.name,
    value: cat.id,
  }));

  const selectedCategory = filteredCategories.find(
    c => c.id === selectedCategoryId,
  );
  const subcategoryOptions: SelectOption[] =
    selectedCategory?.subcategories.map(sub => ({
      label: sub.name,
      value: sub.id,
    })) || [];

  return (
    <Screen scrollable={false}>
      <Header title="Add Transaction" showClose />

      <KeyboardAwareScrollView
        className="flex-1 px-4 py-4"
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Quick Templates */}
        {templates.length > 0 && !templateId && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            contentContainerStyle={{ gap: 8 }}
          >
            {templates.map(template => {
              const iconName = template.icon
                .split('-')
                .map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)))
                .join('');
              const IconComponent =
                (LucideIcons as any)[iconName] || LucideIcons.Bookmark;

              return (
                <TouchableOpacity
                  key={template.id}
                  onPress={() => applyTemplate(template)}
                  className="flex-row items-center gap-2 rounded-full border border-border px-3 py-2"
                >
                  <View
                    className="h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: template.color }}
                  >
                    <IconComponent size={14} color="#ffffff" />
                  </View>
                  <Text className="text-sm text-foreground">{template.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Type Toggle */}
        <View className="mb-4 flex-row gap-2">
          <TouchableOpacity
            onPress={() => setValue('type', 'expense')}
            className={`flex-1 items-center rounded-lg py-3 ${
              selectedType === 'expense' ? '' : 'bg-secondary'
            }`}
            style={selectedType === 'expense' ? { backgroundColor: colors.expense } : undefined}
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
              selectedType === 'income' ? '' : 'bg-secondary'
            }`}
            style={selectedType === 'income' ? { backgroundColor: colors.income } : undefined}
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
                onValueChange={v => {
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
              <DateInput
                label="Date"
                value={value}
                onChangeValue={onChange}
              />
            )}
          />
        </View>

        {/* Time */}
        <View className="mb-4">
          <Controller
            control={control}
            name="time"
            render={({ field: { onChange, value } }) => (
              <TimeInput
                label="Time"
                value={value}
                onChangeValue={onChange}
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
        <View className="mt-2">
          <Button onPress={handleSubmit(onSubmit)} loading={isLoading}>
            Add Transaction
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
