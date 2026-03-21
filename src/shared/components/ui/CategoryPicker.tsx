import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, Dimensions } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../../hooks/useColorScheme';
import type { CategoryWithSubcategories } from '../../../types/database';

const NUM_COLUMNS = 4;
const SCREEN_WIDTH = Dimensions.get('window').width;
const TILE_SIZE = (SCREEN_WIDTH - 48 - 24) / NUM_COLUMNS; // padding 24*2, gaps

interface CategoryPickerProps {
  label?: string;
  placeholder?: string;
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
  placeholder = 'Select category',
  value,
  categories,
  onValueChange,
  error,
}: CategoryPickerProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const selectedCategory = categories.find((c) => c.id === value);

  const handleSelect = (categoryId: number) => {
    onValueChange(categoryId);
    setVisible(false);
  };

  const SelectedIcon = selectedCategory
    ? getCategoryIcon(selectedCategory.icon)
    : null;

  return (
    <View style={{ width: '100%' as any }}>
      {label && (
        <Text
          style={{
            color: colors.foreground,
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      )}

      {/* Trigger */}
      <Pressable
        onPress={() => setVisible(true)}
        style={{
          backgroundColor: colors.surfaceVariant,
          borderColor: error ? colors.destructive : colors.outline,
          borderWidth: 1,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
          }}
        >
          {selectedCategory && SelectedIcon ? (
            <>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: selectedCategory.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <SelectedIcon size={16} color="#ffffff" />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.foreground,
                }}
              >
                {selectedCategory.name}
              </Text>
            </>
          ) : (
            <Text
              style={{
                fontSize: 16,
                color: colors.mutedForeground,
              }}
            >
              {placeholder}
            </Text>
          )}
        </View>
        <ChevronDown size={20} color={colors.mutedForeground} />
      </Pressable>

      {error && (
        <Text
          style={{
            color: colors.destructive,
            fontSize: 14,
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: colors.backdrop,
          }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingBottom: 16,
              paddingTop: 16,
              maxHeight: '70%',
            }}
            onPress={() => {}}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 16,
                paddingBottom: 12,
              }}
            >
              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {label || 'Select Category'}
              </Text>
            </View>

            {/* Grid */}
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              numColumns={NUM_COLUMNS}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 8,
              }}
              columnWrapperStyle={{
                justifyContent: 'flex-start',
                gap: 8,
              }}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              renderItem={({ item }) => {
                const Icon = getCategoryIcon(item.icon);
                const isSelected = item.id === value;

                return (
                  <Pressable
                    onPress={() => handleSelect(item.id)}
                    style={{
                      width: TILE_SIZE,
                      alignItems: 'center',
                      paddingVertical: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: item.color,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: isSelected ? 3 : 0,
                        borderColor: isSelected ? colors.primary : 'transparent',
                      }}
                    >
                      <Icon size={20} color="#ffffff" />
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: isSelected
                          ? colors.primary
                          : colors.foreground,
                        fontWeight: isSelected ? '600' : '400',
                        textAlign: 'center',
                        marginTop: 4,
                        width: TILE_SIZE - 4,
                      }}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
