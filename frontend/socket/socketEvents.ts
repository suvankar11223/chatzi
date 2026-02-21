import { getSocket, onEvent, offEvent, emitEvent } from "./socket";

// Event listener types
type MessageCallback = (data: any) => void;
type TypingCallback = (data: { userId: string; userEmail: string; conversationId: string; isTyping: boolean }) => void;
type StatusCallback = (data: { userId: string; status: string; timestamp: Date }) => void;
type ReadReceiptCallback = (data: { messageId: string; readBy: string; timestamp: Date }) => void;

// Listen for new messages
export const onNewMessage = (callback: MessageCallback) => {
  onEvent('newMessage', callback);
};

export const offNewMessage = (callback?: MessageCallback) => {
  offEvent('newMessage', callback);
};

// Listen for typing indicators
export const onUserTyping = (callback: TypingCallback) => {
  onEvent('userTyping', callback);
};

export const offUserTyping = (callback?: TypingCallback) => {
  offEvent('userTyping', callback);
};

// Listen for user status changes
export const onUserStatusChanged = (callback: StatusCallback) => {
  onEvent('userStatusChanged', callback);
};

export const offUserStatusChanged = (callback?: StatusCallback) => {
  offEvent('userStatusChanged', callback);
};

// Listen for message read receipts
export const onMessageReadReceipt = (callback: ReadReceiptCallback) => {
  onEvent('messageReadReceipt', callback);
};

export const offMessageReadReceipt = (callback?: ReadReceiptCallback) => {
  offEvent('messageReadReceipt', callback);
};

// Listen for conversation joined confirmation
export const onConversationJoined = (callback: (data: { conversationId: string }) => void) => {
  onEvent('conversationJoined', callback);
};

export const offConversationJoined = (callback?: (data: { conversationId: string }) => void) => {
  offEvent('conversationJoined', callback);
};

// Listen for conversation left confirmation
export const onConversationLeft = (callback: (data: { conversationId: string }) => void) => {
  onEvent('conversationLeft', callback);
};

export const offConversationLeft = (callback?: (data: { conversationId: string }) => void) => {
  offEvent('conversationLeft', callback);
};

// Test socket event
export const testSocket = (payload: any = { test: 'data' }, callback?: (response: any) => void) => {
  const socket = getSocket();
  
  if (!socket) {
    console.log("[DEBUG] socketEvents: Socket is not connected");
    return;
  }

  if (callback) {
    // Listen for response
    socket.once('testSocket', callback);
  }

  // Emit test event
  emitEvent('testSocket', payload);
};

// Update profile via socket
export const updateProfile = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  
  if (!socket) {
    console.log("Socket is not connected");
    return;
  }

  if (off) {
    // turn off listening to this event
    socket.off("updateProfile", payload); // payload is the callback
  } else if (typeof payload === "function") {
    socket.on("updateProfile", payload); // payload as callback for this event
  } else {
    socket.emit("updateProfile", payload); // sending payload as data
  }
};

// Listen for user profile updates from other users
export const onUserProfileUpdated = (callback: (data: { userId: string; name: string; avatar: string }) => void) => {
  onEvent('userProfileUpdated', callback);
};

export const offUserProfileUpdated = (callback?: (data: { userId: string; name: string; avatar: string }) => void) => {
  offEvent('userProfileUpdated', callback);
};

// Helper to setup all event listeners at once
export const setupSocketListeners = (handlers: {
  onNewMessage?: MessageCallback;
  onUserTyping?: TypingCallback;
  onUserStatusChanged?: StatusCallback;
  onMessageReadReceipt?: ReadReceiptCallback;
  onConversationJoined?: (data: { conversationId: string }) => void;
  onConversationLeft?: (data: { conversationId: string }) => void;
}) => {
  if (handlers.onNewMessage) onNewMessage(handlers.onNewMessage);
  if (handlers.onUserTyping) onUserTyping(handlers.onUserTyping);
  if (handlers.onUserStatusChanged) onUserStatusChanged(handlers.onUserStatusChanged);
  if (handlers.onMessageReadReceipt) onMessageReadReceipt(handlers.onMessageReadReceipt);
  if (handlers.onConversationJoined) onConversationJoined(handlers.onConversationJoined);
  if (handlers.onConversationLeft) onConversationLeft(handlers.onConversationLeft);
};

