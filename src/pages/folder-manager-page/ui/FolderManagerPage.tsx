import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Folder,
  FolderOpen,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { useChatStore, IChatFolder } from '../../../entities/chat';
import { IconButton } from '../../../shared/ui/icon-button';
import { theme } from '../../../shared/config/theme';
import { FolderEditModal } from './FolderEditModal';

export interface FolderManagerPageProps {
  onBack: () => void;
}

export const FolderManagerPage: React.FC<FolderManagerPageProps> = ({
  onBack,
}) => {
  const folders = useChatStore((state) => state.folders);
  const chats = useChatStore((state) => state.chats);
  const createFolder = useChatStore((state) => state.createFolder);
  const updateFolder = useChatStore((state) => state.updateFolder);
  const deleteFolder = useChatStore((state) => state.deleteFolder);
  const reorderFolders = useChatStore((state) => state.reorderFolders);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<IChatFolder | null>(null);

  const handleCreateNew = () => {
    setSelectedFolder(null);
    setIsModalVisible(true);
  };

  const handleEditFolder = (folder: IChatFolder) => {
    setSelectedFolder(folder);
    setIsModalVisible(true);
  };

  const handleSaveModal = (title: string, selectedChatIds: string[]) => {
    if (selectedFolder) {
      updateFolder(selectedFolder.id, title, selectedChatIds);
    } else {
      createFolder(title, selectedChatIds);
    }
  };

  const handleDeleteFolder = (folder: IChatFolder) => {
    if (folder.isSystem) return;
    deleteFolder(folder.id);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newFolders = [...folders];
    const temp = newFolders[index];
    newFolders[index] = newFolders[index - 1];
    newFolders[index - 1] = temp;
    reorderFolders(newFolders);
  };

  const handleMoveDown = (index: number) => {
    if (index >= folders.length - 1) return;
    const newFolders = [...folders];
    const temp = newFolders[index];
    newFolders[index] = newFolders[index + 1];
    newFolders[index + 1] = temp;
    reorderFolders(newFolders);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton size={40} onPress={onBack}>
          <ArrowLeft size={22} color={theme.colors.text} />
        </IconButton>
        <Text style={styles.headerTitle}>Chat Folders</Text>
        <IconButton size={40} onPress={handleCreateNew}>
          <Plus size={22} color={theme.colors.primary} />
        </IconButton>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <View style={styles.bannerIconWrapper}>
            <FolderOpen size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.bannerTitle}>Chat Folders</Text>
          <Text style={styles.bannerDescription}>
            Create folders for different groups of chats and quickly switch
            between them.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FOLDERS</Text>
        </View>

        <View style={styles.foldersList}>
          {folders.map((folder, index) => {
            const count = folder.chatIds ? folder.chatIds.length : 0;
            return (
              <View key={folder.id} style={styles.folderRow}>
                <View style={styles.folderIconWrapper}>
                  <Folder
                    size={22}
                    color={
                      folder.id === 'all'
                        ? theme.colors.textSecondary
                        : theme.colors.primary
                    }
                  />
                </View>

                <View style={styles.folderInfo}>
                  <Text style={styles.folderTitle} numberOfLines={1}>
                    {folder.title}
                  </Text>
                  <Text style={styles.folderSubtitle}>
                    {folder.id === 'all'
                      ? 'All chats included'
                      : `${count} ${count === 1 ? 'chat' : 'chats'}`}
                  </Text>
                </View>

                <View style={styles.folderActions}>
                  <Pressable
                    style={[
                      styles.actionButton,
                      index === 0 && styles.actionButtonDisabled,
                    ]}
                    onPress={() => handleMoveUp(index)}
                    disabled={index === 0}
                    hitSlop={6}
                  >
                    <ChevronUp
                      size={18}
                      color={index === 0 ? '#D1D5DB' : theme.colors.textSecondary}
                    />
                  </Pressable>

                  <Pressable
                    style={[
                      styles.actionButton,
                      index === folders.length - 1 && styles.actionButtonDisabled,
                    ]}
                    onPress={() => handleMoveDown(index)}
                    disabled={index === folders.length - 1}
                    hitSlop={6}
                  >
                    <ChevronDown
                      size={18}
                      color={
                        index === folders.length - 1
                          ? '#D1D5DB'
                          : theme.colors.textSecondary
                      }
                    />
                  </Pressable>

                  {!folder.isSystem ? (
                    <>
                      <Pressable
                        style={styles.actionButton}
                        onPress={() => handleEditFolder(folder)}
                        hitSlop={6}
                      >
                        <Pencil size={17} color={theme.colors.primary} />
                      </Pressable>

                      <Pressable
                        style={styles.actionButton}
                        onPress={() => handleDeleteFolder(folder)}
                        hitSlop={6}
                      >
                        <Trash2 size={17} color={theme.colors.danger} />
                      </Pressable>
                    </>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        <Pressable style={styles.createFolderButton} onPress={handleCreateNew}>
          <Plus size={20} color={theme.colors.primary} style={styles.createFolderIcon} />
          <Text style={styles.createFolderText}>Create New Folder</Text>
        </Pressable>

        <Text style={styles.footerHint}>
          Swipe tabs horizontally on the main screen to navigate between your
          custom chat folders.
        </Text>
      </ScrollView>

      <FolderEditModal
        visible={isModalVisible}
        folder={selectedFolder}
        chats={chats.filter((c) => !c.isArchived)}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveModal}
      />
    </SafeAreaView>
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
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.white,
  },
  headerTitle: {
    ...theme.typography.title,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  banner: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  bannerIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E7F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bannerTitle: {
    ...theme.typography.title,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  bannerDescription: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  foldersList: {
    backgroundColor: theme.colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.divider,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F2',
  },
  folderIconWrapper: {
    marginRight: 14,
  },
  folderInfo: {
    flex: 1,
  },
  folderTitle: {
    ...theme.typography.title,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  folderSubtitle: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  folderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 7,
    marginLeft: 4,
  },
  actionButtonDisabled: {
    opacity: 0.3,
  },
  createFolderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.divider,
  },
  createFolderIcon: {
    marginRight: 12,
  },
  createFolderText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  footerHint: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textMuted,
    paddingHorizontal: 16,
    paddingTop: 12,
    lineHeight: 18,
  },
});
