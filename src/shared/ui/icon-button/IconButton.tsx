import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

export interface IconButtonProps {
  onPress?: () => void;
  size?: number;
  backgroundColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  size = 40,
  backgroundColor = 'transparent',
  disabled = false,
  style,
  children,
}) => {
  const scale = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .maxDuration(10000)
    .onBegin(() => {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 350 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 350 });
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

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.base,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
          },
          animatedStyle,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
