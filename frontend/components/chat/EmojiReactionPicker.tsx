import React, { useEffect, useRef } from 'react';
import { Text, Pressable, StyleSheet, Modal, Animated } from 'react-native';
import { colors, spacingX, spacingY } from '@/constants/theme';

const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '🙏', '👍'];

interface Props {
  visible: boolean;
  position: { x: number; y: number };
  onReact: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiReactionPicker({ visible, position, onReact, onClose }: Props) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scale, opacity]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[
          styles.picker,
          {
            transform: [{ scale }],
            opacity,
            top: position.y - 60, 
            left: Math.max(20, position.x - 140) 
          }
        ]}>
          {QUICK_EMOJIS.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => {
                onReact(emoji);
                onClose();
              }}
              style={({ pressed }) => [
                styles.emojiBtn,
                pressed && styles.emojiBtnPressed
              ]}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  picker: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 30,
    paddingVertical: spacingY._8,
    paddingHorizontal: spacingX._12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    gap: 4,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiBtnPressed: {
    backgroundColor: colors.neutral100,
    transform: [{ scale: 1.3 }],
  },
  emoji: { fontSize: 26 },
});
