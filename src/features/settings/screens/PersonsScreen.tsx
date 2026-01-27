import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, User, Phone, Mail, ChevronRight } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { Person } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { GlassCard, EmptyState, Avatar } from '../../../shared/components/ui';
import { PersonRepository } from '../../../database/repositories';
import { formatPHP } from '../../../shared/utils/currency';
import { useTheme } from '../../../hooks/useColorScheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type PersonWithBalances = Person & { total_owed: number; total_debt: number };

export function PersonsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [persons, setPersons] = useState<PersonWithBalances[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPersons = useCallback(async () => {
    try {
      const data = await PersonRepository.getWithBalances();
      setPersons(data);
    } catch (error) {
      console.error('Error loading persons:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPersons();
  }, [loadPersons]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadPersons);
    return unsubscribe;
  }, [navigation, loadPersons]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPersons();
  };

  const renderPerson = ({ item }: { item: PersonWithBalances }) => {
    const netBalance = item.total_owed - item.total_debt;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EditPerson', { personId: item.id })}
        activeOpacity={0.7}
        className="mb-3"
      >
        <GlassCard>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <Avatar
                size="lg"
                fallback={item.name}
                backgroundColor={colors.primary}
              />
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {item.name}
                </Text>
                {item.phone && (
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Phone size={12} color={colors.mutedForeground} />
                    <Text className="text-xs text-muted-foreground">{item.phone}</Text>
                  </View>
                )}
                {item.email && (
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Mail size={12} color={colors.mutedForeground} />
                    <Text className="text-xs text-muted-foreground">{item.email}</Text>
                  </View>
                )}
              </View>
            </View>

            <View className="items-end">
              {item.total_owed > 0 && (
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs text-muted-foreground">Owes you:</Text>
                  <Text className="text-sm font-semibold text-blue-600">
                    {formatPHP(item.total_owed)}
                  </Text>
                </View>
              )}
              {item.total_debt > 0 && (
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs text-muted-foreground">You owe:</Text>
                  <Text className="text-sm font-semibold text-red-600">
                    {formatPHP(item.total_debt)}
                  </Text>
                </View>
              )}
              {netBalance === 0 && item.total_owed === 0 && item.total_debt === 0 && (
                <Text className="text-xs text-muted-foreground">No balances</Text>
              )}
              <ChevronRight size={18} color={colors.mutedForeground} className="mt-1" />
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={onRefresh}
      scrollable={false}
    >
      <Header
        title="People"
        subtitle="Manage contacts for owed/debt accounts"
        showBack
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('AddPerson')}>
            <Plus size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={persons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPerson}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={<User size={48} color={colors.mutedForeground} />}
              title="No people yet"
              description="Add people to track who owes you money or who you owe money to."
              actionLabel="Add Person"
              onAction={() => navigation.navigate('AddPerson')}
            />
          ) : undefined
        }
      />
    </Screen>
  );
}
