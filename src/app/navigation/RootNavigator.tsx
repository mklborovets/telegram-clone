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
import { ArchivePage } from '../../pages/archive-page';
import { IChat, useChatStore } from '../../entities/chat';
import { useMessageStore } from '../../entities/message';

export const RootNavigator: React.FC = () => {
  const { width } = useWindowDimensions();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const markAsRead = useChatStore((state) => state.markAsRead);
  const markMessagesAsRead = useMessageStore((state) => state.markAsRead);

  const translateX = useSharedValue(0);

  const handleOpenChat = useCallback(
    (chat: IChat) => {
      setActiveChatId(chat.id);
      markAsRead(chat.id);
      markMessagesAsRead(chat.id);
      const targetX = isArchiveOpen ? -width * 2 : -width;
      translateX.value = withSpring(targetX, {
        damping: 30,
        stiffness: 260,
        overshootClamping: true,
      });
    },
    [isArchiveOpen, width, markAsRead, markMessagesAsRead, translateX]
  );

  const handleOpenArchive = useCallback(() => {
    setIsArchiveOpen(true);
    translateX.value = withSpring(-width, {
      damping: 30,
      stiffness: 260,
      overshootClamping: true,
    });
  }, [width, translateX]);

  const handleBack = useCallback(() => {
    const targetX = isArchiveOpen ? -width : 0;
    translateX.value = withSpring(
      targetX,
      { damping: 30, stiffness: 260, overshootClamping: true },
      (finished) => {
        if (finished) {
          runOnJS(setActiveChatId)(null);
        }
      }
    );
  }, [isArchiveOpen, width, translateX]);

  const handleBackFromArchive = useCallback(() => {
    translateX.value = withSpring(
      0,
      { damping: 30, stiffness: 260, overshootClamping: true },
      (finished) => {
        if (finished) {
          runOnJS(setIsArchiveOpen)(false);
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
      if (isArchiveOpen) {
        handleBackFromArchive();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => subscription.remove();
  }, [activeChatId, isArchiveOpen, handleBack, handleBackFromArchive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.screensContainer,
          { width: width * 3 },
          animatedStyle,
        ]}
      >
        <View style={{ width, flex: 1 }}>
          <ChatListPage
            onOpenChat={handleOpenChat}
            onOpenArchive={handleOpenArchive}
          />
        </View>

        <View style={{ width, flex: 1 }}>
          {isArchiveOpen ? (
            <ArchivePage
              onBack={handleBackFromArchive}
              onOpenChat={handleOpenChat}
            />
          ) : activeChatId ? (
            <ChatRoomPage chatId={activeChatId} onBack={handleBack} />
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        <View style={{ width, flex: 1 }}>
          {isArchiveOpen && activeChatId ? (
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
