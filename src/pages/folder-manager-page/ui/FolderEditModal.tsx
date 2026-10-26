import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
} from 'react-native';
import { Check, Folder } from 'lucide-react-native';
import { IChat, IChatFolder } from '../../../entities/chat';
import { Avatar } from '../../../shared/ui/avatar';
import { SearchBar } from '../../../shared/ui/search-bar';
import { SlideScreen } from '../../../shared/ui/slide-screen';
import { theme } from '../../../shared/config/theme';

export interface FolderEditModalProps {
  visible: boolean;
  folder: IChatFolder | null;
  chats: IChat[];
  onClose: () => void;
  onSave: (title: string, selectedChatIds: string[]) => void;
}

export const FolderEditModal: React.FC<FolderEditModalProps> = ({
  visible,
  folder,
  chats,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    if (folder) {
      setTitle(folder.title);
      setSelectedChatIds(folder.chatIds || []);
    } else {
      setTitle('');
      setSelectedChatIds([]);
    }
    setFilterQuery('');
  }, [folder, visible]);

  const handleToggleChat = (chatId: string) => {
    setSelectedChatIds((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(trimmed, selectedChatIds);
    onClose();
  };

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <SlideScreen isOpen={visible} onClose={onClose} zIndex={500}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8} style={styles.headerButton}>
            <Text style={styles.headerCancelText}>Cancel</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            {folder ? 'Edit Folder' : 'New Folder'}
          </Text>

          <Pressable
            onPress={handleSave}
            hitSlop={8}
            style={[
              styles.headerButton,
              !title.trim() && styles.headerButtonDisabled,
            ]}
            disabled={!title.trim()}
          >
            <Text
              style={[
                styles.headerSaveText,
                !title.trim() && styles.headerSaveTextDisabled,
              ]}
            >
              Done
            </Text>
          </Pressable>
        </View>

        <View style={styles.nameSection}>
          <View style={styles.nameIconWrapper}>
            <Folder size={24} color={theme.colors.primary} />
          </View>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Folder Name"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.nameInput}
            autoFocus={!folder}
          />
        </View>

        <View style={styles.chatsHeader}>
          <Text style={styles.chatsSectionTitle}>INCLUDED CHATS</Text>
          <Text style={styles.chatsCountBadge}>
            {selectedChatIds.length} selected
          </Text>
        </View>

        <SearchBar
          value={filterQuery}
          onChangeText={setFilterQuery}
          placeholder="Search chats"
          containerStyle={styles.searchBarWrapper}
        />

        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = selectedChatIds.includes(item.id);
            return (
              <Pressable
                style={styles.chatRow}
                onPress={() => handleToggleChat(item.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxActive,
                  ]}
                >
                  {isSelected ? (
                    <Check size={14} color={theme.colors.white} strokeWidth={3} />
                  ) : null}
                </View>

                <Avatar
                  name={item.title}
                  avatarUrl={item.avatarUrl}
                  size={42}
                />

                <View style={styles.chatDetails}>
                  <Text style={styles.chatTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.chatSubtitle} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </SlideScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F7',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.white,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  headerButtonDisabled: {
    opacity: 0.4,
  },
  headerTitle: {
    ...theme.typography.title,
    fontSize: 17,
    fontWeight: '600',
  },
  headerCancelText: {
    color: theme.colors.primary,
    fontSize: 16,
  },
  headerSaveText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerSaveTextDisabled: {
    color: theme.colors.textMuted,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.divider,
  },
  nameIconWrapper: {
    marginRight: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 17,
    color: theme.colors.text,
    paddingVertical: 6,
  },
  chatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  chatsSectionTitle: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  chatsCountBadge: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  searchBarWrapper: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  listContent: {
    backgroundColor: theme.colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.divider,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F2',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chatDetails: {
    flex: 1,
    marginLeft: 12,
  },
  chatTitle: {
    ...theme.typography.title,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  chatSubtitle: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
});
