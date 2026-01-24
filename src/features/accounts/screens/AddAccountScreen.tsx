import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../types/navigation';
import type { Person, AccountType } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, CurrencyInput, Input, Select, SelectOption } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { AccountRepository, PersonRepository } from '../../../database/repositories';
import { COLORS, ACCOUNT_COLORS } from '../../../constants/colors';
import { ACCOUNT_ICONS } from '../../../constants/icons';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddAccountRouteProp = RouteProp<RootStackParamList, 'AddAccount'>;

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  account_type: z.enum(['debit', 'credit', 'owed', 'debt']),
  initial_balance: z.string(),
  credit_limit: z.string().optional(),
  person_id: z.number().optional(),
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

  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

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
      icon: 'wallet',
      color: ACCOUNT_COLORS[0],
      notes: '',
    },
  });

  const selectedType = watch('account_type');
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    try {
      const data = await PersonRepository.getAll();
      setPersons(data);
    } catch (error) {
      console.error('Error loading persons:', error);
    }
  };

  const onSubmit = async (data: AccountFormSchema) => {
    if (!activeLedgerId) return;

    try {
      setIsLoading(true);

      await AccountRepository.create(activeLedgerId, {
        name: data.name,
        account_type: data.account_type,
        initial_balance: parseFloat(data.initial_balance) || 0,
        credit_limit: data.credit_limit ? parseFloat(data.credit_limit) : undefined,
        person_id: data.person_id,
        icon: data.icon,
        color: data.color,
        notes: data.notes,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Error', 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const personOptions: SelectOption[] = persons.map((p) => ({
    label: p.name,
    value: p.id,
  }));

  const IconComponent = (LucideIcons as any)[
    selectedIcon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
  ] || LucideIcons.Wallet;

  return (
    <Screen scrollable={false}>
      <Header title="Add Account" showClose />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Account Type */}
        <View className="mb-4">
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
        </View>

        {/* Name */}
        <View className="mb-4">
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
        </View>

        {/* Initial Balance */}
        <View className="mb-4">
          <Controller
            control={control}
            name="initial_balance"
            render={({ field: { onChange, value } }) => (
              <CurrencyInput
                label="Initial Balance"
                placeholder="0.00"
                value={value}
                onChangeValue={onChange}
                error={errors.initial_balance?.message}
              />
            )}
          />
        </View>

        {/* Credit Limit - Only for credit type */}
        {selectedType === 'credit' && (
          <View className="mb-4">
            <Controller
              control={control}
              name="credit_limit"
              render={({ field: { onChange, value } }) => (
                <CurrencyInput
                  label="Credit Limit"
                  placeholder="0.00"
                  value={value || ''}
                  onChangeValue={onChange}
                />
              )}
            />
          </View>
        )}

        {/* Person - Only for owed/debt types */}
        {(selectedType === 'owed' || selectedType === 'debt') && (
          <View className="mb-4">
            <Controller
              control={control}
              name="person_id"
              render={({ field: { onChange, value } }) => (
                <Select
                  label={selectedType === 'owed' ? 'Who owes you?' : 'Who do you owe?'}
                  placeholder="Select person (optional)"
                  value={value}
                  options={personOptions}
                  onValueChange={onChange}
                />
              )}
            />
            {persons.length === 0 && (
              <Text className="mt-1 text-xs text-muted-foreground">
                No persons added yet. Add from Settings → Manage Persons.
              </Text>
            )}
          </View>
        )}

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
            <View className="flex-1 flex-row flex-wrap gap-2">
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
          </View>
        </View>

        {/* Icon Grid */}
        {showIconPicker && (
          <View className="mb-4 rounded-xl bg-secondary p-3">
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
                      color={selectedIcon === iconName ? '#ffffff' : COLORS.foreground}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

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
          Create Account
        </Button>

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}
