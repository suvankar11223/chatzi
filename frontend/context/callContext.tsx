import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getSocket } from "@/socket/socket";
import webRTCService from "@/services/webrtcService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants";
import {
  CallData,
  CallHistoryItem,
  CallStatus,
  CallType,
  CallContextProps,
} from "@/types";

const CallContext = createContext<CallContextProps | undefined>(undefined);

interface CallProviderProps {
  children: ReactNode;
}

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  // Call state
  const [currentCall, setCurrentCall] = useState<CallData | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");

  // Media state
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // Streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Call history
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);

  // Current user ID
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    const initializeWebRTC = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setCurrentUserId(payload.userId);
        } catch (e) {
          console.error("[DEBUG] CallContext: Failed to decode token:", e);
        }
      }

      // Initialize WebRTC service
      await webRTCService.initialize();

      // Set up callbacks
      webRTCService.setCallbacks({
        onLocalStream: (stream) => {
          setLocalStream(stream);
        },
        onRemoteStream: (stream) => {
          setRemoteStream(stream);
        },
        onCallStatusChanged: (status) => {
          setCallStatus(status as CallStatus);
          if (currentCall) {
            setCurrentCall((prev) => prev ? { ...prev, status: status as CallStatus } : null);
          }
        },
        onCallEnded: (duration) => {
          setCallStatus("ended");
          if (currentCall) {
            setCurrentCall((prev) => prev ? { ...prev, status: "ended", duration } : null);
          }
        },
        onError: (error) => {
          console.error("[DEBUG] CallContext: WebRTC error:", error);
          setCallStatus("idle");
        },
      });
    };

    initializeWebRTC();

    // Setup socket listeners
    const socket = getSocket();
    if (socket) {
      // Incoming call
      socket.on("incomingCall", (data: {
        callId: string;
        callerId: string;
        type: CallType;
        conversationId?: string;
      }) => {
        console.log("[DEBUG] CallContext: Incoming call received:", data);
        setIncomingCall({
          callId: data.callId,
          callerId: data.callerId,
          calleeId: currentUserId || "",
          type: data.type,
          status: "ringing",
        });
        setCallStatus("ringing");
      });

      // Call accepted
      socket.on("callAccepted", (data: {
        callId: string;
        calleeId: string;
      }) => {
        console.log("[DEBUG] CallContext: Call accepted");
        setCallStatus("connected");
      });

      // Call declined
      socket.on("callDeclined", () => {
        console.log("[DEBUG] CallContext: Call declined");
        setCallStatus("declined");
        setCurrentCall(null);
      });

      // Call ended
      socket.on("callEnded", () => {
        console.log("[DEBUG] CallContext: Call ended");
        setCallStatus("ended");
        setCurrentCall(null);
        webRTCService.cleanup();
        setLocalStream(null);
        setRemoteStream(null);
      });
    }

    return () => {
      webRTCService.cleanup();
    };
  }, []);

  // Initiate a call
  const initiateCall = useCallback(async (calleeId: string, type: CallType, conversationId?: string) => {
    const socket = getSocket();
    if (!socket) {
      throw new Error("Socket not connected");
    }

    setCallStatus("calling");
    setCurrentCall({
      callId: "",
      callerId: currentUserId || "",
      calleeId,
      type,
      status: "calling",
    });

    socket.emit("initiateCall", {
      calleeId,
      type,
      conversationId,
    }, (response: any) => {
      if (response.success) {
        setCurrentCall((prev) => prev ? {
          ...prev,
          callId: response.callId,
          status: response.status as CallStatus,
        } : null);

        // Start WebRTC
        webRTCService.initiateCall(response.callId, calleeId, type);
      } else {
        console.error("[DEBUG] CallContext: Failed to initiate call:", response.msg);
        setCallStatus("idle");
        setCurrentCall(null);
      }
    });
  }, [currentUserId]);

  // Accept incoming call
  const acceptCall = useCallback(async (callId: string) => {
    const socket = getSocket();
    if (!socket) {
      throw new Error("Socket not connected");
    }

    // Start local stream first
    const call = incomingCall;
    if (call) {
      try {
        await webRTCService.startLocalStream(call.type);
      } catch (error) {
        console.error("[DEBUG] CallContext: Failed to start local stream:", error);
      }
    }

    socket.emit("acceptCall", { callId }, (response: any) => {
      if (response.success) {
        setCallStatus("connected");
        setCurrentCall((prev) => prev ? {
          ...prev,
          callId: response.callId,
          status: "connected",
        } : incomingCall ? {
          ...incomingCall,
          callId: response.callId,
          status: "connected",
        } : null);
        setIncomingCall(null);
      } else {
        console.error("[DEBUG] CallContext: Failed to accept call:", response.msg);
        setCallStatus("idle");
      }
    });
  }, [incomingCall]);

  // Decline incoming call
  const declineCall = useCallback(async (callId: string) => {
    const socket = getSocket();
    if (!socket) {
      throw new Error("Socket not connected");
    }

    socket.emit("declineCall", { callId }, (response: any) => {
      if (response.success) {
        setCallStatus("declined");
        setIncomingCall(null);
        setTimeout(() => setCallStatus("idle"), 2000);
      }
    });
  }, []);

  // End current call
  const endCall = useCallback(async () => {
    if (currentCall?.callId) {
      await webRTCService.endCall(currentCall.callId);
    }
    setCallStatus("ended");
    setCurrentCall(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCameraOn(true);
    setTimeout(() => setCallStatus("idle"), 2000);
  }, [currentCall]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuteState = webRTCService.toggleMute();
    setIsMuted(newMuteState);
  }, []);

  // Toggle speaker
  const toggleSpeaker = useCallback(() => {
    const newSpeakerState = webRTCService.toggleSpeaker();
    setIsSpeakerOn(newSpeakerState);
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    const newCameraState = webRTCService.toggleCamera();
    setIsCameraOn(newCameraState);
  }, []);

  // Fetch call history
  const fetchCallHistory = useCallback(async (limit = 20, offset = 0) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/calls/history?limit=${limit}&offset=${offset}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setCallHistory(data.data);
      }
    } catch (error) {
      console.error("[DEBUG] CallContext: Failed to fetch call history:", error);
    }
  }, []);

  const value: CallContextProps = {
    currentCall,
    incomingCall,
    callStatus,
    isMuted,
    isSpeakerOn,
    isCameraOn,
    localStream,
    remoteStream,
    callHistory,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    toggleCamera,
    fetchCallHistory,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = (): CallContextProps => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

export default CallContext;
