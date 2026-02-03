import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { TransactionTemplateWithDetails } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { EmptyState, ExpenseBadge, IncomeBadge } from '../../../shared/components/ui';
import { TemplateRepository } from '../../../database/repositories';
import { useLedgerStore } from '../../../store';
import { formatPHP } from '../../../shared/utils/currency';
import { useTheme } from '../../../hooks/useColorScheme';
import * as LucideIcons from 'lucide-react-native';
import { Plus, FileText, ChevronRight } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TemplatesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const { activeLedgerId } = useLedgerStore();
  const [templates, setTemplates] = useState<TransactionTemplateWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    if (!activeLedgerId) return;

    try {
      setIsLoading(true);
      const data = await TemplateRepository.getByLedger(activeLedgerId);
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeLedgerId]);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates])
  );

  const renderTemplate = ({ item }: { item: TransactionTemplateWithDetails }) => {
    const IconComponent = (LucideIcons as any)[
      item.icon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
    ] || LucideIcons.FileText;

    const isExpense = item.type === 'expense';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EditTemplate', { templateId: item.id })}
        className="flex-row items-center justify-between border-b border-border px-4 py-3"
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: item.color }}
          >
            <IconComponent size={22} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-foreground">{item.name}</Text>
            <View className="mt-1 flex-row items-center gap-2">
              {isExpense ? <ExpenseBadge /> : <IncomeBadge />}
              {item.category_name && (
                <Text className="text-xs text-muted-foreground">{item.category_name}</Text>
              )}
            </View>
            {item.account_name && (
              <Text className="mt-0.5 text-xs text-muted-foreground">
                Account: {item.account_name}
              </Text>
            )}
          </View>
        </View>
        <View className="items-end gap-1">
          {item.amount ? (
            <Text
              className="font-semibold"
              style={{ color: isExpense ? colors.expense : colors.income }}
            >
              {formatPHP(item.amount)}
            </Text>
          ) : (
            <Text className="text-xs text-muted-foreground">No amount</Text>
          )}
          <Text className="text-xs text-muted-foreground">
            Used {item.usage_count}x
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen scrollable={false}>
      <Header
        title="Quick Add Templates"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddTemplate')}
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
      ) : templates.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <EmptyState
            icon={<FileText size={48} color={colors.mutedForeground} />}
            title="No templates"
            description="Create templates for transactions you make often"
            actionLabel="Add Template"
            onAction={() => navigation.navigate('AddTemplate')}
          />
        </View>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTemplate}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </Screen>
  );
}
