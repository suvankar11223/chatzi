import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getAvatarPath } from '@/services/imageService';
import { colors } from '@/constants/theme';

type AvatarProps = {
  uri?: string | null;
  size?: number;
  isGroup?: boolean;
  name?: string;
  showOnline?: boolean;
  isOnline?: boolean;
};

// Generate DiceBear avatar URL based on name
const getDiceBearAvatar = (name?: string, size: number = 40): string => {
  const seed = name || 'default';
  // Using 'adventurer' style for cartoon avatars
  return `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(seed)}&size=${size}`;
};

const Avatar = ({ uri, size = 40, isGroup = false, name, showOnline = false, isOnline = false }: AvatarProps) => {
  const borderRadius = size / 2;

  const renderAvatar = () => {
    // If there's a URI, show the image
    if (uri) {
      return (
        <Image
          source={{ uri }}
          style={[styles.avatar, { width: size, height: size, borderRadius }]}
        />
      );
    }

    // If it's a group without URI, show default group avatar
    if (isGroup) {
      return (
        <Image
          source={getAvatarPath(null, true)}
          style={[styles.avatar, { width: size, height: size, borderRadius }]}
        />
      );
    }

    // For users without avatar, show DiceBear generated avatar
    return (
      <Image
        source={{ uri: getDiceBearAvatar(name, size) }}
        style={[styles.avatar, { width: size, height: size, borderRadius }]}
      />
    );
  };

  return (
    <View style={{ width: size, height: size }}>
      {renderAvatar()}
      {showOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size * 0.26,
              height: size * 0.26,
              borderRadius: size * 0.13,
              borderWidth: size * 0.05,
              backgroundColor: isOnline ? '#22C55E' : colors.neutral400,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#f0f0f0',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: colors.white,
  },
});

export default Avatar;
