import React, { createContext, useContext, useState, ReactNode } from "react";
import { getApiUrl } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ─── Types ───────────────────────────────────────────────
export type CallType = "voice" | "video";
export type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended" | "declined" | "missed";

export interface CallData {
  callId: string;
  callerId: string;
  calleeId: string;
  type: CallType;
  status: CallStatus;
  channelName?: string;
  duration?: number;
}

interface CallContextProps {
  currentCall: CallData | null;
  incomingCall: CallData | null;
  callStatus: CallStatus;
  setCurrentCall: (call: CallData | null) => void;
  setIncomingCall: (call: CallData | null) => void;
  setCallStatus: (status: CallStatus) => void;
  saveCallRecord: (data: {
    receiverId: string;
    conversationId?: string;
    type: CallType;
    status: string;
    duration: number;
    channelName: string;
  }) => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────
const CallContext = createContext<CallContextProps | undefined>(undefined);

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentCall, setCurrentCall] = useState<CallData | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");

  const saveCallRecord = async (data: {
    receiverId: string;
    conversationId?: string;
    type: CallType;
    status: string;
    duration: number;
    channelName: string;
  }) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const API_URL = await getApiUrl();

      await axios.post(
        `${API_URL}/calls/save`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      console.log("[CallContext] Call record saved");
    } catch (error) {
      console.error("[CallContext] Failed to save call record:", error);
    }
  };

  return (
    <CallContext.Provider
      value={{
        currentCall,
        incomingCall,
        callStatus,
        setCurrentCall,
        setIncomingCall,
        setCallStatus,
        saveCallRecord,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = (): CallContextProps => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

export default CallContext;