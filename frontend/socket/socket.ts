import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let connectionPromise: Promise<Socket> | null = null;

// Get socket URL from saved server IP or fallback
const getSocketURL = async (): Promise<string> => {
  try {
    const savedIP = await AsyncStorage.getItem('serverIP');
    if (savedIP) {
      console.log("[DEBUG] Socket: Using saved server IP:", savedIP);
      return `http://${savedIP}:3000`;
    }
  } catch (error) {
    console.warn("[DEBUG] Socket: Failed to load saved server IP");
  }
  
  // Fallback to local network IP
  return "http://172.25.251.53:3000";
};

export const connectSocket = async (): Promise<Socket> => {
  // If already connecting, return the existing promise
  if (connectionPromise) {
    return connectionPromise;
  }

  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No token found. User must login first");
  }

  // If already connected, return existing socket
  if (socket && socket.connected) {
    console.log("[DEBUG] Socket: Already connected, reusing existing connection");
    return socket;
  }

  // Disconnect old socket if exists but not connected
  if (socket) {
    console.log("[DEBUG] Socket: Cleaning up old socket");
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  const SOCKET_URL = await getSocketURL();
  console.log("[DEBUG] Socket: Creating new connection to", SOCKET_URL);

  // Create the socket connection with polling only (more reliable for mobile)
  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ["polling"], // Use polling only - more reliable for React Native
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 30000,
    forceNew: true,
  });

  // Connection events
  socket.on("connect", () => {
    console.log("[DEBUG] Socket: ✓ Connected successfully, ID:", socket?.id);
    connectionPromise = null;
  });

  socket.on("connect_error", (error: any) => {
    console.log("[DEBUG] Socket: Connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[DEBUG] Socket: Disconnected:", reason);
    // Don't auto-reconnect if it's a clean disconnect
    if (reason === "io client disconnect") {
      socket?.connect();
    }
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("[DEBUG] Socket: ✓ Reconnected after", attemptNumber, "attempts");
    // Request to rejoin conversations
    socket?.emit("rejoinConversations");
  });

  socket.on("reconnect_failed", () => {
    console.error("[DEBUG] Socket: Reconnection failed");
    connectionPromise = null;
  });

  // Create a promise that resolves when connected
  connectionPromise = new Promise((resolve) => {
    // If already connected, resolve immediately
    if (socket?.connected) {
      resolve(socket);
      return;
    }

    // Wait for connection
    const onConnect = () => {
      console.log("[DEBUG] Socket: Connection established");
      socket?.off("connect", onConnect);
      socket?.off("connect_error", onError);
      resolve(socket!);
    };

    const onError = (error: any) => {
      console.log("[DEBUG] Socket: Connection error, will retry:", error.message);
      // Don't reject - let it keep retrying
    };

    socket?.on("connect", onConnect);
    socket?.on("connect_error", onError);

    // Timeout after 10 seconds
    setTimeout(() => {
      if (socket?.connected) {
        resolve(socket);
      } else {
        console.log("[DEBUG] Socket: Connection timeout, but will keep retrying");
        resolve(socket!); // Resolve anyway - will work in background
      }
    }, 10000);
  });

  return connectionPromise;
};

export const disconnectSocket = () => {
  connectionPromise = null;
  if (socket) {
    console.log("[DEBUG] Socket: Disconnecting...");
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

export const emitEvent = (event: string, data?: any) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn("[DEBUG] Socket: Cannot emit, socket not connected");
  }
};

export const onEvent = (event: string, callback: (data: any) => void) => {
  if (socket) {
    socket.on(event, callback);
  }
};

export const offEvent = (event: string, callback?: (data: any) => void) => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
};

// Specific event emitters
export const sendMessage = (conversationId: string, message: any) => {
  emitEvent("sendMessage", { conversationId, message });
};

export const joinConversation = (conversationId: string) => {
  emitEvent("joinConversation", conversationId);
};

export const leaveConversation = (conversationId: string) => {
  emitEvent("leaveConversation", conversationId);
};

export const sendTypingIndicator = (conversationId: string, isTyping: boolean) => {
  emitEvent("typing", { conversationId, isTyping });
};

export const markMessageAsRead = (conversationId: string, messageId: string) => {
  emitEvent("messageRead", { conversationId, messageId });
};

export const setUserOnline = () => {
  emitEvent("userOnline", {});
};

export const setUserOffline = () => {
  emitEvent("userOffline", {});
};
