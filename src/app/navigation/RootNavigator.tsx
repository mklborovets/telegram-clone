import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  BackHandler,
  Modal,
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
import { FolderManagerPage } from '../../pages/folder-manager-page';
import { ChatProfilePage, MyProfilePage } from '../../pages/profile-page';
import { NavigationDrawer } from '../../widgets/drawer';
import { IChat, useChatStore } from '../../entities/chat';
import { useMessageStore } from '../../entities/message';

export const RootNavigator: React.FC = () => {
  const { width } = useWindowDimensions();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [isChatProfileOpen, setIsChatProfileOpen] = useState(false);

  const chats = useChatStore((state) => state.chats);
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
      if (isChatProfileOpen) {
        setIsChatProfileOpen(false);
        return true;
      }
      if (isMyProfileOpen) {
        setIsMyProfileOpen(false);
        return true;
      }
      if (isFolderManagerOpen) {
        setIsFolderManagerOpen(false);
        return true;
      }
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
        return true;
      }
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
  }, [
    isChatProfileOpen,
    isMyProfileOpen,
    isFolderManagerOpen,
    isDrawerOpen,
    activeChatId,
    isArchiveOpen,
    handleBack,
    handleBackFromArchive,
  ]);

  const handleOpenSavedMessages = useCallback(() => {
    const savedChat = chats.find(
      (c) =>
        c.id === 'chat-1' ||
        c.id === 'chat-saved' ||
        c.title.toLowerCase().includes('saved')
    );
    if (savedChat) {
      setIsDrawerOpen(false);
      setIsMyProfileOpen(false);
      setIsChatProfileOpen(false);
      handleOpenChat(savedChat);
    }
  }, [chats, handleOpenChat]);

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
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onOpenFolderManager={() => setIsFolderManagerOpen(true)}
          />
        </View>

        <View style={{ width, flex: 1 }}>
          {isArchiveOpen ? (
            <ArchivePage
              onBack={handleBackFromArchive}
              onOpenChat={handleOpenChat}
            />
          ) : activeChatId ? (
            <ChatRoomPage
              chatId={activeChatId}
              onBack={handleBack}
              onOpenProfile={() => setIsChatProfileOpen(true)}
            />
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        <View style={{ width, flex: 1 }}>
          {isArchiveOpen && activeChatId ? (
            <ChatRoomPage
              chatId={activeChatId}
              onBack={handleBack}
              onOpenProfile={() => setIsChatProfileOpen(true)}
            />
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </Animated.View>

      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenFolderManager={() => setIsFolderManagerOpen(true)}
        onOpenSavedMessages={handleOpenSavedMessages}
        onOpenProfile={() => setIsMyProfileOpen(true)}
      />

      <Modal
        visible={isFolderManagerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsFolderManagerOpen(false)}
      >
        <FolderManagerPage onBack={() => setIsFolderManagerOpen(false)} />
      </Modal>

      <Modal
        visible={isMyProfileOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsMyProfileOpen(false)}
      >
        <MyProfilePage
          onBack={() => setIsMyProfileOpen(false)}
          onOpenSavedMessages={handleOpenSavedMessages}
        />
      </Modal>

      <Modal
        visible={isChatProfileOpen && Boolean(activeChatId)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsChatProfileOpen(false)}
      >
        {activeChatId ? (
          <ChatProfilePage
            chatId={activeChatId}
            onBack={() => setIsChatProfileOpen(false)}
            onOpenChat={(chat) => {
              setIsChatProfileOpen(false);
              handleOpenChat(chat);
            }}
          />
        ) : null}
      </Modal>
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
