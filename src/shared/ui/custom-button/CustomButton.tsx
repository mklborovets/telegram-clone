import React from 'react';
import { StyleSheet, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { theme } from '../../config/theme';

export interface CustomButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  children,
}) => {
  const scale = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .maxDuration(10000)
    .onBegin(() => {
      scale.value = withSpring(0.96, {
        damping: 30,
        stiffness: 300,
        overshootClamping: true,
      });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, {
        damping: 30,
        stiffness: 300,
        overshootClamping: true,
      });
    })
    .onEnd(() => {
      if (onPress) {
        runOnJS(onPress)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const variantStyle = styles[variant];
  const sizeStyle = sizeStyles[size];
  const textVariantStyle = textStyles[variant];

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[styles.base, variantStyle, sizeStyle, animatedStyle, style]}
      >
        {children ? (
          children
        ) : title ? (
          <Text style={[styles.textBase, textVariantStyle, textStyle]}>
            {title}
          </Text>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  textBase: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.sm + 2,
  },
  md: {
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.lg,
  },
  lg: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
});

const textStyles = StyleSheet.create({
  primary: {
    color: theme.colors.white,
  },
  secondary: {
    color: theme.colors.text,
  },
  danger: {
    color: theme.colors.white,
  },
  ghost: {
    color: theme.colors.primary,
  },
});
