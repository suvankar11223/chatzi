import React from "react";
import { View, StyleSheet, Modal, TouchableOpacity, Animated } from "react-native";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import Typo from "@/components/Typo";
import Button from "@/components/Button";
import Avatar from "@/components/Avatar";
import { useCall } from "@/context/callContext";

interface IncomingCallModalProps {
  visible: boolean;
  callerName?: string;
  callerAvatar?: string;
  callType: "audio" | "video";
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  visible,
  callerName = "Unknown",
  callerAvatar,
  callType,
  onAccept,
  onDecline,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (visible) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
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
              uri={callerAvatar || null}
            />
            {callType === "video" && (
              <View style={styles.videoIndicator}>
                <Typo size={24} color={colors.white}>📹</Typo>
              </View>
            )}
          </Animated.View>

          <Typo size={24} fontWeight="600" color={colors.white} style={styles.name}>
            {callerName}
          </Typo>

          <Typo size={14} color={colors.neutral300} style={styles.status}>
            {callType === "video" ? "Incoming video call..." : "Incoming audio call..."}
          </Typo>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={onDecline}
            >
              <Typo size={28} color={colors.white}>✕</Typo>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={onAccept}
            >
              <Typo size={28} color={colors.white}>✓</Typo>
            </TouchableOpacity>
          </View>

          <View style={styles.hintContainer}>
            <Typo size={12} color={colors.neutral400}>
              Swipe up to answer • Slide to decline
            </Typo>
          </View>
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
    borderWidth: 4,
    borderColor: colors.primary,
    borderRadius: 60,
  },
  videoIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: colors.green,
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
  buttonContainer: {
    flexDirection: "row",
    marginTop: spacingY._40,
    gap: spacingX._40,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: colors.rose,
  },
  acceptButton: {
    backgroundColor: colors.green,
  },
  hintContainer: {
    marginTop: spacingY._30,
  },
});

export default IncomingCallModal;
