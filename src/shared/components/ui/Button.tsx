import React from 'react';
import {
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../../hooks/useColorScheme';

// MD3 variants + destructive for delete actions
type ButtonVariant = 'filled' | 'outlined' | 'tonal' | 'text' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'fab';

interface ButtonProps extends Omit<TouchableOpacityProps, 'onPress'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  fullRounded?: boolean;
  onPress?: () => void;
}

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-12 px-6 py-3',
  sm: 'h-9 px-4 py-2',
  lg: 'h-14 px-8 py-4',
  icon: 'h-10 w-10',
  fab: 'h-14 w-14',
};

const sizeTextStyles: Record<ButtonSize, string> = {
  default: 'text-base',
  sm: 'text-sm',
  lg: 'text-lg',
  icon: 'text-base',
  fab: 'text-xl',
};

export function Button({
  variant = 'filled',
  size = 'default',
  loading = false,
  disabled,
  children,
  className,
  fullRounded = false,
  onPress,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const gesture = Gesture.Tap()
    .enabled(!isDisabled)
    .onBegin(() => {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    })
    .onEnd(() => {
      if (onPress) {
        runOnJS(onPress)();
      }
    });

  // MD3 uses 20dp full radius for buttons
  const roundedClass = fullRounded || size === 'fab' ? 'rounded-full' : 'rounded-[20px]';

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.primary,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.outline,
        };
      case 'tonal':
        return {
          backgroundColor: colors.primaryContainer,
          borderWidth: 0,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'destructive':
        return {
          backgroundColor: colors.destructive,
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderWidth: 0,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'filled':
        return colors.onPrimary;
      case 'outlined':
        return colors.primary;
      case 'tonal':
        return colors.onPrimaryContainer;
      case 'text':
        return colors.primary;
      case 'destructive':
        return colors.destructiveForeground;
      default:
        return colors.onPrimary;
    }
  };

  const variantStyles = getVariantStyles();
  const textColor = getTextColor();

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        className={`
          flex-row items-center justify-center
          ${roundedClass}
          ${sizeStyles[size]}
          ${isDisabled ? 'opacity-50' : ''}
          ${className || ''}
        `}
        style={[animatedStyle, variantStyles, style]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            color={textColor}
            size="small"
          />
        ) : typeof children === 'string' ? (
          <Text
            className={`font-semibold ${sizeTextStyles[size]}`}
            style={{ color: textColor }}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export function IconButton({
  variant = 'text',
  size = 'icon',
  ...props
}: Omit<ButtonProps, 'size'> & { size?: ButtonSize }) {
  return <Button variant={variant} size={size} {...props} />;
}

export function FAB({
  variant = 'filled',
  ...props
}: Omit<ButtonProps, 'size' | 'fullRounded'>) {
  return <Button variant={variant} size="fab" fullRounded {...props} />;
}
