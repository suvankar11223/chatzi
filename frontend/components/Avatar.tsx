import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { getAvatarPath } from '@/services/imageService';

type AvatarProps = {
  uri?: string | null;
  size?: number;
  isGroup?: boolean;
  name?: string;
};

// Generate DiceBear avatar URL based on name
const getDiceBearAvatar = (name?: string, size: number = 40): string => {
  const seed = name || 'default';
  // Using 'adventurer' style for cartoon avatars
  return `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(seed)}&size=${size}`;
};

const Avatar = ({ uri, size = 40, isGroup = false, name }: AvatarProps) => {
  const borderRadius = size / 2;

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

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#f0f0f0',
  },
});

export default Avatar;
