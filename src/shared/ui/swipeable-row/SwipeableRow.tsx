import React, { useImperativeHandle, forwardRef } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface SwipeableRowRef {
  close: () => void;
}

export interface SwipeableRowProps {
  children: React.ReactNode;
  renderRightActions?: (close: () => void) => React.ReactNode;
  renderLeftActions?: (close: () => void) => React.ReactNode;
  rightActionsWidth?: number;
  leftActionsWidth?: number;
  edgeThreshold?: number;
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
      edgeThreshold = 0.25,
      onOpen,
      onClose,
      style,
      enabled = true,
    },
    ref
  ) => {
    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);
    const touchStartX = useSharedValue(0);
    const touchStartY = useSharedValue(0);

    const closeRow = () => {
      'worklet';
      translateX.value = withSpring(0, {
        damping: 30,
        stiffness: 240,
        overshootClamping: true,
      }, (finished) => {
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
      .manualActivation(true)
      .onTouchesDown((event) => {
        'worklet';
        if (event.allTouches && event.allTouches.length > 0) {
          touchStartX.value = event.allTouches[0].x;
          touchStartY.value = event.allTouches[0].y;
        }
      })
      .onTouchesMove((event, stateManager) => {
        'worklet';
        if (!event.allTouches || event.allTouches.length === 0) return;
        const currentX = event.allTouches[0].x;
        const currentY = event.allTouches[0].y;
        const dx = currentX - touchStartX.value;
        const dy = currentY - touchStartY.value;

        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
          stateManager.fail();
          return;
        }

        const isOpen = Math.abs(translateX.value) > 10;
        if (isOpen) {
          if (Math.abs(dx) > 8) {
            stateManager.activate();
          }
          return;
        }

        const isLeftEdge = touchStartX.value < SCREEN_WIDTH * edgeThreshold;
        const isRightEdge = touchStartX.value > SCREEN_WIDTH * (1 - edgeThreshold);

        if (Math.abs(dx) > 15) {
          if (isLeftEdge || isRightEdge) {
            stateManager.activate();
          } else {
            stateManager.fail();
          }
        }
      })
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
        const springConfig = {
          damping: 30,
          stiffness: 240,
          overshootClamping: true,
        };

        if (event.velocityX < -500 && renderRightActions) {
          translateX.value = withSpring(maxLeft, springConfig, (finished) => {
            if (finished && onOpen) {
              runOnJS(onOpen)();
            }
          });
        } else if (event.velocityX > 500 && renderLeftActions) {
          translateX.value = withSpring(maxRight, springConfig, (finished) => {
            if (finished && onOpen) {
              runOnJS(onOpen)();
            }
          });
        } else if (translateX.value < maxLeft / 2 && renderRightActions) {
          translateX.value = withSpring(maxLeft, springConfig, (finished) => {
            if (finished && onOpen) {
              runOnJS(onOpen)();
            }
          });
        } else if (translateX.value > maxRight / 2 && renderLeftActions) {
          translateX.value = withSpring(maxRight, springConfig, (finished) => {
            if (finished && onOpen) {
              runOnJS(onOpen)();
            }
          });
        } else {
          closeRow();
        }
      });

    const tapGesture = Gesture.Tap()
      .maxDuration(250)
      .onEnd(() => {
        if (Math.abs(translateX.value) > 10) {
          closeRow();
        }
      });

    const composedGesture = Gesture.Race(panGesture, tapGesture);

    const animatedContentStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

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

        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.content, animatedContentStyle]}>
            {children}
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
