export function getCanonicalDirectChatId(userAId?: string, userBId?: string): string {
  if (!userAId || !userBId) {
    const single = userAId || userBId || 'direct';
    return `direct_${single}`;
  }
  const sorted = [userAId, userBId].sort();
  return `direct_${sorted[0]}_${sorted[1]}`;
}

export function parseDirectChatPartnerId(chatId: string, currentUserId: string): string | null {
  if (!chatId) return null;
  if (chatId.startsWith('direct_')) {
    const parts = chatId.slice('direct_'.length).split('_');
    return parts.find((id) => id !== currentUserId) || null;
  }
  if (chatId.startsWith('direct-')) {
    return chatId.slice('direct-'.length);
  }
  return null;
}
