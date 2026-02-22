import React, { useState } from 'react';
import { View, ScrollView, Alert, InteractionManager, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, Input } from '../../../shared/components/ui';
import { PersonRepository } from '../../../database/repositories';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const personSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type PersonFormSchema = z.infer<typeof personSchema>;

export function AddPersonScreen() {
  const navigation = useNavigation<NavigationProp>();
  
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonFormSchema>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      notes: '',
    },
  });

  const onSubmit = async (data: PersonFormSchema) => {
    setIsLoading(true);
    try {
      await PersonRepository.create({
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        notes: data.notes || undefined,
      });

      Keyboard.dismiss();
      InteractionManager.runAfterInteractions(() => navigation.goBack());
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating person:', error);
      Alert.alert('Error', 'Failed to create person');
    }
  };

  return (
    <Screen scrollable={false}>
      <Header title="Add Person" showClose />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Name */}
        <View className="mb-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Name"
                placeholder="Enter person's name"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />
        </View>

        {/* Phone */}
        <View className="mb-4">
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Phone (optional)"
                placeholder="Phone number"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
              />
            )}
          />
        </View>

        {/* Email */}
        <View className="mb-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email (optional)"
                placeholder="Email address"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />
        </View>

        {/* Notes */}
        <View className="mb-4">
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Notes (optional)"
                placeholder="Any additional notes"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>

        {/* Submit */}
        <View className="mt-2">
          <Button onPress={handleSubmit(onSubmit)} loading={isLoading}>
            Add Person
          </Button>
        </View>

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}


