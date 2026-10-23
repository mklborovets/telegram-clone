import React, { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

export interface SlideScreenProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zIndex?: number;
}

export const SlideScreen: React.FC<SlideScreenProps> = ({
  isOpen,
  onClose,
  children,
  zIndex = 100,
}) => {
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(isOpen);

  const translateX = useSharedValue(isOpen ? 0 : width);
  const backdropOpacity = useSharedValue(isOpen ? 1 : 0);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      translateX.value = withSpring(0, {
        damping: 30,
        stiffness: 260,
        overshootClamping: true,
      });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateX.value = withTiming(width, { duration: 240 }, (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
    }
  }, [isOpen, width, backdropOpacity, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!mounted) {
    return null;
  }

  return (
    <View style={[styles.container, { zIndex }]} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.screen, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  screen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
});
