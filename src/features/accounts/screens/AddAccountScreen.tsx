import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../types/navigation';
import type { AccountType } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, Input, Select, SelectOption, DayOfMonthPicker, CurrencyInput, Card, CardContent } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { AccountRepository } from '../../../database/repositories';
import { ACCOUNT_COLORS } from '../../../constants/colors';
import { ACCOUNT_ICONS } from '../../../constants/icons';
import { useTheme } from '../../../hooks/useColorScheme';
import { useMutationCloseGuard, usePreventNavigationWhilePending } from '../../../shared/hooks';
import * as LucideIcons from 'lucide-react-native';
import { safeCloseAfterMutation } from '../../../shared/utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddAccountRouteProp = RouteProp<RootStackParamList, 'AddAccount'>;

const PAYMENT_DUE_DAYS_OPTIONS: SelectOption[] = [
  { label: '15 days', value: 15 },
  { label: '18 days', value: 18 },
  { label: '20 days', value: 20 },
  { label: '21 days', value: 21 },
  { label: '25 days', value: 25 },
  { label: '30 days', value: 30 },
];

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  account_type: z.enum(['debit', 'credit', 'owed', 'debt']),
  initial_balance: z.string(),
  credit_limit: z.string().optional(),
  statement_date: z.number().min(1).max(31).optional(),
  due_date: z.number().min(1).max(31).optional(),
  payment_due_days: z.number().optional(),
  person_id: z.number().optional(),
  person_name: z.string().optional(),
  icon: z.string(),
  color: z.string(),
  notes: z.string().optional(),
});

type AccountFormSchema = z.infer<typeof accountSchema>;

const ACCOUNT_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Debit (Cash/Bank)', value: 'debit' },
  { label: 'Credit Card', value: 'credit' },
  { label: 'Owed to Me', value: 'owed' },
  { label: 'Debt I Owe', value: 'debt' },
];

export function AddAccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddAccountRouteProp>();
  const { activeLedgerId } = useLedgerStore();
  const { colors } = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const submissionGuard = useMutationCloseGuard();

  const defaultType = (route.params?.accountType as AccountType) || 'debit';

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccountFormSchema>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      account_type: defaultType,
      initial_balance: '0',
      credit_limit: '',
      person_name: '',
      icon: 'wallet',
      color: ACCOUNT_COLORS[0],
      notes: '',
    },
  });

  const selectedType = watch('account_type');
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  usePreventNavigationWhilePending(isLoading, submissionGuard.closeAfterRef);

  const onSubmit = async (data: AccountFormSchema) => {
    if (!activeLedgerId) return;
    if (!submissionGuard.start()) return;

    setIsLoading(true);
    try {
      const isPersonType = data.account_type === 'owed' || data.account_type === 'debt';

      await AccountRepository.create(activeLedgerId, {
        name: data.name,
        account_type: data.account_type,
        initial_balance: parseFloat(data.initial_balance) || 0,
        credit_limit: data.credit_limit ? parseFloat(data.credit_limit) : undefined,
        statement_date: data.statement_date,
        due_date: data.due_date,
        payment_due_days: data.payment_due_days,
        person_name: isPersonType ? data.person_name : undefined,
        icon: data.icon,
        color: data.color,
        notes: data.notes,
      });

      safeCloseAfterMutation(navigation, submissionGuard.closeAfterRef);
    } catch (error) {
      submissionGuard.finish();
      setIsLoading(false);
      console.error('Error creating account:', error);
      Alert.alert('Error', 'Failed to create account');
    }
  };

  const IconComponent = (LucideIcons as any)[
    selectedIcon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
  ] || LucideIcons.Wallet;

  return (
    <Screen scrollable={false}>
      <Header title="Add Account" showClose disableClose={isLoading} />

      <KeyboardAwareScrollView
        className="flex-1 px-4"
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Hero Icon Section */}
        <View className="items-center pt-4 pb-3">
          <TouchableOpacity
            onPress={() => setShowIconPicker(!showIconPicker)}
            className="h-20 w-20 items-center justify-center rounded-2xl"
            style={{ backgroundColor: selectedColor }}
          >
            <IconComponent size={36} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Account Info Card */}
        <Card className="mb-3">
          <CardContent className="gap-4">
            <Controller
              control={control}
              name="account_type"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Account Type"
                  placeholder="Select type"
                  value={value}
                  options={ACCOUNT_TYPE_OPTIONS}
                  onValueChange={onChange}
                  error={errors.account_type?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Account Name"
                  placeholder="e.g., BDO Savings"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card className="mb-3">
          <CardContent className="gap-4">
            <Controller
              control={control}
              name="initial_balance"
              render={({ field: { onChange, value } }) => (
                <CurrencyInput
                  label="Initial Balance"
                  value={value}
                  onChangeValue={onChange}
                />
              )}
            />
            {selectedType === 'credit' && (
              <Controller
                control={control}
                name="credit_limit"
                render={({ field: { onChange, value } }) => (
                  <CurrencyInput
                    label="Credit Limit"
                    value={value || ''}
                    onChangeValue={onChange}
                  />
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Credit Card Details */}
        {selectedType === 'credit' && (
          <Card className="mb-3">
            <CardContent className="gap-4">
              <Controller
                control={control}
                name="statement_date"
                render={({ field: { onChange, value } }) => (
                  <DayOfMonthPicker
                    label="Statement Date"
                    placeholder="Select statement day"
                    value={value}
                    onValueChange={onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="due_date"
                render={({ field: { onChange, value } }) => (
                  <DayOfMonthPicker
                    label="Due Date"
                    placeholder="Select due day"
                    value={value}
                    onValueChange={onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="payment_due_days"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Days to Pay After Statement"
                    placeholder="Select days"
                    value={value}
                    options={PAYMENT_DUE_DAYS_OPTIONS}
                    onValueChange={onChange}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Person - Only for owed/debt types */}
        {(selectedType === 'owed' || selectedType === 'debt') && (
          <Card className="mb-3">
            <CardContent>
              <Controller
                control={control}
                name="person_name"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={selectedType === 'owed' ? 'Who owes you?' : 'Who do you owe?'}
                    placeholder="e.g., John"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Color Picker */}
        <Card className="mb-3">
          <CardContent>
            <Text className="mb-2 text-sm font-medium text-foreground">Color</Text>
            <View className="flex-row flex-wrap gap-2">
              {ACCOUNT_COLORS.map((color) => (
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
          </CardContent>
        </Card>

        {/* Icon Grid */}
        {showIconPicker && (
          <View className="mb-3 rounded-xl bg-secondary p-3">
            <Text className="mb-2 text-sm font-medium text-foreground">Select Icon</Text>
            <View className="flex-row flex-wrap gap-2">
              {ACCOUNT_ICONS.map((iconName) => {
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

        {/* Submit */}
        <View className="mt-6">
          <Button onPress={handleSubmit(onSubmit)} loading={isLoading}>
            Create Account
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
