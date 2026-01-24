import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../types/navigation';
import type { Ledger } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, Input } from '../../../shared/components/ui';
import { LedgerRepository } from '../../../database/repositories';
import { useLedgerStore } from '../../../store';
import { COLORS, CATEGORY_COLORS } from '../../../constants/colors';
import { LEDGER_ICONS } from '../../../constants/icons';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditLedgerRouteProp = RouteProp<RootStackParamList, 'EditLedger'>;

const ledgerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  description: z.string().optional(),
  icon: z.string(),
  color: z.string(),
});

type LedgerFormSchema = z.infer<typeof ledgerSchema>;

export function EditLedgerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditLedgerRouteProp>();
  const ledgerId = route.params.ledgerId;
  const { activeLedgerId } = useLedgerStore();

  const [ledger, setLedger] = useState<Ledger | null>(null);
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
  } = useForm<LedgerFormSchema>({
    resolver: zodResolver(ledgerSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: 'wallet',
      color: CATEGORY_COLORS[0],
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  useEffect(() => {
    loadLedger();
  }, [ledgerId]);

  const loadLedger = async () => {
    try {
      setIsLoadingData(true);
      const data = await LedgerRepository.getById(ledgerId);

      if (!data) {
        Alert.alert('Error', 'Ledger not found');
        navigation.goBack();
        return;
      }

      setLedger(data);
      reset({
        name: data.name,
        description: data.description || '',
        icon: data.icon,
        color: data.color,
      });
    } catch (error) {
      console.error('Error loading ledger:', error);
      Alert.alert('Error', 'Failed to load ledger');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: LedgerFormSchema) => {
    try {
      setIsLoading(true);

      await LedgerRepository.update(ledgerId, {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error updating ledger:', error);
      Alert.alert('Error', 'Failed to update ledger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async () => {
    try {
      await LedgerRepository.setDefault(ledgerId);
      Alert.alert('Success', 'This ledger is now the default');
      loadLedger();
    } catch (error) {
      console.error('Error setting default:', error);
      Alert.alert('Error', 'Failed to set as default');
    }
  };

  const handleDelete = () => {
    if (ledger?.is_default) {
      Alert.alert('Cannot Delete', 'You cannot delete the default ledger. Set another ledger as default first.');
      return;
    }

    if (ledgerId === activeLedgerId) {
      Alert.alert('Cannot Delete', 'You cannot delete the active ledger. Switch to another ledger first.');
      return;
    }

    Alert.alert(
      'Delete Ledger',
      'Are you sure? This will delete all accounts, transactions, and data in this ledger.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LedgerRepository.delete(ledgerId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting ledger:', error);
              Alert.alert('Error', 'Failed to delete ledger');
            }
          },
        },
      ]
    );
  };

  const IconComponent = (LucideIcons as any)[
    selectedIcon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
  ] || LucideIcons.Wallet;

  if (isLoadingData) {
    return (
      <Screen>
        <Header title="Edit Ledger" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <Header title="Edit Ledger" showBack />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Default Badge */}
        {ledger?.is_default && (
          <View className="mb-4 rounded-xl bg-primary/10 p-3">
            <Text className="text-sm font-medium text-primary">
              This is the default ledger
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
                label="Ledger Name"
                placeholder="e.g., Personal, Business"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description (optional)"
                placeholder="What is this ledger for?"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={2}
              />
            )}
          />
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
              {LEDGER_ICONS.map((iconName) => {
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

        {/* Submit */}
        <View className="mt-2">
          <Button onPress={handleSubmit(onSubmit)} loading={isLoading}>
            Save Changes
          </Button>
        </View>

        {/* Set as Default */}
        {!ledger?.is_default && (
          <View className="mt-4">
            <Button variant="outline" onPress={handleSetDefault}>
              Set as Default Ledger
            </Button>
          </View>
        )}

        {/* Delete */}
        {!ledger?.is_default && ledgerId !== activeLedgerId && (
          <View className="mt-4">
            <Button variant="destructive" onPress={handleDelete}>
              Delete Ledger
            </Button>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}
