import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../types/navigation';
import type { AccountWithPerson } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, CurrencyInput, Input, DateInput, Select, SelectOption } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { AccountRepository, TransferRepository } from '../../../database/repositories';
import { formatPHP } from '../../../shared/utils/currency';
import { getToday } from '../../../shared/utils/date';
import { useTheme } from '../../../hooks/useColorScheme';
import { useMutationCloseGuard } from '../../../shared/hooks';
import { safeCloseAfterMutation } from '../../../shared/utils';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PayCreditCardRouteProp = RouteProp<RootStackParamList, 'PayCreditCard'>;

const paymentSchema = z.object({
  from_account_id: z.number({ message: 'Source account is required' }),
  amount: z.string().min(1, 'Amount is required'),
  date: z.string(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export function PayCreditCardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PayCreditCardRouteProp>();
  const accountId = route.params.accountId;
  const { activeLedgerId } = useLedgerStore();
  const { colors } = useTheme();

  const [creditAccount, setCreditAccount] = useState<AccountWithPerson | null>(null);
  const [debitAccounts, setDebitAccounts] = useState<AccountWithPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const submissionGuard = useMutationCloseGuard();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: '',
      date: getToday(),
      notes: '',
    },
  });

  const fromAccountId = watch('from_account_id');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!activeLedgerId) return;
    try {
      const [credit, debits] = await Promise.all([
        AccountRepository.getById(accountId),
        AccountRepository.getByType(activeLedgerId, 'debit'),
      ]);
      setCreditAccount(credit);
      setDebitAccounts(debits);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!activeLedgerId || !creditAccount) return;

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!submissionGuard.start()) return;

    setIsLoading(true);
    try {
      await TransferRepository.createCreditCardPayment(activeLedgerId, {
        from_account_id: data.from_account_id,
        credit_account_id: accountId,
        amount,
        date: data.date,
        notes: data.notes,
      });

      safeCloseAfterMutation(navigation, submissionGuard.closeAfterRef);
    } catch (error) {
      submissionGuard.finish();
      setIsLoading(false);
      console.error('Error creating payment:', error);
      Alert.alert('Error', 'Failed to process payment');
    }
  };

  const accountOptions: SelectOption[] = debitAccounts.map((acc) => ({
    label: acc.name,
    value: acc.id,
  }));

  const fromAccount = debitAccounts.find((a) => a.id === fromAccountId);

  const IconComponent = creditAccount
    ? (LucideIcons as any)[
        creditAccount.icon
          .split('-')
          .map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)))
          .join('')
      ] || LucideIcons.CreditCard
    : LucideIcons.CreditCard;

  return (
    <Screen scrollable={false}>
      <Header title="Pay Credit Card" showClose disableClose={isLoading} />

      <ScrollView className="flex-1 px-4 py-4" keyboardShouldPersistTaps="handled">
        {/* Credit Card Info */}
        {creditAccount && (
          <View
            className="mb-4 rounded-xl p-4"
            style={{ backgroundColor: colors.accountCredit + '15' }}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: creditAccount.color }}
              >
                <IconComponent size={20} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold" style={{ color: colors.foreground }}>
                  {creditAccount.name}
                </Text>
                <Text className="text-sm" style={{ color: colors.mutedForeground }}>
                  Balance owed
                </Text>
              </View>
              <Text
                className="text-lg font-bold"
                style={{ color: colors.accountCredit }}
              >
                {formatPHP(creditAccount.current_balance)}
              </Text>
            </View>

            {creditAccount.credit_limit != null && (
              <View className="mt-3">
                <View className="h-2 overflow-hidden rounded-full bg-secondary">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        (creditAccount.current_balance / creditAccount.credit_limit) * 100,
                        100,
                      )}%`,
                      backgroundColor: colors.accountCredit,
                    }}
                  />
                </View>
                <View className="mt-1 flex-row justify-between">
                  <Text className="text-xs" style={{ color: colors.mutedForeground }}>
                    Credit Limit
                  </Text>
                  <Text className="text-xs" style={{ color: colors.mutedForeground }}>
                    {formatPHP(creditAccount.credit_limit)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Source Account */}
        <View className="mb-4">
          <Controller
            control={control}
            name="from_account_id"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Pay From"
                placeholder="Select debit account"
                value={value}
                options={accountOptions}
                onValueChange={onChange}
                error={errors.from_account_id?.message}
              />
            )}
          />
          {fromAccount && (
            <Text className="mt-1 text-xs" style={{ color: colors.mutedForeground }}>
              Available: {formatPHP(fromAccount.current_balance)}
            </Text>
          )}
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
          {creditAccount && creditAccount.current_balance > 0 && (
            <TouchableOpacity
              onPress={() =>
                setValue('amount', creditAccount.current_balance.toString())
              }
              className="mt-2 self-start rounded-full px-3 py-1"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                Pay Full Balance ({formatPHP(creditAccount.current_balance)})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Date */}
        <View className="mb-4">
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <DateInput label="Date" value={value} onChangeValue={onChange} />
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
                label="Notes (optional)"
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
          Pay Credit Card
        </Button>

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}
