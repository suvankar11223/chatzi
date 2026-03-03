import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Animated, ScrollView } from 'react-native';
import { colors, spacingX, spacingY, radius } from '../../constants/theme';
import Typo from '../Typo';

interface PermissionGateProps {
  visible: boolean;
  onGrant: () => void;
  onDeny: () => void;
}

const FEATURES = [
  { emoji: '🔍', text: 'Scans your messages to understand context' },
  { emoji: '🔗', text: 'Links related conversations across chats' },
  { emoji: '💡', text: 'Suggests bundled actions to save you time' },
  { emoji: '📵', text: 'All processing happens ON YOUR DEVICE only' },
  { emoji: '🔒', text: 'No data ever leaves your phone. Ever.' },
];

export const PermissionGate: React.FC<PermissionGateProps> = ({
  visible,
  onGrant,
  onDeny,
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Typo size={34}>🧠</Typo>
          </View>

          <Typo size={22} fontWeight="800" color={colors.neutral900} style={styles.title}>
            Smart Suggestions
          </Typo>

          <Typo size={14} color={colors.neutral600} style={styles.subtitle}>
            Allow the app to read your chats and proactively suggest bundled actions — like replying, adding to calendar, or sharing your location — all in one tap.
          </Typo>

          {/* Feature list */}
          <ScrollView style={styles.featureList} showsVerticalScrollIndicator={false}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Typo size={18}>{f.emoji}</Typo>
                <Typo size={13} color={colors.neutral700} style={styles.featureText}>
                  {f.text}
                </Typo>
              </View>
            ))}
          </ScrollView>

          {/* Privacy note */}
          <View style={styles.privacyNote}>
            <Typo size={12} color={colors.green} style={{ textAlign: 'center' }}>
              🛡️ On-device processing only. Your conversations never leave your phone.
            </Typo>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.grantButton} onPress={onGrant}>
            <Typo size={16} fontWeight="700" color={colors.white}>
              Enable Smart Suggestions
            </Typo>
          </TouchableOpacity>

          <TouchableOpacity style={styles.denyButton} onPress={onDeny}>
            <Typo size={14} fontWeight="500" color={colors.neutral500}>
              Not now
            </Typo>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    padding: spacingX._20,
    paddingBottom: spacingY._40,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral300,
    borderRadius: 2,
    marginBottom: spacingY._20,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: radius._20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacingY._15,
  },
  title: {
    marginBottom: spacingY._10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacingY._20,
    paddingHorizontal: spacingX._8,
  },
  featureList: {
    width: '100%',
    maxHeight: 200,
    marginBottom: spacingY._15,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.neutral50,
    borderRadius: radius._12,
    padding: spacingX._12,
    marginBottom: 6,
    gap: spacingX._12,
  },
  featureText: {
    flex: 1,
    lineHeight: 20,
  },
  privacyNote: {
    backgroundColor: colors.green + '15',
    borderRadius: radius._12,
    padding: spacingX._12,
    width: '100%',
    marginBottom: spacingY._20,
    borderWidth: 1,
    borderColor: colors.green + '30',
  },
  grantButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius._15,
    padding: spacingY._15,
    alignItems: 'center',
    marginBottom: spacingY._10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  denyButton: {
    padding: spacingY._12,
    alignItems: 'center',
  },
});
