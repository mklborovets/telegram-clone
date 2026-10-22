import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useChatStore } from '../../../entities/chat';
import { useMessageStore } from '../../../entities/message';
import { ChatHeader, MessageList } from '../../../widgets/chat-room-view';
import { SendMessageBar } from '../../../features/send-message';

export interface ChatRoomPageProps {
  chatId: string;
  onBack: () => void;
}

export const ChatRoomPage: React.FC<ChatRoomPageProps> = ({
  chatId,
  onBack,
}) => {
  const chat = useChatStore((state) =>
    state.chats.find((c) => c.id === chatId)
  );
  const messages = useMessageStore(
    (state) => state.messages[chatId] || []
  );

  if (!chat) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ChatHeader chat={chat} onBack={onBack} />
      <MessageList messages={messages} />
      <SendMessageBar chatId={chatId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4ECF2',
  },
});
