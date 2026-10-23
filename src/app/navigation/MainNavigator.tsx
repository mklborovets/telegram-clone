import React, { useState, useCallback, useEffect } from 'react';
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
import { FolderManagerPage } from '../../pages/folder-manager-page';
import { ChatProfilePage, MyProfilePage } from '../../pages/profile-page';
import { NavigationDrawer } from '../../widgets/drawer';
import { SlideScreen } from '../../shared/ui/slide-screen';
import { IChat, useChatStore } from '../../entities/chat';
import { useMessageStore } from '../../entities/message';
import { useUserStore, IUserProfile } from '../../entities/user';

export const MainNavigator: React.FC = () => {
  const { width } = useWindowDimensions();
  const profile = useUserStore((state) => state.profile);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [isChatProfileOpen, setIsChatProfileOpen] = useState(false);
  const [viewingUserProfile, setViewingUserProfile] = useState<IUserProfile | null>(null);

  useEffect(() => {
    if (profile.id) {
      if (useChatStore.getState().currentUserId !== profile.id) {
        useChatStore.getState().setUserSession(profile.id, profile.name);
      }
      if (useMessageStore.getState().currentUserId !== profile.id) {
        useMessageStore.getState().setUserSession(profile.id, profile.name);
      }
    }
  }, [profile.id, profile.name]);

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
        setViewingUserProfile(null);
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
      setViewingUserProfile(null);
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
            onOpenUserProfile={(user) => {
              setViewingUserProfile(user);
              setIsChatProfileOpen(true);
            }}
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

      <SlideScreen
        isOpen={isFolderManagerOpen}
        onClose={() => setIsFolderManagerOpen(false)}
        zIndex={200}
      >
        <FolderManagerPage onBack={() => setIsFolderManagerOpen(false)} />
      </SlideScreen>

      <SlideScreen
        isOpen={isMyProfileOpen}
        onClose={() => setIsMyProfileOpen(false)}
        zIndex={210}
      >
        <MyProfilePage
          onBack={() => setIsMyProfileOpen(false)}
          onOpenSavedMessages={handleOpenSavedMessages}
        />
      </SlideScreen>

      <SlideScreen
        isOpen={isChatProfileOpen && (Boolean(activeChatId) || Boolean(viewingUserProfile))}
        onClose={() => {
          setIsChatProfileOpen(false);
          setViewingUserProfile(null);
        }}
        zIndex={220}
      >
        {activeChatId || viewingUserProfile ? (
          <ChatProfilePage
            chatId={activeChatId || undefined}
            userProfile={viewingUserProfile}
            onBack={() => {
              setIsChatProfileOpen(false);
              setViewingUserProfile(null);
            }}
            onOpenChat={(chat) => {
              setIsChatProfileOpen(false);
              setViewingUserProfile(null);
              handleOpenChat(chat);
            }}
          />
        ) : null}
      </SlideScreen>
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
