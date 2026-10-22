import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useChatStore } from '../../../entities/chat';
import { useMessageStore } from '../../../entities/message';
import { ChatHeader, MessageList } from '../../../widgets/chat-room-view';
import { SendMessageBar } from '../../../features/send-message';

export interface ChatRoomPageProps {
  chatId: string;
  onBack: () => void;
}

const EMPTY_MESSAGES: any[] = [];

export const ChatRoomPage: React.FC<ChatRoomPageProps> = ({
  chatId,
  onBack,
}) => {
  const chat = useChatStore((state) =>
    state.chats.find((c) => c.id === chatId)
  );
  const messages = useMessageStore(
    (state) => state.messages[chatId] || EMPTY_MESSAGES
  );

  const keyboard = useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true });

  const keyboardAnimatedStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboard.height.value,
  }));

  if (!chat) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ChatHeader chat={chat} onBack={onBack} />
      <Animated.View style={[styles.chatContent, keyboardAnimatedStyle]}>
        <MessageList messages={messages} />
        <SendMessageBar chatId={chatId} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4ECF2',
  },
  chatContent: {
    flex: 1,
  },
});
