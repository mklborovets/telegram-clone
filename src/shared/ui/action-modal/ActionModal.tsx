import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { CustomButton } from '../custom-button';
import { theme } from '../../config/theme';

export interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  icon?: React.ReactNode;
  iconBackgroundColor?: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger';
  cancelText?: string;
  onConfirm?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  visible,
  onClose,
  title,
  message,
  icon,
  iconBackgroundColor,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  cancelText = 'Cancel',
  onConfirm,
  style,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.card, style]}>
          {icon ? (
            <View
              style={[
                styles.iconContainer,
                Boolean(iconBackgroundColor) && { backgroundColor: iconBackgroundColor },
              ]}
            >
              {icon}
            </View>
          ) : null}

          <Text style={styles.title}>{title}</Text>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            {onConfirm ? (
              <CustomButton
                title={confirmText}
                variant={confirmVariant}
                onPress={onConfirm}
                style={styles.actionButton}
              />
            ) : null}
            <CustomButton
              title={cancelText}
              variant="secondary"
              onPress={onClose}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    ...theme.typography.title,
    fontSize: 19,
    textAlign: 'center',
    color: theme.colors.text,
  },
  message: {
    ...theme.typography.body,
    fontSize: 14,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    width: '100%',
    height: 44,
  },
});
