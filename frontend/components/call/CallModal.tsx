import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useCall } from "@/context/callContext";
import IncomingCallModal from "./IncomingCallModal";
import OutgoingCallModal from "./OutgoingCallModal";
import ActiveCallScreen from "./ActiveCallScreen";
import { colors } from "@/constants/theme";

const CallModal: React.FC = () => {
  const {
    currentCall,
    incomingCall,
    callStatus,
    acceptCall,
    declineCall,
    endCall,
    fetchCallHistory,
  } = useCall();

  // Fetch call history when component mounts
  useEffect(() => {
    fetchCallHistory();
  }, []);

  // Handle ringing timeout
  useEffect(() => {
    if (callStatus === "ringing" && !incomingCall) {
      // This is an outgoing call that's ringing
    }
  }, [callStatus, incomingCall]);

  // Only render the overlay when there's an active call or incoming call
  const shouldShowOverlay = !!incomingCall || !!currentCall || callStatus !== "idle";

  if (!shouldShowOverlay) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Incoming call modal */}
      <IncomingCallModal
        visible={!!incomingCall && callStatus === "ringing"}
        callerName={incomingCall?.callerId || "Unknown"}
        callerAvatar={incomingCall?.callerId ? undefined : undefined}
        callType={incomingCall?.type || "video"}
        onAccept={() => {
          if (incomingCall?.callId) {
            acceptCall(incomingCall.callId);
          }
        }}
        onDecline={() => {
          if (incomingCall?.callId) {
            declineCall(incomingCall.callId);
          }
        }}
      />

      {/* Outgoing call modal (calling/ringing states) */}
      <OutgoingCallModal
        visible={callStatus === "calling" || callStatus === "ringing"}
        calleeName={currentCall?.calleeId || "Unknown"}
        calleeAvatar={currentCall?.calleeId ? undefined : undefined}
        callType={currentCall?.type || "video"}
        onCancel={() => {
          endCall();
        }}
      />

      {/* Active call screen (connected state) */}
      <ActiveCallScreen
        visible={callStatus === "connected"}
        callType={currentCall?.type || "video"}
        remoteUserName={currentCall?.calleeId || "Unknown"}
        remoteUserAvatar={currentCall?.calleeId ? undefined : undefined}
        onEndCall={() => {
          endCall();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});

export default CallModal;
