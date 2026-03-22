import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../../hooks/useColorScheme';
import type { CategoryWithSubcategories } from '../../../types/database';

interface CategoryPickerProps {
  label?: string;
  value?: number | null;
  categories: CategoryWithSubcategories[];
  onValueChange: (categoryId: number) => void;
  error?: string;
}

function getCategoryIcon(iconName: string) {
  const pascalCase = iconName
    .split('-')
    .map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)))
    .join('');
  return (LucideIcons as any)[pascalCase] || LucideIcons.Tag;
}

export function CategoryPicker({
  label,
  value,
  categories,
  onValueChange,
  error,
}: CategoryPickerProps) {
  const { colors } = useTheme();

  return (
    <View>
      {label && (
        <Text
          style={{
            color: colors.foreground,
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 10,
          }}
        >
          {label}
        </Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -16 }}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 2 }}
      >
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          const isSelected = category.id === value;

          return (
            <Pressable
              key={category.id}
              onPress={() => onValueChange(category.id)}
              style={({ pressed }) => ({
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 6,
                borderRadius: 16,
                backgroundColor: isSelected
                  ? category.color + '18'
                  : 'transparent',
                width: 72,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={[
                  {
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: category.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  isSelected
                    ? {
                        shadowColor: category.color,
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.4,
                        shadowRadius: 6,
                        elevation: 4,
                      }
                    : { opacity: 0.55 },
                ]}
              >
                <Icon size={20} color="#ffffff" />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: isSelected
                    ? colors.foreground
                    : colors.mutedForeground,
                  fontWeight: isSelected ? '600' : '400',
                  textAlign: 'center',
                  marginTop: 6,
                  lineHeight: 14,
                }}
                numberOfLines={2}
              >
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error && (
        <Text
          style={{
            color: colors.destructive,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
