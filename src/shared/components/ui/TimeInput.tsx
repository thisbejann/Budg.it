import React, { useState } from 'react';
import { View, Text, Pressable, Platform, Modal } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { format } from 'date-fns';
import { useTheme } from '../../../hooks/useColorScheme';
import { formatTime } from '../../utils/date';

interface TimeInputProps {
  label?: string;
  value?: string; // HH:MM
  onChangeValue: (value: string) => void;
  error?: string;
}

function parseTimeToDate(timeStr?: string): Date {
  const date = new Date();
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':');
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  }
  return date;
}

export function TimeInput({ label, value, onChangeValue, error }: TimeInputProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const dateValue = parseTimeToDate(value);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChangeValue(format(selectedDate, 'HH:mm'));
    }
  };

  const containerStyle = {
    backgroundColor: colors.surfaceVariant,
    borderColor: error ? colors.destructive : colors.outline,
    borderWidth: 1,
    borderRadius: 12,
  };

  const displayText = value ? formatTime(value) : 'Select time';

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
          <Clock size={20} color={colors.mutedForeground} />
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
          mode="time"
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
                mode="time"
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
