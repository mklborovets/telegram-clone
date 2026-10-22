import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
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
import { SendHorizontal } from 'lucide-react-native';
import { useMessageStore } from '../../../entities/message';
import { theme } from '../../../shared/config/theme';

export interface SendMessageBarProps {
  chatId: string;
  onSend?: (text: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const SendMessageBar: React.FC<SendMessageBarProps> = ({
  chatId,
  onSend,
  style,
}) => {
  const [text, setText] = useState('');
  const addMessage = useMessageStore((state) => state.addMessage);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const hasText = text.trim().length > 0;

  useEffect(() => {
    if (hasText) {
      scale.value = withSpring(1, { damping: 15, stiffness: 250 });
      opacity.value = withTiming(1, { duration: 150 });
    } else {
      scale.value = withSpring(0, { damping: 15, stiffness: 250 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [hasText, scale, opacity]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    addMessage(chatId, trimmed, true);
    if (onSend) {
      onSend(trimmed);
    }
    setText('');
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          style={styles.input}
        />
      </View>

      <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
        <Pressable
          onPress={handleSend}
          disabled={!hasText}
          style={({ pressed }) => [
            styles.sendButton,
            pressed && styles.sendButtonPressed,
          ]}
        >
          <SendHorizontal size={20} color={theme.colors.white} />
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  inputContainer: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 8,
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text,
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
