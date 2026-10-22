import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { theme } from '../../../shared/config/theme';

export interface TabItem {
  id: string;
  title: string;
  badge?: number;
}

export interface SwipeableTabsProps {
  tabs: TabItem[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  renderTabContent: (tab: TabItem, index: number) => React.ReactNode;
  headerRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface TabLayout {
  x: number;
  width: number;
}

export const SwipeableTabs: React.FC<SwipeableTabsProps> = ({
  tabs,
  activeIndex,
  onTabChange,
  renderTabContent,
  headerRight,
  style,
}) => {
  const { width } = useWindowDimensions();
  const [tabLayouts, setTabLayouts] = useState<Record<number, TabLayout>>({});
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const translateX = useSharedValue(-activeIndex * width);
  const startX = useSharedValue(-activeIndex * width);

  useEffect(() => {
    translateX.value = withSpring(-activeIndex * width, {
      damping: 22,
      stiffness: 220,
    });

    const activeLayout = tabLayouts[activeIndex];
    if (activeLayout && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: Math.max(0, activeLayout.x - width / 2 + activeLayout.width / 2),
        animated: true,
      });
    }
  }, [activeIndex, width, tabLayouts, translateX]);

  const handleTabPress = (index: number) => {
    onTabChange(index);
  };

  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width: tabWidth } = event.nativeEvent.layout;
    setTabLayouts((prev) => ({
      ...prev,
      [index]: { x, width: tabWidth },
    }));
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      const minTranslate = -(tabs.length - 1) * width;
      const maxTranslate = 0;
      const nextTranslate = startX.value + event.translationX;

      if (nextTranslate > maxTranslate) {
        translateX.value = maxTranslate + (nextTranslate - maxTranslate) * 0.25;
      } else if (nextTranslate < minTranslate) {
        translateX.value = minTranslate + (nextTranslate - minTranslate) * 0.25;
      } else {
        translateX.value = nextTranslate;
      }
    })
    .onEnd((event) => {
      const currentTranslate = translateX.value;
      const velocity = event.velocityX;

      let targetIndex = activeIndex;

      if (velocity < -400 && activeIndex < tabs.length - 1) {
        targetIndex = activeIndex + 1;
      } else if (velocity > 400 && activeIndex > 0) {
        targetIndex = activeIndex - 1;
      } else {
        targetIndex = Math.round(-currentTranslate / width);
        targetIndex = Math.max(0, Math.min(tabs.length - 1, targetIndex));
      }

      const targetX = -targetIndex * width;
      translateX.value = withSpring(targetX, {
        damping: 22,
        stiffness: 220,
      });

      if (targetIndex !== activeIndex) {
        runOnJS(onTabChange)(targetIndex);
      }
    });

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    if (tabs.length === 0) return { opacity: 0 };
    const currentPos = -translateX.value / width;
    const clampedPos = Math.max(0, Math.min(tabs.length - 1, currentPos));
    const baseIndex = Math.floor(clampedPos);
    const fraction = clampedPos - baseIndex;
    const nextIndex = Math.min(tabs.length - 1, baseIndex + 1);

    const defaultWidth = 80;
    const currentLayout = tabLayouts[baseIndex] || {
      x: baseIndex * defaultWidth,
      width: defaultWidth,
    };
    const nextLayout = tabLayouts[nextIndex] || {
      x: nextIndex * defaultWidth,
      width: defaultWidth,
    };

    const indicatorX =
      currentLayout.x + (nextLayout.x - currentLayout.x) * fraction;
    const indicatorW =
      currentLayout.width + (nextLayout.width - currentLayout.width) * fraction;

    return {
      transform: [{ translateX: indicatorX }],
      width: indicatorW,
      opacity: 1,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}
        >
          {tabs.map((tab, index) => {
            const isActive = index === activeIndex;
            return (
              <Pressable
                key={tab.id}
                onLayout={(e) => handleTabLayout(index, e)}
                onPress={() => handleTabPress(index)}
                style={styles.tabButton}
              >
                <Text
                  style={[
                    styles.tabTitle,
                    isActive && styles.tabTitleActive,
                  ]}
                >
                  {tab.title}
                </Text>
                {tab.badge && tab.badge > 0 ? (
                  <View
                    style={[
                      styles.badge,
                      isActive ? styles.badgeActive : styles.badgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        isActive
                          ? styles.badgeTextActive
                          : styles.badgeTextInactive,
                      ]}
                    >
                      {tab.badge}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}

          <Animated.View style={[styles.indicator, indicatorAnimatedStyle]} />
        </ScrollView>

        {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.contentContainer,
            { width: width * tabs.length },
            contentAnimatedStyle,
          ]}
        >
          {tabs.map((tab, index) => (
            <View key={tab.id} style={{ width, flex: 1 }}>
              {renderTabContent(tab, index)}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  tabBarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: theme.spacing.sm,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tabTitle: {
    ...theme.typography.subtitle,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  tabTitleActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: theme.colors.primary,
  },
  badgeInactive: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  badgeText: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: theme.colors.white,
  },
  badgeTextInactive: {
    color: theme.colors.textSecondary,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  headerRight: {
    paddingRight: theme.spacing.md,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
});