// Helper to cleanup all event listeners at once
export const cleanupSocketListeners = (handlers: {
  onNewMessage?: MessageCallback;
  onUserTyping?: TypingCallback;
  onUserStatusChanged?: StatusCallback;
  onMessageReadReceipt?: ReadReceiptCallback;
  onConversationJoined?: (data: { conversationId: string }) => void;
  onConversationLeft?: (data: { conversationId: string }) => void;
}) => {
  if (handlers.onNewMessage) offNewMessage(handlers.onNewMessage);
  if (handlers.onUserTyping) offUserTyping(handlers.onUserTyping);
  if (handlers.onUserStatusChanged) offUserStatusChanged(handlers.onUserStatusChanged);
  if (handlers.onMessageReadReceipt) offMessageReadReceipt(handlers.onMessageReadReceipt);
  if (handlers.onConversationJoined) offConversationJoined(handlers.onConversationJoined);
  if (handlers.onConversationLeft) offConversationLeft(handlers.onConversationLeft);
};

// Get contacts
export const getContacts = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  
  if (!socket) {
    console.log("Socket is not connected");
    return;
  }

  if (off) {
    // turn off listening to this event
    socket.off("getContacts", payload); // payload is the callback
  } else if (typeof payload === "function") {
    socket.on("getContacts", payload); // payload as callback for this event
  } else {
    socket.emit("getContacts", payload); // sending payload as data
  }
};

// Get conversations
export const getConversations = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  
  if (!socket) {
    console.log("Socket is not connected");
    return;
  }

  if (off) {
    // turn off listening to this event
    socket.off("getConversations", payload); // payload is the callback
  } else if (typeof payload === "function") {
    socket.on("getConversations", payload); // payload as callback for this event
  } else {
    socket.emit("getConversations", payload); // sending payload as data
  }
};

// Create new conversation
export const createConversation = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  
  if (!socket) {
    console.log("Socket is not connected");
    return;
  }

  if (off) {
    // turn off listening to this event
    socket.off("newConversation", payload); // payload is the callback
  } else if (typeof payload === "function") {
    socket.on("newConversation", payload); // payload as callback for this event
  } else {
    socket.emit("newConversation", payload); // sending payload as data
  }
};

// Listen for new conversations (when someone adds you to a conversation)
export const newConversation = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  
  if (!socket) {
    console.log("Socket is not connected");
    return;
  }

  if (off) {
    // turn off listing to this event
    socket.off("newConversation", payload); // payload is the callback
  } else if (typeof payload === "function") {
    socket.on("newConversation", payload); // payload as callback for this event
  } else {
    socket.emit("newConversation", payload); // sending payload as data
  }
};

// Send new message
export const newMessage = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  
  if (!socket) {
    console.log("Socket is not connected");
    return;
  }

  if (off) {
    // turn off listening to this event
    socket.off("newMessage", payload); // payload is the callback
  } else if (typeof payload === "function") {
    socket.on("newMessage", payload); // payload as callback for this event
  } else {
    socket.emit("newMessage", payload); // sending payload as data
  }
};

// Get messages for a conversation
export const getMessages = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  
  if (!socket) {
    console.log("Socket is not connected");
    return;
  }

  if (off) {
    // turn off listening to this event
    socket.off("getMessages", payload); // payload is the callback
  } else if (typeof payload === "function") {
    socket.on("getMessages", payload); // payload as callback for this event
  } else {
    socket.emit("getMessages", payload); // sending payload as data
  }
};

// Join a conversation room
export const joinConversation = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  
  if (!socket) {
    console.log("Socket is not connected");
    return;
  }

  if (off) {
    // turn off listening to this event
    socket.off("conversationJoined", payload); // payload is the callback
  } else if (typeof payload === "function") {
    socket.on("conversationJoined", payload); // payload as callback for this event
  } else {
    socket.emit("joinConversation", payload); // sending payload as data
  }
};
