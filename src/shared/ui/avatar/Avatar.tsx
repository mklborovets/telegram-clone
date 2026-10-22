import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { theme } from '../../config/theme';

export interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  isOnline?: boolean;
  style?: StyleProp<ViewStyle>;
}

const getInitials = (name: string): string => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

const getAvatarColor = (name: string): string => {
  if (!name) return theme.colors.avatarColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % theme.colors.avatarColors.length;
  return theme.colors.avatarColors[index];
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  size = 48,
  isOnline = false,
  style,
}) => {
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);
  const fontSize = Math.round(size * 0.4);
  const badgeSize = Math.max(10, Math.round(size * 0.26));

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
      )}
      {isOnline ? (
        <View
          style={[
            styles.onlineBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              borderWidth: Math.max(1.5, size * 0.04),
            },
          ]}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.white,
  },
});
