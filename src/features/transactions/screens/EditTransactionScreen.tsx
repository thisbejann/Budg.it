import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../types/navigation';
import type { AccountWithPerson, CategoryWithSubcategories, TransactionWithDetails } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, Input, DateInput, TimeInput, Select, SelectOption, CategoryPicker, TransactionTypeToggle, NumberPad, Card, CardContent } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { TransactionRepository, AccountRepository, CategoryRepository } from '../../../database/repositories';
import { useTheme } from '../../../hooks/useColorScheme';
import { useMutationCloseGuard } from '../../../shared/hooks';
import { safeCloseAfterMutation } from '../../../shared/utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditTransactionRouteProp = RouteProp<RootStackParamList, 'EditTransaction'>;

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

export function EditTransactionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditTransactionRouteProp>();
  const transactionId = route.params.transactionId;
  const { activeLedgerId } = useLedgerStore();
  const { colors } = useTheme();

  const [transaction, setTransaction] = useState<TransactionWithDetails | null>(null);
  const [accounts, setAccounts] = useState<AccountWithPerson[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const submissionGuard = useMutationCloseGuard();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: '',
      type: 'expense',
      date: '',
      time: '',
    },
  });

  const selectedType = watch('type');
  const selectedCategoryId = watch('category_id');

  useEffect(() => {
    loadData();
  }, [transactionId]);

  const loadData = async () => {
    if (!activeLedgerId) return;

    try {
      setIsLoadingData(true);
      const [txn, accts, cats] = await Promise.all([
        TransactionRepository.getById(transactionId),
        AccountRepository.getAllByLedger(activeLedgerId),
        CategoryRepository.getAllWithSubcategories(),
      ]);

      if (!txn) {
        Alert.alert('Error', 'Transaction not found');
        safeCloseAfterMutation(navigation);
        return;
      }

      setTransaction(txn);
      setAccounts(accts);
      setCategories(cats);

      reset({
        amount: txn.amount.toString(),
        account_id: txn.account_id,
        category_id: txn.category_id || undefined,
        subcategory_id: txn.subcategory_id || undefined,
        type: txn.type,
        date: txn.date,
        time: txn.time || '',
        notes: txn.notes || '',
      });
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load transaction');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    if (!submissionGuard.start()) return;

    setIsLoading(true);
    try {
      await TransactionRepository.update(transactionId, {
        account_id: data.account_id,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id,
        amount: parseFloat(data.amount),
        type: data.type,
        date: data.date,
        time: data.time,
        notes: data.notes,
      });

      safeCloseAfterMutation(navigation, submissionGuard.closeAfterRef);
    } catch (error) {
      submissionGuard.finish();
      setIsLoading(false);
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction');
    }
  };

  const accountOptions: SelectOption[] = accounts.map((acc) => ({
    label: acc.name,
    value: acc.id,
  }));

  const filteredCategories = categories.filter((cat) => cat.type === selectedType);

  const selectedCategory = filteredCategories.find((c) => c.id === selectedCategoryId);
  const subcategoryOptions: SelectOption[] =
    selectedCategory?.subcategories.map((sub) => ({
      label: sub.name,
      value: sub.id,
    })) || [];

  const amountValue = watch('amount');

  if (isLoadingData) {
    return (
      <Screen>
        <Header title="Edit Transaction" showBack disableBack={isLoading} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <Header title="Edit Transaction" showBack disableBack={isLoading} />

      <View className="flex-1">
        {/* Hero Amount Section */}
        <View className="items-center px-4 pt-2 pb-3">
          <TransactionTypeToggle
            value={selectedType}
            onChange={(type) => {
              setValue('type', type);
              setValue('category_id', undefined);
              setValue('subcategory_id', undefined);
            }}
          />
          <View className="mt-2 flex-row items-baseline">
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

        {/* Scrollable Form Fields */}
        <KeyboardAwareScrollView
          className="flex-1 px-4"
          keyboardShouldPersistTaps="handled"
          bottomOffset={20}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
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
                  onValueChange={(v) => {
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
            Save Changes
          </Button>
        </View>
      </View>
    </Screen>
  );
}


