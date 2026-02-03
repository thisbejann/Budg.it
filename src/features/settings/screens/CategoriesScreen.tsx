import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SectionList, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { CategoryWithSubcategories, CategoryType } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, EmptyState } from '../../../shared/components/ui';
import { CategoryRepository } from '../../../database/repositories';
import { useTheme } from '../../../hooks/useColorScheme';
import * as LucideIcons from 'lucide-react-native';
import { Plus, ChevronRight, FolderOpen } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type SectionData = {
  title: string;
  data: CategoryWithSubcategories[];
};

export function CategoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await CategoryRepository.getByTypeWithSubcategories(activeTab);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const sections: SectionData[] = categories.length > 0
    ? [{ title: activeTab === 'expense' ? 'Expense Categories' : 'Income Categories', data: categories }]
    : [];

  const renderCategory = ({ item }: { item: CategoryWithSubcategories }) => {
    const IconComponent = (LucideIcons as any)[
      item.icon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
    ] || LucideIcons.Tag;

    return (
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {/* Category Row */}
        <TouchableOpacity
          onPress={() => navigation.navigate('EditCategory', { categoryId: item.id })}
          className="flex-row items-center justify-between px-4 py-3"
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: item.color }}
            >
              <IconComponent size={18} color="#ffffff" />
            </View>
            <View>
              <Text className="font-medium" style={{ color: colors.foreground }}>{item.name}</Text>
              <Text className="text-xs" style={{ color: colors.mutedForeground }}>
                {item.subcategories.length} subcategories
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            {item.is_system && (
              <View className="rounded px-2 py-0.5" style={{ backgroundColor: colors.secondary }}>
                <Text className="text-xs" style={{ color: colors.mutedForeground }}>System</Text>
              </View>
            )}
            <ChevronRight size={20} color={colors.mutedForeground} />
          </View>
        </TouchableOpacity>

        {/* Subcategories */}
        {item.subcategories.length > 0 && (
          <View className="pl-14" style={{ backgroundColor: colors.surfaceVariant }}>
            {item.subcategories.map((sub) => {
              const SubIcon = sub.icon
                ? (LucideIcons as any)[
                    sub.icon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
                  ]
                : null;

              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => navigation.navigate('EditSubcategory', { subcategoryId: sub.id })}
                  className="flex-row items-center justify-between px-4 py-2.5"
                  style={{ borderTopWidth: 1, borderTopColor: colors.border }}
                >
                  <View className="flex-row items-center gap-2">
                    {SubIcon && <SubIcon size={14} color={colors.mutedForeground} />}
                    <Text className="text-sm" style={{ color: colors.foreground }}>{sub.name}</Text>
                  </View>
                  <ChevronRight size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Add Subcategory Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AddSubcategory', { categoryId: item.id })}
          className="flex-row items-center gap-2 px-4 py-2 pl-14"
          style={{ backgroundColor: colors.surfaceContainerLow }}
        >
          <Plus size={14} color={colors.primary} />
          <Text className="text-sm" style={{ color: colors.primary }}>Add Subcategory</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View className="flex-row items-center justify-between px-4 py-2" style={{ backgroundColor: colors.background }}>
      <Text className="text-sm font-medium" style={{ color: colors.mutedForeground }}>{section.title}</Text>
      <Text className="text-sm" style={{ color: colors.mutedForeground }}>{section.data.length}</Text>
    </View>
  );

  return (
    <Screen scrollable={false}>
      <Header
        title="Categories"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddCategory', { type: activeTab })}
            className="p-2"
          >
            <Plus size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View className="flex-row" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity
          onPress={() => setActiveTab('expense')}
          className="flex-1 items-center py-3"
          style={activeTab === 'expense' ? { borderBottomWidth: 2, borderBottomColor: colors.primary } : {}}
        >
          <Text
            className="font-medium"
            style={{ color: activeTab === 'expense' ? colors.primary : colors.mutedForeground }}
          >
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('income')}
          className="flex-1 items-center py-3"
          style={activeTab === 'income' ? { borderBottomWidth: 2, borderBottomColor: colors.primary } : {}}
        >
          <Text
            className="font-medium"
            style={{ color: activeTab === 'income' ? colors.primary : colors.mutedForeground }}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : categories.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <EmptyState
            icon={<FolderOpen size={48} color={colors.mutedForeground} />}
            title={`No ${activeTab} categories`}
            description={`Add your first ${activeTab} category to organize your transactions`}
            actionLabel="Add Category"
            onAction={() => navigation.navigate('AddCategory', { type: activeTab })}
          />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategory}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </Screen>
  );
}
