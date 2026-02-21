import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";
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
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import MessageItem from "@/components/MessageItem";
import Input from "@/components/Input";
import { uploadImageToCloudinary } from "@/services/imageService";
import { getSocket } from "@/socket/socket";

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
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);

  const onPickFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedFile(result.assets[0]);
    }
  };

  const onSend = async () => {
    // Send message logic - allow sending if there's either text OR an image
    if (!message.trim() && !selectedFile) return;

    console.log('='.repeat(60));
    console.log('=== SENDING MESSAGE ===');
    console.log('User:', currentUser?.name, '(', currentUser?.id, ')');
    console.log('Conversation ID:', conversationId);
    console.log('Message:', message.trim());
    console.log('Has attachment:', !!selectedFile);
    console.log('='.repeat(60));

    const socket = getSocket();
    if (!socket || !socket.connected) {
      console.error('[ERROR] Socket not connected!');
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    const messageContent = message.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    
    // Store selected file reference before clearing
    const fileToUpload = selectedFile;

    try {
      setLoading(true);

      // OPTIMISTIC UPDATE: Add message immediately for instant feedback
      // Show with local image URI first, will be replaced with Cloudinary URL
      const optimisticMessage: MessageType = {
        id: tempId,
        sender: {
          id: currentUser?.id || '',
          name: currentUser?.name || '',
          avatar: currentUser?.avatar || null,
        },
        content: messageContent || '', // Allow empty content if there's an image
        attachment: fileToUpload ? fileToUpload.uri : null, // Show local image immediately
        createdAt: new Date().toISOString(),
        isMe: true,
      };

      console.log('✓ Adding optimistic message for instant UI update');
      setMessages(prev => [optimisticMessage, ...prev]);

      // Clear input immediately for better UX
      setMessage("");
      setSelectedFile(null);

      // Upload image in background if present
      let attachment = null;
      if (fileToUpload) {
        console.log('=== UPLOADING IMAGE ===');
        console.log('File URI:', fileToUpload.uri);
        console.log('File type:', fileToUpload.type);
        console.log('File size:', fileToUpload.fileSize);
        try {
          attachment = await uploadImageToCloudinary(fileToUpload.uri);
          console.log('✓ Image uploaded successfully!');
          console.log('Cloudinary URL:', attachment);
        } catch (uploadError: any) {
          console.error('=== IMAGE UPLOAD FAILED ===');
          console.error('Error:', uploadError);
          console.error('Error message:', uploadError.message);
          
          // If there's no text content, we can't send the message
          if (!messageContent) {
            Alert.alert('Error', 'Image upload failed. Please try again.');
            setLoading(false);
            // Remove optimistic message
            setMessages(prev => prev.filter(m => m.id !== tempId));
            return;
          }
          
          Alert.alert('Warning', 'Image upload failed, sending text only');
        }
      }

      const payload = {
        conversationId,
        sender: {
          id: currentUser?.id,
          name: currentUser?.name,
          avatar: currentUser?.avatar,
        },
        content: messageContent || '', // Allow empty content if there's an image
        attachment,
      };

      console.log('Emitting newMessage to backend');
      console.log('Payload:', { ...payload, attachment: attachment ? 'URL' : null });

      // Send message via socket - backend will emit to all participants
      socket.emit('newMessage', payload);

      setLoading(false);
      console.log('=== MESSAGE SENT ===');
      console.log('='.repeat(60));
    } catch (error) {
      console.log("=== ERROR SENDING MESSAGE ===");
      console.log("Error sending message: ", error);
      Alert.alert("Error", "Failed to send message");
      setLoading(false);
      
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const {
    id: conversationId,
    name,
    participants: stringifiedParticipants,
    avatar,
    type,
  } = useLocalSearchParams();

  const participants = JSON.parse(stringifiedParticipants as string);

  let conversationAvatar = Array.isArray(avatar) ? avatar[0] : avatar;
  let isDirect = type === "direct";
  const otherParticipant = isDirect
    ? participants.find((p: any) => p._id !== currentUser?.id)
    : null;
  if (isDirect && otherParticipant) {
    conversationAvatar = otherParticipant.avatar;
  }

  let conversationName = isDirect ? otherParticipant?.name : name;

  useEffect(() => {
    console.log('=== CONVERSATION MOUNTED ===');
    console.log('ID:', conversationId);
    console.log('User:', currentUser?.id);
    console.log('User name:', currentUser?.name);
    
    if (!conversationId || !currentUser?.id) {
      console.error('Missing conversation ID or user ID');
      return;
    }

    const socket = getSocket();
    if (!socket?.connected) {
      console.error('Socket not connected');
      Alert.alert('Error', 'Not connected to server. Please restart the app.');
      return;
    }

    console.log('✓ Socket connected:', socket.id);

    // Socket handlers
    const onGetMessages = (data: any) => {
      console.log('=== GOT MESSAGES FROM SOCKET ===');
      console.log('Success:', data.success);
      console.log('Count:', data.data?.length || 0);
      
      if (data.success && data.data && data.data.length > 0) {
        const msgs = data.data.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          content: m.content,
          attachment: m.attachment,
          createdAt: m.createdAt,
          isMe: m.sender.id === currentUser.id,
        }));
        console.log('✓ Setting', msgs.length, 'messages to state');
        console.log('First message:', msgs[0]?.content);
        setMessages(msgs);
      } else {
        console.log('No messages or failed');
      }
    };

    const onNewMessage = (data: any) => {
      console.log('='.repeat(60));
      console.log('=== NEW MESSAGE FROM SOCKET ===');
      console.log('Current User:', currentUser?.name, '(', currentUser?.id, ')');
      console.log('Sender:', data.data?.sender?.name, '(', data.data?.sender?.id, ')');
      console.log('Content:', data.data?.content);
      console.log('Message ID:', data.data?.id);
      console.log('='.repeat(60));
      
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
          // Check if this exact message already exists (by real ID from backend)
          const existsByRealId = prev.some(m => m.id === msg.id && !m.id.startsWith('temp_'));
          if (existsByRealId) {
            console.log('⚠️  Real message already exists, skipping');
            return prev;
          }
          
          // If I'm the sender, replace my optimistic message with the real one
          if (msg.isMe) {
            const optimisticIndex = prev.findIndex(
              m => m.id.startsWith('temp_') && 
                   m.content === msg.content && 
                   m.sender.id === msg.sender.id
            );
            
            if (optimisticIndex !== -1) {
              console.log('✓ Replacing optimistic message with real one');
              const newList = [...prev];
              newList[optimisticIndex] = msg;
              return newList;
            }
          }
          
          // Otherwise, add as new message (for receiver)
          console.log('✓ Adding new message from', msg.isMe ? 'me' : 'other user');
          return [msg, ...prev];
        });
      }
      setLoading(false);
    };

    // Setup socket listeners
    console.log('Setting up socket listeners...');
    socket.on('getMessages', onGetMessages);
    socket.on('newMessage', onNewMessage);
    console.log('✓ Listeners set up');
    
    console.log('Joining conversation room...');
    socket.emit('joinConversation', conversationId);
    
    // Request messages immediately (no delay needed)
    console.log('Requesting messages...');
    socket.emit('getMessages', { conversationId });

    return () => {
      console.log('=== CLEANUP ===');
      socket.off('getMessages', onGetMessages);
      socket.off('newMessage', onNewMessage);
    };
  }, [conversationId, currentUser?.id]);

  // console.log("got conversation data: ", data);
  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* header */}
        <Header
          left={
            <View style={styles.headerLeft}>
              <BackButton />
              <Avatar
                size={40}
                uri={conversationAvatar as string}
                isGroup={type === "group"}
              />
              <Typo color={colors.white} fontWeight={"500"} size={22}>
                {conversationName}
              </Typo>
            </View>
          }
          right={
            <TouchableOpacity>
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color={colors.white}
              />
            </TouchableOpacity>
          }
        />

        {/* messages */}
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

  header: {
    paddingHorizontal: spacingX._15,
    paddingTop: spacingY._10,
    paddingBottom: spacingY._15,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
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

  messagesContainer: {
    flex: 1,
  },

  messagesContent: {
    paddingTop: spacingY._20,
    paddingBottom: spacingY._10,
    gap: spacingY._12,
  },

  plusIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },

  input: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderRadius: radius._20,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._12,
    fontSize: 15,
    color: colors.neutral900,
  },

  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
