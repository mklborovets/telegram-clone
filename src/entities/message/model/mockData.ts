import { IMessage } from './types';

export const initialMessages: Record<string, IMessage[]> = {
  'chat-1': [
    {
      id: 'm-1-1',
      chatId: 'chat-1',
      text: 'Note: Check out the new Reanimated 4 and Gesture Handler features.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      isMe: true,
      isRead: true,
    },
    {
      id: 'm-1-2',
      chatId: 'chat-1',
      text: 'Remember to verify 120 FPS performance on native devices.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isMe: true,
      isRead: true,
    },
    {
      id: 'm-1-3',
      chatId: 'chat-1',
      text: 'Design tokens and system architecture drafted.',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isMe: true,
      isRead: true,
    },
  ],
  'chat-2': [
    {
      id: 'm-2-1',
      chatId: 'chat-2',
      text: 'Hi there! Did you get a chance to look at the UI mockups?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isMe: false,
      isRead: true,
    },
    {
      id: 'm-2-2',
      chatId: 'chat-2',
      text: 'Yes, they look really sleek! The gesture interactions feel very natural.',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      isMe: true,
      isRead: true,
    },
    {
      id: 'm-2-3',
      chatId: 'chat-2',
      text: 'Are we still meeting at 3 PM today?',
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      isMe: false,
      isRead: false,
    },
  ],
  'chat-3': [
    {
      id: 'm-3-1',
      chatId: 'chat-3',
      text: 'Morning team! Let us review the sprint goals.',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      isMe: false,
      isRead: true,
    },
    {
      id: 'm-3-2',
      chatId: 'chat-3',
      text: 'Alex: The gesture-handler release looks solid.',
      createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      isMe: false,
      isRead: false,
    },
  ],
};
