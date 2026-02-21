import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import Typo from "@/components/Typo";

interface CallButtonProps {
  onAudioCall: () => void;
  onVideoCall: () => void;
}

const CallButtons: React.FC<CallButtonProps> = ({ onAudioCall, onVideoCall }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onAudioCall}
      >
        <Typo size={22}>🎤</Typo>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.videoButton]}
        onPress={onVideoCall}
      >
        <Typo size={22}>📹</Typo>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacingX._15,
  },
  button: {
    width: 45,
    height: 45,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  videoButton: {
    backgroundColor: colors.primary,
  },
});

export default CallButtons;
