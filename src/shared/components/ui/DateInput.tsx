import React, { useState } from 'react';
import { View, Text, Pressable, Platform, Modal } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { parseISO, format } from 'date-fns';
import { useTheme } from '../../../hooks/useColorScheme';
import { formatDate } from '../../utils/date';

interface DateInputProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChangeValue: (value: string) => void;
  error?: string;
}

export function DateInput({ label, value, onChangeValue, error }: DateInputProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const dateValue = value ? parseISO(value) : new Date();

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChangeValue(format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  const containerStyle = {
    backgroundColor: colors.surfaceVariant,
    borderColor: error ? colors.destructive : colors.outline,
    borderWidth: 1,
    borderRadius: 12,
  };

  const displayText = value ? formatDate(value, true) : 'Select date';

  return (
    <View className="w-full">
      {label && (
        <Text
          className="mb-1.5 text-sm font-medium"
          style={{ color: colors.foreground }}
        >
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => setShowPicker(true)}
        className="flex-row items-center px-3"
        style={containerStyle}
      >
        <Text
          className="flex-1 py-3 text-base"
          style={{ color: value ? colors.foreground : colors.mutedForeground }}
        >
          {displayText}
        </Text>
        <View className="ml-2">
          <Calendar size={20} color={colors.mutedForeground} />
        </View>
      </Pressable>
      {error && (
        <Text
          className="mt-1 text-sm"
          style={{ color: colors.destructive }}
        >
          {error}
        </Text>
      )}

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          onChange={handleChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <Pressable
            className="flex-1 justify-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onPress={() => setShowPicker(false)}
          >
            <Pressable
              className="rounded-t-2xl pb-8 pt-4"
              style={{ backgroundColor: colors.surface }}
              onPress={() => {}}
            >
              <View className="flex-row items-center justify-between px-4 pb-2">
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text className="text-base" style={{ color: colors.primary }}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                    Done
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={dateValue}
                mode="date"
                display="spinner"
                onChange={handleChange}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
