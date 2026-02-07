import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { Ledger } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { EmptyState, Badge } from '../../../shared/components/ui';
import { LedgerRepository } from '../../../database/repositories';
import { useLedgerStore } from '../../../store';
import { useTheme } from '../../../hooks/useColorScheme';
import * as LucideIcons from 'lucide-react-native';
import { Plus, Book, Check, ChevronRight } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function LedgersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const { activeLedgerId, setActiveLedger } = useLedgerStore();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLedgers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await LedgerRepository.getAll();
      setLedgers(data);
    } catch (error) {
      console.error('Error loading ledgers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLedgers();
    }, [loadLedgers])
  );

  const handleSelectLedger = async (ledger: Ledger) => {
    try {
      await setActiveLedger(ledger.id);
      Alert.alert('Ledger Changed', `Now using "${ledger.name}" ledger`);
    } catch (error) {
      console.error('Error switching ledger:', error);
      Alert.alert('Error', 'Failed to switch ledger');
    }
  };

  const renderLedger = ({ item }: { item: Ledger }) => {
    const IconComponent = (LucideIcons as any)[
      item.icon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
    ] || LucideIcons.Book;

    const isActive = item.id === activeLedgerId;

    return (
      <TouchableOpacity
        onPress={() => handleSelectLedger(item)}
        className={`flex-row items-center justify-between border-b border-border px-4 py-3 ${
          isActive ? 'bg-primary/5' : ''
        }`}
      >
        <View className="flex-1 flex-row items-center gap-3">
          <View
            className="h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: item.color }}
          >
            <IconComponent size={22} color="#ffffff" />
          </View>
          <View className="shrink">
            <View className="flex-row items-center gap-2">
              <Text className="font-medium" style={{ color: colors.foreground }}>{item.name}</Text>
              {item.is_default && (
                <Badge variant="secondary">Default</Badge>
              )}
            </View>
            {item.description && (
              <Text className="text-xs" style={{ color: colors.mutedForeground }} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {isActive && (
            <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
              <Check size={14} color="#ffffff" />
            </View>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('EditLedger', { ledgerId: item.id })}
            className="p-2"
          >
            <ChevronRight size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen scrollable={false}>
      <Header
        title="Ledgers"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddLedger')}
            className="p-2"
          >
            <Plus size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : ledgers.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <EmptyState
            icon={<Book size={48} color={colors.mutedForeground} />}
            title="No ledgers"
            description="Create your first ledger to start tracking"
            actionLabel="Add Ledger"
            onAction={() => navigation.navigate('AddLedger')}
          />
        </View>
      ) : (
        <>
          <View className="px-4 py-2" style={{ backgroundColor: colors.muted }}>
            <Text className="text-xs" style={{ color: colors.mutedForeground }}>
              Tap a ledger to switch to it. Tap the arrow to edit.
            </Text>
          </View>
          <FlatList
            data={ledgers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderLedger}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </>
      )}
    </Screen>
  );
}
