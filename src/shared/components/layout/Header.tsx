import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, X } from 'lucide-react-native';
import { useTheme } from '../../../hooks/useColorScheme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  showClose = false,
  onBack,
  onClose,
  leftAction,
  rightAction,
}: HeaderProps) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View
      className="flex-row items-center justify-between px-4 py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background }}
    >
      {/* Left section */}
      <View className="w-12">
        {showBack && (
          <TouchableOpacity onPress={handleBack} className="p-1">
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
        )}
        {showClose && (
          <TouchableOpacity onPress={handleClose} className="p-1">
            <X size={24} color={colors.foreground} />
          </TouchableOpacity>
        )}
        {leftAction}
      </View>

      {/* Center section */}
      <View className="flex-1 items-center">
        <Text className="text-lg font-semibold" style={{ color: colors.foreground }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs" style={{ color: colors.mutedForeground }} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right section */}
      <View className="w-12 items-end">{rightAction}</View>
    </View>
  );
}

// Simple header with just a title
export function SimpleHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <View
      className="px-4 py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background }}
    >
      <Text className="text-xl font-bold" style={{ color: colors.foreground }}>{title}</Text>
    </View>
  );
}
