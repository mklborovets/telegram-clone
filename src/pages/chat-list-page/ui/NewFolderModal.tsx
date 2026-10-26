import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TextInput } from 'react-native';
import { X } from 'lucide-react-native';
import { IconButton } from '../../../shared/ui/icon-button';
import { CustomButton } from '../../../shared/ui/custom-button';
import { theme } from '../../../shared/config/theme';

export interface NewFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setTitle('');
  };

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Folder</Text>
            <IconButton size={32} onPress={handleClose}>
              <X size={20} color={theme.colors.textMuted} />
            </IconButton>
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Folder Name"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.modalInput}
            autoFocus
          />

          <View style={styles.modalActions}>
            <CustomButton
              title="Cancel"
              variant="ghost"
              onPress={handleClose}
              style={styles.modalButton}
            />
            <CustomButton
              title="Create"
              variant="primary"
              onPress={handleCreate}
              disabled={!title.trim()}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    minWidth: 80,
  },
});
