import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { IChat, ChatRow } from '../../../entities/chat';
import { IUserProfile } from '../../../entities/user';
import { Avatar } from '../../../shared/ui/avatar';
import { theme } from '../../../shared/config/theme';

export interface GlobalSearchResultsProps {
  searchQuery: string;
  globalUsers: IUserProfile[];
  matchingChats: IChat[];
  onSelectUser: (user: IUserProfile) => void;
  onOpenChat: (chat: IChat) => void;
  onDismissKeyboard: () => void;
}

export const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({
  searchQuery,
  globalUsers,
  matchingChats,
  onSelectUser,
  onOpenChat,
  onDismissKeyboard,
}) => {
  const isAtQuery = searchQuery.trim().startsWith('@');

  const renderUsersSection = () => {
    if (globalUsers.length === 0) return null;
    return (
      <View>
        <View style={styles.searchSectionHeader}>
          <Text style={styles.searchSectionTitle}>GLOBAL SEARCH</Text>
        </View>
        {globalUsers.map((user) => (
          <Pressable
            key={user.id}
            style={({ pressed }) => [
              styles.userResultRow,
              pressed && styles.rowPressed,
            ]}
            onPress={() => onSelectUser(user)}
          >
            <Avatar
              name={user.name}
              avatarUrl={user.avatarUrl}
              size={48}
              isOnline={true}
            />
            <View style={styles.userResultInfo}>
              <View style={styles.userResultTop}>
                <Text style={styles.userResultName} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={styles.userResultStatus}>online</Text>
              </View>
              <Text style={styles.userResultTag} numberOfLines={1}>
                @{(user.username || '').replace(/^@/, '')}
                {user.bio ? `  •  ${user.bio}` : ''}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderChatsSection = () => {
    if (matchingChats.length === 0) return null;
    return (
      <View>
        <View style={styles.searchSectionHeader}>
          <Text style={styles.searchSectionTitle}>CHATS</Text>
        </View>
        {matchingChats.map((chat) => (
          <ChatRow
            key={chat.id}
            chat={chat}
            onPress={onOpenChat}
          />
        ))}
      </View>
    );
  };

  const hasNoResults = globalUsers.length === 0 && matchingChats.length === 0;

  return (
    <ScrollView
      style={styles.searchResultsContainer}
      contentContainerStyle={styles.searchResultsContent}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={onDismissKeyboard}
    >
      {isAtQuery ? (
        <>
          {renderUsersSection()}
          {renderChatsSection()}
        </>
      ) : (
        <>
          {renderChatsSection()}
          {renderUsersSection()}
        </>
      )}

      {hasNoResults && (
        <View style={styles.searchEmptyContainer}>
          <Search size={44} color={theme.colors.textMuted} />
          <Text style={styles.searchEmptyTitle}>No Results Found</Text>
          <Text style={styles.searchEmptySubtitle}>
            No chats or users matching "{searchQuery.trim()}". Try searching with @username.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  searchResultsContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchResultsContent: {
    paddingBottom: 40,
  },
  searchSectionHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  },
  searchSectionTitle: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    backgroundColor: theme.colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowPressed: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  userResultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  userResultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userResultName: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  userResultStatus: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  userResultTag: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  searchEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  searchEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  searchEmptySubtitle: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});
