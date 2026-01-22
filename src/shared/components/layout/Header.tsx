import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, X } from 'lucide-react-native';
import { COLORS } from '../../../constants/colors';

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
    <View className="flex-row items-center justify-between border-b border-border bg-background px-4 py-3">
      {/* Left section */}
      <View className="w-12">
        {showBack && (
          <TouchableOpacity onPress={handleBack} className="p-1">
            <ArrowLeft size={24} color={COLORS.foreground} />
          </TouchableOpacity>
        )}
        {showClose && (
          <TouchableOpacity onPress={handleClose} className="p-1">
            <X size={24} color={COLORS.foreground} />
          </TouchableOpacity>
        )}
        {leftAction}
      </View>

      {/* Center section */}
      <View className="flex-1 items-center">
        <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
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
  return (
    <View className="border-b border-border bg-background px-4 py-3">
      <Text className="text-xl font-bold text-foreground">{title}</Text>
    </View>
  );
}
