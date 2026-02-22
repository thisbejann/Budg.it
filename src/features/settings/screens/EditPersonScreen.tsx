import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../types/navigation';
import type { Person } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, Input } from '../../../shared/components/ui';
import { PersonRepository } from '../../../database/repositories';
import { useTheme } from '../../../hooks/useColorScheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditPersonRouteProp = RouteProp<RootStackParamList, 'EditPerson'>;

const personSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type PersonFormSchema = z.infer<typeof personSchema>;

export function EditPersonScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditPersonRouteProp>();
  const personId = route.params.personId;
  const { colors } = useTheme();

  const [person, setPerson] = useState<Person | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
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

  useEffect(() => {
    loadPerson();
  }, [personId]);

  const loadPerson = async () => {
    try {
      setIsLoadingData(true);
      const data = await PersonRepository.getById(personId);

      if (!data) {
        Alert.alert('Error', 'Person not found');
        navigation.goBack();
        return;
      }

      setPerson(data);
      reset({
        name: data.name,
        phone: data.phone || '',
        email: data.email || '',
        notes: data.notes || '',
      });
    } catch (error) {
      console.error('Error loading person:', error);
      Alert.alert('Error', 'Failed to load person');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: PersonFormSchema) => {
    setIsLoading(true);
    try {
      await PersonRepository.update(personId, {
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        notes: data.notes || undefined,
      });

      Keyboard.dismiss();
      navigation.goBack();
    } catch (error) {
      setIsLoading(false);
      console.error('Error updating person:', error);
      Alert.alert('Error', 'Failed to update person');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Person',
      'Are you sure? This will remove this person from all associated accounts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await PersonRepository.delete(personId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting person:', error);
              Alert.alert('Error', 'Failed to delete person');
            }
          },
        },
      ]
    );
  };

  if (isLoadingData) {
    return (
      <Screen>
        <Header title="Edit Person" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <Header title="Edit Person" showBack />

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
            Save Changes
          </Button>
        </View>

        {/* Delete */}
        <View className="mt-4">
          <Button variant="destructive" onPress={handleDelete}>
            Delete Person
          </Button>
        </View>

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}



