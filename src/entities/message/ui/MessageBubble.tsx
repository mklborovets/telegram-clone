import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCheck, Check, FileText } from 'lucide-react-native';
import { IMessage } from '../model/types';
import { theme } from '../../../shared/config/theme';
import { formatMessageTime } from '../../../shared/lib/formatTime';

export interface MessageBubbleProps {
  message: IMessage;
  onLongPress?: (message: IMessage) => void;
  style?: StyleProp<ViewStyle>;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onLongPress,
  style,
}) => {
  const isMe = message.isMe;

  const isPhoto = message.mediaType === 'photo' && Boolean(message.mediaUri);
  const isPhotoOnly = isPhoto && !message.text;

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      style={[
        styles.wrapper,
        isMe ? styles.wrapperOut : styles.wrapperIn,
        style,
      ]}
    >
      <Pressable
        onLongPress={() => {
          if (onLongPress) {
            onLongPress(message);
          }
        }}
        delayLongPress={300}
        style={({ pressed }) => [
          styles.bubble,
          isMe ? styles.bubbleOut : styles.bubbleIn,
          isPhotoOnly && styles.bubblePhotoOnly,
          pressed && styles.bubblePressed,
        ]}
      >
        {isPhotoOnly ? (
          <View style={styles.photoContainerOnly}>
            <Image
              source={{ uri: message.mediaUri }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.photoMetaOverlay}>
              {message.isEdited ? (
                <Text style={styles.photoMetaText}>edited</Text>
              ) : null}
              <Text style={styles.photoMetaText}>
                {formatMessageTime(message.createdAt)}
              </Text>
              {isMe ? (
                message.isRead ? (
                  <CheckCheck
                    size={14}
                    color="#FFFFFF"
                    style={styles.checkIcon}
                  />
                ) : (
                  <Check
                    size={14}
                    color="rgba(255,255,255,0.7)"
                    style={styles.checkIcon}
                  />
                )
              ) : null}
            </View>
          </View>
        ) : (
          <>
            {isPhoto ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: message.mediaUri }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            ) : null}

            {message.mediaType === 'file' ? (
              <View style={styles.fileContainer}>
                <View style={styles.fileIconWrapper}>
                  <FileText size={20} color={theme.colors.white} />
                </View>
                <View style={styles.fileDetails}>
                  <Text
                    style={[
                      styles.fileName,
                      isMe ? styles.textOut : styles.textIn,
                    ]}
                    numberOfLines={1}
                  >
                    {message.fileName || 'Attachment'}
                  </Text>
                  {message.fileSize ? (
                    <Text
                      style={[
                        styles.fileSize,
                        isMe ? styles.timeOut : styles.timeIn,
                      ]}
                    >
                      {message.fileSize}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {message.text ? (
              <Text
                style={[
                  styles.text,
                  isMe ? styles.textOut : styles.textIn,
                ]}
              >
                {message.text}
              </Text>
            ) : null}

            <View style={styles.meta}>
              {message.isEdited ? (
                <Text
                  style={[
                    styles.editedText,
                    isMe ? styles.timeOut : styles.timeIn,
                  ]}
                >
                  edited
                </Text>
              ) : null}

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
          </>
        )}
      </Pressable>
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
  bubblePressed: {
    opacity: 0.9,
  },
  bubbleOut: {
    backgroundColor: theme.colors.bubbleOut,
    borderBottomRightRadius: 4,
  },
  bubbleIn: {
    backgroundColor: theme.colors.bubbleIn,
    borderBottomLeftRadius: 4,
  },
  bubblePhotoOnly: {
    paddingHorizontal: 3,
    paddingTop: 3,
    paddingBottom: 3,
    borderRadius: 18,
    overflow: 'hidden',
  },
  photoContainerOnly: {
    width: 250,
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  photoMetaOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  photoMetaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    marginRight: 4,
  },
  imageContainer: {
    width: 240,
    height: 180,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: 6,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 2,
    minWidth: 180,
  },
  fileIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    ...theme.typography.title,
    fontSize: 14,
    fontWeight: '600',
  },
  fileSize: {
    ...theme.typography.caption,
    fontSize: 12,
    marginTop: 2,
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
  editedText: {
    ...theme.typography.caption,
    fontSize: 11,
    marginRight: 4,
    fontStyle: 'italic',
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
