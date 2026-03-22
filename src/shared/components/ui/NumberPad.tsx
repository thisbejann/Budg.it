import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Delete } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../hooks/useColorScheme';

interface NumberPadProps {
  value: string;
  onValueChange: (value: string) => void;
  maxDecimals?: number;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'backspace'],
] as const;

export function NumberPad({ value, onValueChange, maxDecimals = 2 }: NumberPadProps) {
  const { colors } = useTheme();

  const handlePress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (key === 'backspace') {
      onValueChange(value.slice(0, -1));
      return;
    }

    if (key === '.') {
      if (value.includes('.')) return;
      onValueChange(value === '' ? '0.' : value + '.');
      return;
    }

    // Digit
    let next = value + key;

    // Check decimal limit
    const parts = next.split('.');
    if (parts[1] && parts[1].length > maxDecimals) return;

    // Strip leading zeros (keep "0" and "0.xx")
    if (parts[0].length > 1) {
      parts[0] = parts[0].replace(/^0+/, '') || '0';
      next = parts.join('.');
    }

    onValueChange(next);
  };

  return (
    <View style={{ gap: 8 }}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', gap: 8 }}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => handlePress(key)}
              activeOpacity={0.6}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: colors.surfaceContainer,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {key === 'backspace' ? (
                <Delete size={20} color={colors.foreground} />
              ) : (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '600',
                    color: colors.foreground,
                  }}
                >
                  {key}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}
