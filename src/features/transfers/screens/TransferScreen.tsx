import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, InteractionManager, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { AccountWithPerson } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, CurrencyInput, Input, Select, SelectOption } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { TransferRepository, AccountRepository } from '../../../database/repositories';
import { getToday, getCurrentTime } from '../../../shared/utils/date';
import { ArrowDown } from 'lucide-react-native';
import { useTheme } from '../../../hooks/useColorScheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const transferSchema = z.object({
  from_account_id: z.number({ required_error: 'From account is required' }),
  to_account_id: z.number({ required_error: 'To account is required' }),
  amount: z.string().min(1, 'Amount is required'),
  fee: z.string().optional(),
  date: z.string(),
  time: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.from_account_id !== data.to_account_id, {
  message: 'From and To accounts must be different',
  path: ['to_account_id'],
});

type TransferFormData = z.infer<typeof transferSchema>;

export function TransferScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const { activeLedgerId } = useLedgerStore();

  const [accounts, setAccounts] = useState<AccountWithPerson[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: '',
      fee: '',
      date: getToday(),
      time: getCurrentTime(),
      notes: '',
    },
  });

  const fromAccountId = watch('from_account_id');
  const toAccountId = watch('to_account_id');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    if (!activeLedgerId) return;

    try {
      const accts = await AccountRepository.getAllByLedger(activeLedgerId);
      setAccounts(accts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const onSubmit = async (data: TransferFormData) => {
    if (!activeLedgerId) return;

    const amount = parseFloat(data.amount);
    const fee = data.fee ? parseFloat(data.fee) : 0;

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      await TransferRepository.create(activeLedgerId, {
        from_account_id: data.from_account_id,
        to_account_id: data.to_account_id,
        amount,
        fee,
        date: data.date,
        time: data.time,
        notes: data.notes,
      });

      Keyboard.dismiss();
      InteractionManager.runAfterInteractions(() => navigation.goBack());
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating transfer:', error);
      Alert.alert('Error', 'Failed to create transfer');
    }
  };

  const accountOptions: SelectOption[] = accounts.map((acc) => ({
    label: `${acc.name} (${acc.account_type})`,
    value: acc.id,
  }));

  // Filter out selected from account for to account options
  const toAccountOptions = accountOptions.filter((opt) => opt.value !== fromAccountId);
  // Filter out selected to account for from account options
  const fromAccountOptions = accountOptions.filter((opt) => opt.value !== toAccountId);

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);

  return (
    <Screen scrollable={false}>
      <Header title="Transfer Funds" showClose />

      <ScrollView className="flex-1 px-4 py-4">
        {/* From Account */}
        <View className="mb-4">
          <Controller
            control={control}
            name="from_account_id"
            render={({ field: { onChange, value } }) => (
              <Select
                label="From Account"
                placeholder="Select source account"
                value={value}
                options={fromAccountOptions}
                onValueChange={onChange}
                error={errors.from_account_id?.message}
              />
            )}
          />
          {fromAccount && (
            <Text className="mt-1 text-xs text-muted-foreground">
              Balance: ₱{fromAccount.current_balance.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Arrow Icon */}
        <View className="mb-4 items-center">
          <View className="rounded-full bg-secondary p-2">
            <ArrowDown size={20} color={colors.mutedForeground} />
          </View>
        </View>

        {/* To Account */}
        <View className="mb-4">
          <Controller
            control={control}
            name="to_account_id"
            render={({ field: { onChange, value } }) => (
              <Select
                label="To Account"
                placeholder="Select destination account"
                value={value}
                options={toAccountOptions}
                onValueChange={onChange}
                error={errors.to_account_id?.message}
              />
            )}
          />
          {toAccount && (
            <Text className="mt-1 text-xs text-muted-foreground">
              Balance: ₱{toAccount.current_balance.toLocaleString()}
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
        </View>

        {/* Fee */}
        <View className="mb-4">
          <Controller
            control={control}
            name="fee"
            render={({ field: { onChange, value } }) => (
              <CurrencyInput
                label="Transfer Fee (optional)"
                placeholder="0.00"
                value={value || ''}
                onChangeValue={onChange}
              />
            )}
          />
          <Text className="mt-1 text-xs text-muted-foreground">
            Fee will be deducted from the source account but not added to the destination
          </Text>
        </View>

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
          Transfer
        </Button>

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}


