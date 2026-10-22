export interface IMessage {
  id: string;
  chatId: string;
  text: string;
  createdAt: string;
  isMe: boolean;
  isRead?: boolean;
}
