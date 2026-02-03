import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../types/navigation';
import type { Person, AccountWithPerson } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, CurrencyInput, Input, Select, SelectOption } from '../../../shared/components/ui';
import { AccountRepository, PersonRepository } from '../../../database/repositories';
import { ACCOUNT_COLORS } from '../../../constants/colors';
import { ACCOUNT_ICONS } from '../../../constants/icons';
import { useTheme } from '../../../hooks/useColorScheme';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditAccountRouteProp = RouteProp<RootStackParamList, 'EditAccount'>;

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  account_type: z.enum(['debit', 'credit', 'owed', 'debt']),
  credit_limit: z.string().optional(),
  person_id: z.number().optional().nullable(),
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

export function EditAccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditAccountRouteProp>();
  const accountId = route.params.accountId;
  const { colors } = useTheme();

  const [account, setAccount] = useState<AccountWithPerson | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
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
  } = useForm<AccountFormSchema>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      account_type: 'debit',
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
    loadData();
  }, [accountId]);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const [acct, personsList] = await Promise.all([
        AccountRepository.getById(accountId),
        PersonRepository.getAll(),
      ]);

      if (!acct) {
        Alert.alert('Error', 'Account not found');
        navigation.goBack();
        return;
      }

      setAccount(acct);
      setPersons(personsList);

      reset({
        name: acct.name,
        account_type: acct.account_type,
        credit_limit: acct.credit_limit?.toString() || '',
        person_id: acct.person_id,
        icon: acct.icon,
        color: acct.color,
        notes: acct.notes || '',
      });
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load account');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: AccountFormSchema) => {
    try {
      setIsLoading(true);

      await AccountRepository.update(accountId, {
        name: data.name,
        account_type: data.account_type,
        credit_limit: data.credit_limit ? parseFloat(data.credit_limit) : undefined,
        person_id: data.person_id || undefined,
        icon: data.icon,
        color: data.color,
        notes: data.notes,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error updating account:', error);
      Alert.alert('Error', 'Failed to update account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete this account? This will also delete all associated transactions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AccountRepository.delete(accountId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const personOptions: SelectOption[] = persons.map((p) => ({
    label: p.name,
    value: p.id,
  }));

  const IconComponent = (LucideIcons as any)[
    selectedIcon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
  ] || LucideIcons.Wallet;

  if (isLoadingData) {
    return (
      <Screen>
        <Header title="Edit Account" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <Header title="Edit Account" showBack />

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
                  value={value ?? undefined}
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
                      color={selectedIcon === iconName ? '#ffffff' : colors.foreground}
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
          Save Changes
        </Button>

        {/* Delete Button */}
        <View className="mt-4">
          <Button variant="destructive" onPress={handleDelete}>
            Delete Account
          </Button>
        </View>

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}
