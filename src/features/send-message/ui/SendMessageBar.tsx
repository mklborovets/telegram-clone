import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  type TextInputInstance,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  SendHorizontal,
  Pencil,
  X,
  Check,
  Paperclip,
  Image as ImageIcon,
  FileText,
} from 'lucide-react-native';
import { useMessageStore, IMessage } from '../../../entities/message';
import { theme } from '../../../shared/config/theme';
import { pickImageFromGallery, pickDocumentFile } from '../../../shared/lib/mediaPicker';

const MIN_INPUT_HEIGHT = 24;
const LINE_HEIGHT = 20;
const MAX_LINES = 5;
const MAX_INPUT_HEIGHT = MIN_INPUT_HEIGHT + (MAX_LINES - 1) * LINE_HEIGHT;

export interface SendMessageBarProps {
  chatId: string;
  editingMessage?: IMessage | null;
  onCancelEdit?: () => void;
  onSend?: (text: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const SendMessageBar: React.FC<SendMessageBarProps> = ({
  chatId,
  editingMessage,
  onCancelEdit,
  onSend,
  style,
}) => {
  const [text, setText] = useState('');
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const rawContentHeight = useRef(MIN_INPUT_HEIGHT);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const inputRef = useRef<TextInputInstance>(null);
  const addMessage = useMessageStore((state) => state.addMessage);
  const editMessage = useMessageStore((state) => state.editMessage);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const hasText = text.trim().length > 0;

  const computeHeight = (contentH?: number, currentText: string = text) => {
    if (!currentText || currentText.length === 0) {
      return MIN_INPUT_HEIGHT;
    }
    const lines = currentText.split('\n').length;
    const linesHeight = MIN_INPUT_HEIGHT + (lines - 1) * LINE_HEIGHT;
    const measuredHeight = contentH !== undefined ? contentH : MIN_INPUT_HEIGHT;
    const raw = Math.max(measuredHeight, linesHeight);
    return Math.max(MIN_INPUT_HEIGHT, Math.min(MAX_INPUT_HEIGHT, Math.round(raw)));
  };

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
      rawContentHeight.current = MIN_INPUT_HEIGHT;
      setInputHeight(computeHeight(undefined, editingMessage.text));
    }
  }, [editingMessage]);

  useEffect(() => {
    if (hasText || editingMessage) {
      scale.value = withSpring(1, {
        damping: 28,
        stiffness: 260,
        overshootClamping: true,
      });
      opacity.value = withTiming(1, { duration: 150 });
    } else {
      scale.value = withSpring(0, {
        damping: 28,
        stiffness: 260,
        overshootClamping: true,
      });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [hasText, editingMessage, scale, opacity]);

  const handleTextChange = (val: string) => {
    setText(val);
    const newH = computeHeight(rawContentHeight.current, val);
    setInputHeight(newH);
  };

  const handleContentSizeChange = (e: {
    nativeEvent: { contentSize: { height: number } };
  }) => {
    const h = e.nativeEvent.contentSize.height;
    if (h > 0) {
      rawContentHeight.current = h;
      const newH = computeHeight(h, text);
      setInputHeight(newH);
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (editingMessage) {
      editMessage(chatId, editingMessage.id, trimmed);
      if (onCancelEdit) {
        onCancelEdit();
      }
    } else {
      addMessage(chatId, trimmed, true);
    }

    if (onSend) {
      onSend(trimmed);
    }
    setText('');
    rawContentHeight.current = MIN_INPUT_HEIGHT;
    setInputHeight(MIN_INPUT_HEIGHT);
    inputRef.current?.clear();
  };

  const handleSendPhoto = async () => {
    setShowAttachMenu(false);
    const media = await pickImageFromGallery();
    if (media && media.uri) {
      const caption = text.trim();
      addMessage(
        chatId,
        caption,
        true,
        'photo',
        media.uri,
        media.fileName,
        media.fileSize
      );
      if (caption) {
        setText('');
        rawContentHeight.current = MIN_INPUT_HEIGHT;
        setInputHeight(MIN_INPUT_HEIGHT);
        inputRef.current?.clear();
      }
    }
  };

  const handleSendFile = async () => {
    setShowAttachMenu(false);
    const media = await pickDocumentFile();
    if (media) {
      addMessage(
        chatId,
        media.fileName || 'Document',
        true,
        'file',
        media.uri,
        media.fileName,
        media.fileSize
      );
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.wrapper, style]}>
      {editingMessage ? (
        <View style={styles.editBanner}>
          <Pencil size={18} color={theme.colors.primary} style={styles.editBannerIcon} />
          <View style={styles.editBannerText}>
            <Text style={styles.editBannerTitle}>Edit Message</Text>
            <Text style={styles.editBannerSubtitle} numberOfLines={1}>
              {editingMessage.text}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              setText('');
              rawContentHeight.current = MIN_INPUT_HEIGHT;
              setInputHeight(MIN_INPUT_HEIGHT);
              inputRef.current?.clear();
              if (onCancelEdit) {
                onCancelEdit();
              }
            }}
            hitSlop={8}
            style={styles.editBannerClose}
          >
            <X size={18} color={theme.colors.textMuted} />
          </Pressable>
        </View>
      ) : null}

      {showAttachMenu ? (
        <View style={styles.attachMenu}>
          <Pressable onPress={handleSendPhoto} style={styles.attachOption}>
            <View style={[styles.attachIconBg, { backgroundColor: '#34C759' }]}>
              <ImageIcon size={18} color={theme.colors.white} />
            </View>
            <Text style={styles.attachOptionText}>Photo</Text>
          </Pressable>
          <Pressable onPress={handleSendFile} style={styles.attachOption}>
            <View style={[styles.attachIconBg, { backgroundColor: '#007AFF' }]}>
              <FileText size={18} color={theme.colors.white} />
            </View>
            <Text style={styles.attachOptionText}>File</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.inputRow}>
        <Pressable
          onPress={() => setShowAttachMenu((prev) => !prev)}
          hitSlop={8}
          style={styles.attachButton}
        >
          <Paperclip
            size={22}
            color={showAttachMenu ? theme.colors.primary : theme.colors.textMuted}
          />
        </Pressable>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={handleTextChange}
            placeholder={editingMessage ? 'Edit message' : 'Message'}
            placeholderTextColor={theme.colors.textMuted}
            multiline
            blurOnSubmit={false}
            submitBehavior="newline"
            scrollEnabled={true}
            onContentSizeChange={handleContentSizeChange}
            style={[
              styles.input,
              {
                height: inputHeight,
              },
            ]}
          />
        </View>

        <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
          <Pressable
            onPress={handleSend}
            disabled={!hasText && !editingMessage}
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.sendButtonPressed,
            ]}
          >
            {editingMessage ? (
              <Check size={20} color={theme.colors.white} />
            ) : (
              <SendHorizontal size={20} color={theme.colors.white} />
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  editBannerIcon: {
    marginRight: 10,
  },
  editBannerText: {
    flex: 1,
    justifyContent: 'center',
  },
  editBannerTitle: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  editBannerSubtitle: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  editBannerClose: {
    padding: 4,
  },
  attachMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    backgroundColor: theme.colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    gap: 20,
  },
  attachOption: {
    alignItems: 'center',
  },
  attachIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  attachOptionText: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  attachButton: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    marginBottom: 0,
  },
  inputContainer: {
    flex: 1,
    minHeight: 40,
    maxHeight: 124,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 8,
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  input: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '400',
    paddingTop: 0,
    paddingBottom: 0,
  },
  buttonWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
