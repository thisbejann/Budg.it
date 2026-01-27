import React from 'react';
import {
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { COLORS } from '../../../constants/colors';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'fab';

interface ButtonProps extends Omit<TouchableOpacityProps, 'onPress'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  fullRounded?: boolean;
  onPress?: () => void;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-primary',
  destructive: 'bg-destructive',
  outline: 'border border-input bg-background',
  secondary: 'bg-secondary',
  ghost: 'bg-transparent',
  link: 'bg-transparent',
};

const variantTextStyles: Record<ButtonVariant, string> = {
  default: 'text-white',
  destructive: 'text-white',
  outline: 'text-foreground',
  secondary: 'text-foreground',
  ghost: 'text-foreground',
  link: 'text-primary underline',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-12 px-4 py-3',
  sm: 'h-9 px-3 py-2',
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
  variant = 'default',
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

  const roundedClass = fullRounded || size === 'fab' ? 'rounded-full' : 'rounded-lg';

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        className={`
          flex-row items-center justify-center
          ${roundedClass}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${isDisabled ? 'opacity-50' : ''}
          ${className || ''}
        `}
        style={[animatedStyle, style]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'default' || variant === 'destructive' ? COLORS.primaryForeground : COLORS.primary}
            size="small"
          />
        ) : typeof children === 'string' ? (
          <Text
            className={`
              font-semibold
              ${variantTextStyles[variant]}
              ${sizeTextStyles[size]}
            `}
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
  variant = 'ghost',
  size = 'icon',
  ...props
}: Omit<ButtonProps, 'size'> & { size?: ButtonSize }) {
  return <Button variant={variant} size={size} {...props} />;
}

export function FAB({
  variant = 'default',
  ...props
}: Omit<ButtonProps, 'size' | 'fullRounded'>) {
  return <Button variant={variant} size="fab" fullRounded {...props} />;
}
