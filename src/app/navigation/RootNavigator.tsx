import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  BackHandler,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { ChatListPage } from '../../pages/chat-list-page';
import { ChatRoomPage } from '../../pages/chat-room-page';
import { IChat, useChatStore } from '../../entities/chat';

export const RootNavigator: React.FC = () => {
  const { width } = useWindowDimensions();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const markAsRead = useChatStore((state) => state.markAsRead);

  const translateX = useSharedValue(0);

  const handleOpenChat = useCallback(
    (chat: IChat) => {
      setActiveChatId(chat.id);
      markAsRead(chat.id);
      translateX.value = withSpring(-width, {
        damping: 25,
        stiffness: 220,
      });
    },
    [width, markAsRead, translateX]
  );

  const handleBack = useCallback(() => {
    translateX.value = withSpring(
      0,
      { damping: 25, stiffness: 220 },
      (finished) => {
        if (finished) {
          runOnJS(setActiveChatId)(null);
        }
      }
    );
  }, [translateX]);

  useEffect(() => {
    const onBackPress = () => {
      if (activeChatId) {
        handleBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => subscription.remove();
  }, [activeChatId, handleBack]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.screensContainer,
          { width: width * 2 },
          animatedStyle,
        ]}
      >
        <View style={{ width, flex: 1 }}>
          <ChatListPage onOpenChat={handleOpenChat} />
        </View>

        <View style={{ width, flex: 1 }}>
          {activeChatId ? (
            <ChatRoomPage chatId={activeChatId} onBack={handleBack} />
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  screensContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#E4ECF2',
  },
});
