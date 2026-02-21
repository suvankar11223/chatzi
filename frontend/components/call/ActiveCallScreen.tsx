import React, { useState, useEffect } from "react";
import { View, StyleSheet, Modal, TouchableOpacity, Image, Text } from "react-native";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import Typo from "@/components/Typo";
import Avatar from "@/components/Avatar";
import { useCall } from "@/context/callContext";

interface ActiveCallScreenProps {
  visible: boolean;
  callType: "audio" | "video";
  remoteUserName?: string;
  remoteUserAvatar?: string;
  onEndCall: () => void;
}

const ActiveCallScreen: React.FC<ActiveCallScreenProps> = ({
  visible,
  callType,
  remoteUserName = "Unknown",
  remoteUserAvatar,
  onEndCall,
}) => {
  const {
    isMuted,
    isSpeakerOn,
    isCameraOn,
    toggleMute,
    toggleSpeaker,
    toggleCamera,
    callStatus,
  } = useCall();

  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (callStatus === "connected") {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Remote video or avatar */}
        <View style={styles.remoteVideoContainer}>
          {callType === "video" && isCameraOn ? (
            <View style={styles.remoteVideoPlaceholder}>
              <Typo size={16} color={colors.neutral400}>
                Remote video preview
              </Typo>
            </View>
          ) : (
            <View style={styles.avatarContainer}>
              <Avatar
                size={150}
                uri={remoteUserAvatar || null}
              />
            </View>
          )}
        </View>

        {/* Call info */}
        <View style={styles.infoContainer}>
          <Typo size={20} fontWeight="600" color={colors.white}>
            {remoteUserName}
          </Typo>
          <Typo size={14} color={colors.neutral300}>
            {callStatus === "connected" ? formatDuration(callDuration) : "Connecting..."}
          </Typo>
        </View>

        {/* Local video preview (for video calls) */}
        {callType === "video" && (
          <View style={styles.localVideoContainer}>
            {isCameraOn ? (
              <View style={styles.localVideoPlaceholder}>
                <Typo size={12} color={colors.neutral400}>
                  You
                </Typo>
              </View>
            ) : (
              <View style={styles.cameraOffIndicator}>
                <Typo size={20}>📷</Typo>
              </View>
            )}
          </View>
        )}

        {/* Call controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlsRow}>
            {/* Mute button */}
            <TouchableOpacity
              style={[styles.controlButton, isMuted && styles.controlButtonActive]}
              onPress={toggleMute}
            >
              <Typo size={24}>{isMuted ? "🔇" : "🎤"}</Typo>
              <Typo size={12} color={colors.white} style={styles.controlLabel}>
                {isMuted ? "Unmute" : "Mute"}
              </Typo>
            </TouchableOpacity>

            {/* Speaker button */}
            <TouchableOpacity
              style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
              onPress={toggleSpeaker}
            >
              <Typo size={24}>{isSpeakerOn ? "🔊" : "🔈"}</Typo>
              <Typo size={12} color={colors.white} style={styles.controlLabel}>
                {isSpeakerOn ? "Speaker" : "Earpiece"}
              </Typo>
            </TouchableOpacity>

            {/* Camera toggle (video only) */}
            {callType === "video" && (
              <TouchableOpacity
                style={[styles.controlButton, !isCameraOn && styles.controlButtonActive]}
                onPress={toggleCamera}
              >
                <Typo size={24}>{isCameraOn ? "📹" : "📷"}</Typo>
                <Typo size={12} color={colors.white} style={styles.controlLabel}>
                  {isCameraOn ? "Stop Video" : "Start Video"}
                </Typo>
              </TouchableOpacity>
            )}
          </View>

          {/* End call button */}
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={onEndCall}
          >
            <Typo size={28} color={colors.white}>📞</Typo>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  remoteVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  remoteVideoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.neutral800,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  localVideoContainer: {
    position: "absolute",
    top: 120,
    right: 20,
    width: 100,
    height: 140,
    borderRadius: radius._12,
    overflow: "hidden",
    backgroundColor: colors.neutral700,
  },
  localVideoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraOffIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral700,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: spacingX._20,
    alignItems: "center",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacingX._20,
    marginBottom: spacingY._30,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: radius.full,
    backgroundColor: colors.neutral700,
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonActive: {
    backgroundColor: colors.neutral500,
  },
  controlLabel: {
    marginTop: spacingY._5,
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: radius.full,
    backgroundColor: colors.rose,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ActiveCallScreen;
