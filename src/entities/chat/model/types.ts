export interface IChat {
  id: string;
  title: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  isPersonal: boolean;
  isOnline?: boolean;
  lastMessageSenderMe?: boolean;
  lastMessageRead?: boolean;
  pinnedAt?: number;
}

export type ChatCategory = 'all' | 'personal' | 'archive';
