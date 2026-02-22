import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/authContext";
import { verticalScale, scale } from "@/utils/styling";
import BackButton from "@/components/BackButton";
import Avatar from "@/components/Avatar";
import { Ionicons, Feather } from "@expo/vector-icons";
import Header from "@/components/Header";
import MessageItem from "@/components/MessageItem";
import Input from "@/components/Input";
import { uploadImageToCloudinary } from "@/services/imageService";
import { getSocket } from "@/socket/socket";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface MessageType {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  content: string;
  attachment?: string | null;
  createdAt: string;
  isMe: boolean;
}

const Conversation = () => {
  const { user: currentUser } = useAuth();
  const { isOnline, onlineUsers } = useOnlineStatus();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);

  const {
    id: conversationId,
    name,
    participants: stringifiedParticipants,
    avatar,
    type,
  } = useLocalSearchParams();

  const participants = JSON.parse(stringifiedParticipants as string);

  // ✅ FIX 1: Safely parse type param — Expo Router can return arrays
  const rawType = Array.isArray(type) ? type[0] : String(type || '');
  let isDirect = rawType === "direct";

  let conversationAvatar = Array.isArray(avatar) ? avatar[0] : avatar;

  const otherParticipant = isDirect
    ? participants.find((p: any) => p._id !== currentUser?.id)
    : null;

  if (isDirect && otherParticipant) {
    conversationAvatar = otherParticipant.avatar;
  }

  let conversationName = isDirect ? otherParticipant?.name : name;
  const otherUserId = isDirect ? otherParticipant?._id : null;

  const online = isDirect && otherUserId ? isOnline(otherUserId) : false;

  useEffect(() => {
    if (isDirect && otherUserId) {
      console.log('[Conversation] Online status for:', otherUserId, '=', online);
    }
  }, [isDirect, otherUserId, online, onlineUsers]);

  // ─── START CALL ───────────────────────────────────────────
  const startCall = (callType: 'voice' | 'video') => {
    console.log('[Call Debug] rawType:', type, 'isDirect:', isDirect, 'otherUserId:', otherUserId);

    if (!isDirect || !otherUserId) {
      Alert.alert('Error', 'Calls are only available in direct conversations');
      return;
    }

    const socket = getSocket();
    if (!socket || !socket.connected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    // Generate unique room name — no API call needed!
    const roomName = `chatzi-${conversationId}-${Date.now()}`;
    console.log('[Call] Initiating', callType, 'call, room:', roomName);

    socket.emit('initiateCall', {
      receiverId: String(otherUserId),
      callType,
      conversationId: String(conversationId),
      callerName: currentUser?.name || 'Unknown',
      callerAvatar: currentUser?.avatar || '',
      roomName,
    });

    socket.once('callInitiated', ({ callId }: any) => {
      console.log('[Call] Navigating to callScreen, room:', roomName);
      
      // Small delay to ensure socket event is processed
      setTimeout(() => {
        router.replace({
          pathname: '/callScreen',
          params: {
            callId: String(callId),
            roomName: String(roomName),
            callType: String(callType),
            name: String(conversationName || 'User'),
            avatar: String(conversationAvatar || ''),
            otherUserId: String(otherUserId || ''),
            isCaller: 'true',
          },
        });
      }, 100);
    });

    socket.once('callResponse', (res: any) => {
      if (!res.success) {
        Alert.alert('Call Failed', res.msg || 'Unable to initiate call');
      }
    });
  };

  // ─── PICK FILE ────────────────────────────────────────────
  const onPickFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedFile(result.assets[0]);
    }
  };

  // ─── SEND MESSAGE ─────────────────────────────────────────
  const onSend = async () => {
    if (!message.trim() && !selectedFile) return;

    const socket = getSocket();
    if (!socket || !socket.connected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    const messageContent = message.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const fileToUpload = selectedFile;

    try {
      setLoading(true);

      const optimisticMessage: MessageType = {
        id: tempId,
        sender: {
          id: currentUser?.id || '',
          name: currentUser?.name || '',
          avatar: currentUser?.avatar || null,
        },
        content: messageContent || '',
        attachment: fileToUpload ? fileToUpload.uri : null,
        createdAt: new Date().toISOString(),
        isMe: true,
      };

      setMessages(prev => [optimisticMessage, ...prev]);
      setMessage("");
      setSelectedFile(null);

      let attachment = null;
      if (fileToUpload) {
        try {
          attachment = await uploadImageToCloudinary(fileToUpload.uri);
        } catch (uploadError: any) {
          if (!messageContent) {
            Alert.alert('Error', 'Image upload failed. Please try again.');
            setLoading(false);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            return;
          }
          Alert.alert('Warning', 'Image upload failed, sending text only');
        }
      }

      socket.emit('newMessage', {
        conversationId,
        sender: {
          id: currentUser?.id,
          name: currentUser?.name,
          avatar: currentUser?.avatar,
        },
        content: messageContent || '',
        attachment,
      });

      setLoading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
      setLoading(false);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  // ─── SOCKET SETUP ─────────────────────────────────────────
  useEffect(() => {
    if (!conversationId || !currentUser?.id) return;

    const socket = getSocket();
    if (!socket?.connected) {
      Alert.alert('Error', 'Not connected to server. Please restart the app.');
      return;
    }

    const onGetMessages = (data: any) => {
      if (data.success && data.data && data.data.length > 0) {
        const msgs = data.data.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          content: m.content,
          attachment: m.attachment,
          createdAt: m.createdAt,
          isMe: m.sender.id === currentUser.id,
        }));
        setMessages(msgs);
      }
    };

    const onNewMessage = (data: any) => {
      if (data.success && data.data && data.data.conversationId === conversationId) {
        const msg = {
          id: data.data.id,
          sender: data.data.sender,
          content: data.data.content,
          attachment: data.data.attachment,
          createdAt: data.data.createdAt,
          isMe: data.data.sender.id === currentUser.id,
        };

        setMessages(prev => {
          const existsByRealId = prev.some(m => m.id === msg.id && !m.id.startsWith('temp_'));
          if (existsByRealId) return prev;

          if (msg.isMe) {
            const optimisticIndex = prev.findIndex(
              m => m.id.startsWith('temp_') &&
                m.content === msg.content &&
                m.sender.id === msg.sender.id
            );
            if (optimisticIndex !== -1) {
              const newList = [...prev];
              newList[optimisticIndex] = msg;
              return newList;
            }
          }

          return [msg, ...prev];
        });
      }
      setLoading(false);
    };

    const onMarkAsRead = (data: any) => {
      if (data.success) {
        console.log('✓ Conversation marked as read');
      }
    };

    socket.on('getMessages', onGetMessages);
    socket.on('newMessage', onNewMessage);
    socket.on('markAsRead', onMarkAsRead);

    socket.emit('joinConversation', conversationId);
    socket.emit('getMessages', { conversationId });
    socket.emit('markAsRead', { conversationId });

    return () => {
      socket.off('getMessages', onGetMessages);
      socket.off('newMessage', onNewMessage);
      socket.off('markAsRead', onMarkAsRead);
    };
  }, [conversationId, currentUser?.id]);

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Header
          left={
            <View style={styles.headerLeft}>
              <BackButton />
              <Avatar
                size={40}
                uri={conversationAvatar as string}
                isGroup={rawType === "group"}
                showOnline={isDirect}
                isOnline={online}
              />
              <Typo color={colors.white} fontWeight={"500"} size={22}>
                {conversationName}
              </Typo>
            </View>
          }
          right={
            <View style={styles.headerRight}>
              {isDirect && (
                <>
                  <TouchableOpacity
                    onPress={() => startCall('voice')}
                    style={styles.callButton}
                  >
                    <Feather name="phone" size={22} color={colors.white} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => startCall('video')}
                    style={styles.callButton}
                  >
                    <Feather name="video" size={22} color={colors.white} />
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          }
        />

        <View style={styles.content}>
          <FlatList
            data={messages}
            inverted={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
            renderItem={({ item }) => (
              <MessageItem item={item} isDirect={isDirect} />
            )}
            keyExtractor={(item) => item.id}
          />

          <View style={styles.footer}>
            <Input
              value={message}
              onChangeText={setMessage}
              containerStyle={{
                paddingLeft: spacingX._10,
                paddingRight: scale(65),
                borderWidth: 0,
              }}
              placeholder="Type message"
              icon={
                <TouchableOpacity style={styles.inputIcon} onPress={onPickFile}>
                  {selectedFile && selectedFile.uri && (
                    <Image
                      source={{ uri: selectedFile.uri }}
                      style={styles.selectedFile}
                    />
                  )}
                  <Ionicons
                    name="add"
                    color={colors.black}
                    size={verticalScale(22)}
                  />
                </TouchableOpacity>
              }
            />

            <View style={styles.inputRightIcon}>
              <TouchableOpacity style={styles.inputIcon} onPress={onSend}>
                {loading ? (
                  <ActivityIndicator size="small" color={colors.black} />
                ) : (
                  <Ionicons
                    name="paper-plane"
                    color={colors.black}
                    size={verticalScale(22)}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
  },
  callButton: {
    padding: 4,
  },
  inputRightIcon: {
    position: "absolute",
    right: scale(10),
    top: verticalScale(15),
    paddingLeft: spacingX._12,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.neutral300,
  },
  selectedFile: {
    position: "absolute",
    height: verticalScale(38),
    width: verticalScale(38),
    borderRadius: radius.full,
    alignSelf: "center",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._15,
  },
  inputIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
    paddingTop: spacingY._7,
    paddingBottom: verticalScale(22),
  },
  messagesContent: {
    paddingTop: spacingY._20,
    paddingBottom: spacingY._10,
    gap: spacingY._12,
  },
});