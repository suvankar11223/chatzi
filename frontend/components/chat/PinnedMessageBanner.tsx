import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';

interface PinnedMessage {
  _id: string;
  content: string;
  type: 'text' | 'voice' | 'image';
  sender: { name: string };
}

interface Props {
  pinnedMessages: PinnedMessage[];
  onJumpToMessage: (messageId: string) => void;
  onUnpin: (messageId: string) => void;
  isAdmin: boolean;
}

export function PinnedMessageBanner({
  pinnedMessages,
  onJumpToMessage,
  onUnpin,
  isAdmin,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!pinnedMessages.length) return null;

  const current = pinnedMessages[currentIndex];

  const cycleNext = () => {
    setCurrentIndex((i) => (i + 1) % pinnedMessages.length);
  };

  const getPreview = (msg: PinnedMessage) => {
    if (msg.type === 'voice') return '🎙 Voice message';
    if (msg.type === 'image') return '📷 Photo';
    return msg.content?.slice(0, 50) || '';
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        onJumpToMessage(current._id);
        cycleNext();
      }}
    >
      <View style={styles.accent} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Ionicons name="pin" size={14} color={colors.primary} />
          <Text style={styles.label}>
            Pinned Message {pinnedMessages.length > 1 ? `${currentIndex + 1}/${pinnedMessages.length}` : ''}
          </Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {getPreview(current)}
        </Text>
      </View>

      <View style={styles.actions}>
        {pinnedMessages.length > 1 && (
          <Pressable onPress={cycleNext} style={styles.actionBtn}>
            <Ionicons name="chevron-up" size={18} color={colors.primary} />
          </Pressable>
        )}
        {isAdmin && (
          <Pressable
            onPress={() => onUnpin(current._id)}
            style={styles.actionBtn}
          >
            <Ionicons name="close" size={18} color={colors.neutral500} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
    paddingVertical: spacingY._8,
    paddingHorizontal: spacingX._12,
  },
  accent: {
    width: 3,
    height: 36,
    backgroundColor: colors.primary,
    borderRadius: radius._2,
    marginRight: spacingX._10,
  },
  content: { flex: 1 },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 2 
  },
  label: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4
  },
  preview: { 
    fontSize: 13, 
    color: colors.neutral900
  },
  actions: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  actionBtn: { padding: 6 },
});
