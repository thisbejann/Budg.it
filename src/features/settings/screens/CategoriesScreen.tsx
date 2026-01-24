import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SectionList, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { CategoryWithSubcategories, CategoryType } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, EmptyState } from '../../../shared/components/ui';
import { CategoryRepository } from '../../../database/repositories';
import { COLORS } from '../../../constants/colors';
import * as LucideIcons from 'lucide-react-native';
import { Plus, ChevronRight, FolderOpen } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type SectionData = {
  title: string;
  data: CategoryWithSubcategories[];
};

export function CategoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
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
      <View className="border-b border-border">
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
              <Text className="font-medium text-foreground">{item.name}</Text>
              <Text className="text-xs text-muted-foreground">
                {item.subcategories.length} subcategories
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            {item.is_system && (
              <View className="rounded bg-secondary px-2 py-0.5">
                <Text className="text-xs text-muted-foreground">System</Text>
              </View>
            )}
            <ChevronRight size={20} color={COLORS.mutedForeground} />
          </View>
        </TouchableOpacity>

        {/* Subcategories */}
        {item.subcategories.length > 0 && (
          <View className="bg-secondary/50 pl-14">
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
                  className="flex-row items-center justify-between border-t border-border/50 px-4 py-2.5"
                >
                  <View className="flex-row items-center gap-2">
                    {SubIcon && <SubIcon size={14} color={COLORS.mutedForeground} />}
                    <Text className="text-sm text-foreground">{sub.name}</Text>
                  </View>
                  <ChevronRight size={16} color={COLORS.mutedForeground} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Add Subcategory Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AddSubcategory', { categoryId: item.id })}
          className="flex-row items-center gap-2 bg-secondary/30 px-4 py-2 pl-14"
        >
          <Plus size={14} color={COLORS.primary} />
          <Text className="text-sm text-primary">Add Subcategory</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View className="flex-row items-center justify-between bg-background px-4 py-2">
      <Text className="text-sm font-medium text-muted-foreground">{section.title}</Text>
      <Text className="text-sm text-muted-foreground">{section.data.length}</Text>
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
            <Plus size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View className="flex-row border-b border-border">
        <TouchableOpacity
          onPress={() => setActiveTab('expense')}
          className={`flex-1 items-center py-3 ${
            activeTab === 'expense' ? 'border-b-2 border-primary' : ''
          }`}
        >
          <Text
            className={`font-medium ${
              activeTab === 'expense' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('income')}
          className={`flex-1 items-center py-3 ${
            activeTab === 'income' ? 'border-b-2 border-primary' : ''
          }`}
        >
          <Text
            className={`font-medium ${
              activeTab === 'income' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : categories.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <EmptyState
            icon={<FolderOpen size={48} color={COLORS.mutedForeground} />}
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
