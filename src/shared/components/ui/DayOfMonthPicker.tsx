import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Modal, FlatList, Platform } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { useTheme } from '../../../hooks/useColorScheme';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

interface DayOfMonthPickerProps {
  label?: string;
  placeholder?: string;
  value?: number | null;
  onValueChange: (day: number) => void;
  error?: string;
}

export function DayOfMonthPicker({
  label,
  placeholder = 'Select day',
  value,
  onValueChange,
  error,
}: DayOfMonthPickerProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempValue, setTempValue] = useState<number>(value || 1);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (showPicker) {
      setTempValue(value || 1);
    }
  }, [showPicker, value]);

  useEffect(() => {
    if (showPicker && flatListRef.current) {
      const index = (tempValue || 1) - 1;
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: index * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
  }, [showPicker]);

  const handleConfirm = () => {
    onValueChange(tempValue);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  const displayText = value
    ? `${value}${getOrdinalSuffix(value)} of every month`
    : placeholder;

  const containerStyle = {
    backgroundColor: colors.surfaceVariant,
    borderColor: error ? colors.destructive : colors.outline,
    borderWidth: 1,
    borderRadius: 12,
  };

  return (
    <View style={{ width: '100%' as any }}>
      {label && (
        <Text
          style={{
            color: colors.foreground,
            fontSize: 14,
            fontWeight: '500' as const,
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[
          containerStyle,
          {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
          },
        ]}
      >
        <Text
          style={{
            flex: 1,
            paddingVertical: 12,
            fontSize: 16,
            color: value ? colors.foreground : colors.mutedForeground,
          }}
        >
          {displayText}
        </Text>
        <View style={{ marginLeft: 8 }}>
          <Calendar size={20} color={colors.mutedForeground} />
        </View>
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

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
          onPress={handleCancel}
        >
          <Pressable
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingBottom: Platform.OS === 'ios' ? 34 : 16,
              paddingTop: 16,
            }}
            onPress={() => {}}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingBottom: 12,
              }}
            >
              <Pressable onPress={handleCancel}>
                <Text style={{ color: colors.primary, fontSize: 16 }}>
                  Cancel
                </Text>
              </Pressable>
              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {label || 'Select Day'}
              </Text>
              <Pressable onPress={handleConfirm}>
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Done
                </Text>
              </Pressable>
            </View>

            {/* Wheel Picker */}
            <View
              style={{
                height: PICKER_HEIGHT,
                overflow: 'hidden',
              }}
            >
              {/* Selection highlight */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                  left: 16,
                  right: 16,
                  height: ITEM_HEIGHT,
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  zIndex: 1,
                }}
              />
              {/* Top/bottom fade overlays */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: ITEM_HEIGHT * 2,
                  zIndex: 2,
                  opacity: 0.7,
                  backgroundColor: colors.surface,
                }}
              />
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: ITEM_HEIGHT * 2,
                  zIndex: 2,
                  opacity: 0.7,
                  backgroundColor: colors.surface,
                }}
              />
              <FlatList
                ref={flatListRef}
                data={DAYS}
                keyExtractor={(item) => item.toString()}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{
                  paddingTop: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                  paddingBottom: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                }}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.y / ITEM_HEIGHT
                  );
                  const day = Math.max(1, Math.min(31, index + 1));
                  setTempValue(day);
                }}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                renderItem={({ item }) => {
                  const isSelected = item === tempValue;
                  return (
                    <Pressable
                      onPress={() => {
                        setTempValue(item);
                        flatListRef.current?.scrollToOffset({
                          offset: (item - 1) * ITEM_HEIGHT,
                          animated: true,
                        });
                      }}
                      style={{
                        height: ITEM_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: isSelected ? 20 : 16,
                          fontWeight: isSelected ? '600' : '400',
                          color: isSelected
                            ? colors.foreground
                            : colors.mutedForeground,
                        }}
                      >
                        {item}
                        {getOrdinalSuffix(item)}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
