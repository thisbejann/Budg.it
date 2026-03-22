import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Alert } from 'react-native';
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
} from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import {
  Button,
  Input,
  DateInput,
  TimeInput,
  Select,
  SelectOption,
  CategoryPicker,
  TransactionTypeToggle,
  NumberPad,
  Card,
  CardContent,
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
import { useMutationCloseGuard, usePreventNavigationWhilePending } from '../../../shared/hooks';
import { safeCloseAfterMutation } from '../../../shared/utils';

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
  const [appliedTemplateId, setAppliedTemplateId] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const submissionGuard = useMutationCloseGuard();

  const templateId = (route.params as any)?.templateId;
  const initialAccountId = (route.params as any)?.accountId;

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

  usePreventNavigationWhilePending(isLoading, submissionGuard.closeAfterRef);

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

      // Pre-select account if provided (and no template)
      if (initialAccountId && !templateId) {
        setValue('account_id', initialAccountId);
      }

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

  const onSubmit = async (data: TransactionFormData) => {
    if (!activeLedgerId) return;
    if (!submissionGuard.start()) return;

    setIsLoading(true);
    try {
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

      safeCloseAfterMutation(navigation, submissionGuard.closeAfterRef);
    } catch (error) {
      submissionGuard.finish();
      setIsLoading(false);
      console.error('Error creating transaction:', error);
      Alert.alert('Error', 'Failed to create transaction');
    }
  };

  const accountOptions = useMemo<SelectOption[]>(() =>
    accounts.map(acc => ({ label: acc.name, value: acc.id })),
    [accounts]
  );

  const filteredCategories = useMemo(() =>
    categories.filter(cat => cat.type === selectedType),
    [categories, selectedType]
  );

  const selectedCategory = useMemo(() =>
    filteredCategories.find(c => c.id === selectedCategoryId),
    [filteredCategories, selectedCategoryId]
  );

  const subcategoryOptions = useMemo<SelectOption[]>(() =>
    selectedCategory?.subcategories.map(sub => ({ label: sub.name, value: sub.id })) || [],
    [selectedCategory]
  );

  const amountValue = watch('amount');

  return (
    <Screen scrollable={false}>
      <Header title="Add Transaction" showClose disableClose={isLoading} />

      <View className="flex-1">
        {/* Scrollable Content */}
        <KeyboardAwareScrollView
          className="flex-1 px-4"
          keyboardShouldPersistTaps="handled"
          bottomOffset={20}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {/* Type Toggle + Amount */}
          <View className="items-center pt-2 pb-3">
            <TransactionTypeToggle
              value={selectedType}
              onChange={(type) => setValue('type', type)}
            />
            <View className="flex-row items-baseline">
              <Text
                className="text-xl"
                style={{ color: colors.mutedForeground }}
              >
                ₱
              </Text>
              <Text
                className="font-bold"
                style={{
                  fontSize: 48,
                  lineHeight: 56,
                  color: amountValue ? colors.foreground : colors.mutedForeground,
                }}
              >
                {amountValue || '0.00'}
              </Text>
            </View>
            {errors.amount && (
              <Text className="mt-1 text-xs" style={{ color: colors.destructive }}>
                {errors.amount.message}
              </Text>
            )}
          </View>

          {/* Category */}
          <View className="mb-3">
            <Controller
              control={control}
              name="category_id"
              render={({ field: { onChange, value } }) => (
                <CategoryPicker
                  label="Category"
                  value={value}
                  categories={filteredCategories}
                  onValueChange={v => {
                    onChange(v);
                    setValue('subcategory_id', undefined);
                  }}
                />
              )}
            />
            {subcategoryOptions.length > 0 && (
              <View className="mt-2">
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
          </View>

          {/* Account */}
          <Card className="mb-3">
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Date & Time Card */}
          <Card className="mb-3">
            <CardContent>
              <View className="flex-row gap-3">
                <View className="flex-1">
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
                <View className="flex-1">
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
              </View>
            </CardContent>
          </Card>

          {/* Notes */}
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
        </KeyboardAwareScrollView>

        {/* Fixed Bottom: NumberPad + Submit */}
        <View className="px-4 pb-4 pt-2" style={{ gap: 12 }}>
          <NumberPad
            value={amountValue}
            onValueChange={(v) => setValue('amount', v)}
          />
          <Button onPress={handleSubmit(onSubmit)} loading={isLoading}>
            Add Transaction
          </Button>
        </View>
      </View>
    </Screen>
  );
}


