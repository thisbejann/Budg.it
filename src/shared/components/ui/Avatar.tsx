import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from '../../../hooks/useColorScheme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  size?: AvatarSize;
  source?: ImageSourcePropType;
  fallback?: string;
  backgroundColor?: string;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: 'h-8 w-8', text: 'text-xs' },
  md: { container: 'h-10 w-10', text: 'text-sm' },
  lg: { container: 'h-12 w-12', text: 'text-base' },
  xl: { container: 'h-16 w-16', text: 'text-lg' },
};

export function Avatar({
  size = 'md',
  source,
  fallback,
  backgroundColor,
  className,
}: AvatarProps) {
  const { colors } = useTheme();
  const bgColor = backgroundColor || colors.primary;
  const { container, text } = sizeStyles[size];

  if (source) {
    return (
      <View
        className={`overflow-hidden rounded-full ${container} ${className || ''}`}
      >
        <Image source={source} className="h-full w-full" resizeMode="cover" />
      </View>
    );
  }

  // Get initials from fallback text
  const initials = fallback
    ? fallback
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <View
      className={`items-center justify-center rounded-full ${container} ${className || ''}`}
      style={{ backgroundColor: bgColor }}
    >
      <Text className={`font-semibold text-white ${text}`}>{initials}</Text>
    </View>
  );
}

// Icon avatar for categories and accounts
interface IconAvatarProps {
  size?: AvatarSize;
  icon: React.ReactNode;
  backgroundColor?: string;
  className?: string;
}

export function IconAvatar({
  size = 'md',
  icon,
  backgroundColor,
  className,
}: IconAvatarProps) {
  const { colors, isDark } = useTheme();
  const bgColor = backgroundColor || colors.primary;
  const { container } = sizeStyles[size];

  return (
    <View
      className={`items-center justify-center rounded-full ${container} ${className || ''}`}
      style={[
        { backgroundColor: bgColor },
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
        isDark && { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
      ]}
    >
      {icon}
    </View>
  );
}
