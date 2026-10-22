import React, { useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

export interface SwipeableRowRef {
  close: () => void;
}

export interface SwipeableRowProps {
  children: React.ReactNode;
  renderRightActions?: (close: () => void) => React.ReactNode;
  renderLeftActions?: (close: () => void) => React.ReactNode;
  rightActionsWidth?: number;
  leftActionsWidth?: number;
  onOpen?: () => void;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  enabled?: boolean;
}

export const SwipeableRow = forwardRef<SwipeableRowRef, SwipeableRowProps>(
  (
    {
      children,
      renderRightActions,
      renderLeftActions,
      rightActionsWidth = 180,
      leftActionsWidth = 80,
      onOpen,
      onClose,
      style,
      enabled = true,
    },
    ref
  ) => {
    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);

    const closeRow = () => {
      'worklet';
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 }, (finished) => {
        if (finished && onClose) {
          runOnJS(onClose)();
        }
      });
    };

    useImperativeHandle(ref, () => ({
      close: () => {
        closeRow();
      },
    }));

    const panGesture = Gesture.Pan()
      .enabled(enabled)
      .activeOffsetX([-15, 15])
      .failOffsetY([-10, 10])
      .onStart(() => {
        startX.value = translateX.value;
      })
      .onUpdate((event) => {
        const nextX = startX.value + event.translationX;
        const maxRight = renderLeftActions ? leftActionsWidth : 0;
        const maxLeft = renderRightActions ? -rightActionsWidth : 0;

        if (nextX > maxRight) {
          translateX.value = maxRight + (nextX - maxRight) * 0.2;
        } else if (nextX < maxLeft) {
          translateX.value = maxLeft + (nextX - maxLeft) * 0.2;
        } else {
          translateX.value = nextX;
        }
      })
      .onEnd((event) => {
        const maxRight = renderLeftActions ? leftActionsWidth : 0;
        const maxLeft = renderRightActions ? -rightActionsWidth : 0;

        if (event.velocityX < -500 && renderRightActions) {
          translateX.value = withSpring(maxLeft, { damping: 20, stiffness: 200 }, (finished) => {
            if (finished && onOpen) {
              runOnJS(onOpen)();
            }
          });
        } else if (event.velocityX > 500 && renderLeftActions) {
          translateX.value = withSpring(maxRight, { damping: 20, stiffness: 200 }, (finished) => {
            if (finished && onOpen) {
              runOnJS(onOpen)();
            }
          });
        } else if (translateX.value < maxLeft / 2 && renderRightActions) {
          translateX.value = withSpring(maxLeft, { damping: 20, stiffness: 200 }, (finished) => {
            if (finished && onOpen) {
              runOnJS(onOpen)();
            }
          });
        } else if (translateX.value > maxRight / 2 && renderLeftActions) {
          translateX.value = withSpring(maxRight, { damping: 20, stiffness: 200 }, (finished) => {
            if (finished && onOpen) {
              runOnJS(onOpen)();
            }
          });
        } else {
          closeRow();
        }
      });

    const animatedContentStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    const overlayAnimatedStyle = useAnimatedStyle(() => {
      const isOpen = Math.abs(translateX.value) > 10;
      return {
        display: isOpen ? 'flex' : 'none',
      };
    });

    const animatedRightStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        translateX.value,
        [-rightActionsWidth, 0],
        [1, 0],
        Extrapolation.CLAMP
      );
      return {
        opacity,
      };
    });

    const animatedLeftStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        translateX.value,
        [0, leftActionsWidth],
        [0, 1],
        Extrapolation.CLAMP
      );
      return {
        opacity,
      };
    });

    const triggerClose = () => {
      closeRow();
    };

    return (
      <View style={[styles.container, style]}>
        {renderRightActions ? (
          <Animated.View
            style={[
              styles.actionsContainer,
              styles.rightActions,
              { width: rightActionsWidth },
              animatedRightStyle,
            ]}
          >
            {renderRightActions(triggerClose)}
          </Animated.View>
        ) : null}

        {renderLeftActions ? (
          <Animated.View
            style={[
              styles.actionsContainer,
              styles.leftActions,
              { width: leftActionsWidth },
              animatedLeftStyle,
            ]}
          >
            {renderLeftActions(triggerClose)}
          </Animated.View>
        ) : null}

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.content, animatedContentStyle]}>
            {children}
            <Animated.View style={[styles.closeOverlay, overlayAnimatedStyle]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={triggerClose} />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
);

SwipeableRow.displayName = 'SwipeableRow';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    backgroundColor: 'transparent',
    position: 'relative',
  },
  closeOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
  },
  rightActions: {
    right: 0,
  },
  leftActions: {
    left: 0,
    justifyContent: 'flex-start',
  },
});
