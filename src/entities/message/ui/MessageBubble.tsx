import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCheck, Check } from 'lucide-react-native';
import { IMessage } from '../model/types';
import { theme } from '../../../shared/config/theme';
import { formatMessageTime } from '../../../shared/lib/formatTime';

export interface MessageBubbleProps {
  message: IMessage;
  style?: StyleProp<ViewStyle>;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  style,
}) => {
  const isMe = message.isMe;

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      style={[
        styles.wrapper,
        isMe ? styles.wrapperOut : styles.wrapperIn,
        style,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleOut : styles.bubbleIn,
        ]}
      >
        <Text
          style={[
            styles.text,
            isMe ? styles.textOut : styles.textIn,
          ]}
        >
          {message.text}
        </Text>

        <View style={styles.meta}>
          <Text
            style={[
              styles.time,
              isMe ? styles.timeOut : styles.timeIn,
            ]}
          >
            {formatMessageTime(message.createdAt)}
          </Text>

          {isMe ? (
            message.isRead ? (
              <CheckCheck
                size={14}
                color={theme.colors.primary}
                style={styles.checkIcon}
              />
            ) : (
              <Check
                size={14}
                color={theme.colors.textMuted}
                style={styles.checkIcon}
              />
            )
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 3,
    paddingHorizontal: theme.spacing.md,
    width: '100%',
  },
  wrapperOut: {
    alignItems: 'flex-end',
  },
  wrapperIn: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleOut: {
    backgroundColor: theme.colors.bubbleOut,
    borderBottomRightRadius: 4,
  },
  bubbleIn: {
    backgroundColor: theme.colors.bubbleIn,
    borderBottomLeftRadius: 4,
  },
  text: {
    ...theme.typography.body,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 2,
  },
  textOut: {
    color: theme.colors.bubbleOutText,
  },
  textIn: {
    color: theme.colors.bubbleInText,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginLeft: 12,
  },
  time: {
    ...theme.typography.time,
    fontSize: 11,
  },
  timeOut: {
    color: '#538C44',
  },
  timeIn: {
    color: theme.colors.textMuted,
  },
  checkIcon: {
    marginLeft: 3,
  },
});
