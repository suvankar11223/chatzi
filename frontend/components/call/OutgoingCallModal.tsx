import React from "react";
import { View, StyleSheet, Modal, TouchableOpacity, Animated } from "react-native";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import Typo from "@/components/Typo";
import Avatar from "@/components/Avatar";

interface OutgoingCallModalProps {
  visible: boolean;
  calleeName?: string;
  calleeAvatar?: string;
  callType: "audio" | "video";
  onCancel: () => void;
}

const OutgoingCallModal: React.FC<OutgoingCallModalProps> = ({
  visible,
  calleeName = "Unknown",
  calleeAvatar,
  callType,
  onCancel,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Avatar
              size={120}
              uri={calleeAvatar || null}
            />
            {callType === "video" && (
              <View style={styles.videoIndicator}>
                <Typo size={24} color={colors.white}>📹</Typo>
              </View>
            )}
          </Animated.View>

          <Typo size={24} fontWeight="600" color={colors.white} style={styles.name}>
            {calleeName}
          </Typo>

          <Typo size={14} color={colors.primary} style={styles.status}>
            {callType === "video" ? "Video calling..." : "Audio calling..."}
          </Typo>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <View style={styles.cancelIconContainer}>
              <Typo size={24} color={colors.white}>📞</Typo>
            </View>
            <Typo size={14} color={colors.white} style={styles.cancelText}>
              Cancel
            </Typo>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    paddingHorizontal: spacingX._20,
  },
  avatarContainer: {
    position: "relative",
  },
  videoIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: spacingX._7,
  },
  name: {
    marginTop: spacingY._25,
    textAlign: "center",
  },
  status: {
    marginTop: spacingY._10,
    textAlign: "center",
  },
  cancelButton: {
    marginTop: spacingY._50,
    alignItems: "center",
  },
  cancelIconContainer: {
    width: 70,
    height: 70,
    borderRadius: radius.full,
    backgroundColor: colors.rose,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    marginTop: spacingY._10,
  },
});

export default OutgoingCallModal;
