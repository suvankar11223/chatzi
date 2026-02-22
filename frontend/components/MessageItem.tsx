import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { MessageProps } from "@/types";
import { verticalScale } from "@/utils/styling";
import React, { useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity, Modal, Dimensions } from "react-native";
import Typo from "./Typo";
import Avatar from "./Avatar";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MessageItem = ({
  item,
  isDirect,
}: {
  item: MessageProps;
  isDirect: boolean;
}) => {
  const isMe = item.isMe;
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

  const formattedDate = moment(item.createdAt).isSame(moment(), "day")
    ? moment(item.createdAt).format("h:mm A")
    : moment(item.createdAt).format("MMM D, h:mm A");

  // Format call duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  // Render call message
  if (item.isCallMessage && item.callData) {
    const { type, duration, status } = item.callData;
    const isVideo = type === 'video';
    const isMissed = status === 'missed';
    const isDeclined = status === 'declined';
    
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        {!isMe && !isDirect && (
          <Avatar size={30} uri={item.sender.avatar} />
        )}
        
        <View>
          <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
            {!isMe && !isDirect && (
              <Typo color={colors.neutral900} fontWeight={"600"} size={13}>
                {item.sender.name}
              </Typo>
            )}
            
            <View style={styles.callContent}>
              <View style={styles.callIconWrapper}>
                <Ionicons 
                  name={isVideo ? "videocam" : "call"} 
                  size={20} 
                  color={isMissed ? colors.rose : colors.neutral700} 
                />
                <Ionicons 
                  name={isMe ? "arrow-up" : "arrow-down"} 
                  size={14} 
                  color={isMissed ? colors.rose : colors.neutral700}
                  style={{ marginLeft: -2 }} 
                />
              </View>
              
              <View style={styles.callTextWrapper}>
                <Typo 
                  color={isMissed ? colors.rose : colors.neutral900} 
                  fontWeight="500" 
                  size={14}
                >
                  {isVideo ? 'Video call' : 'Voice call'}
                </Typo>
                
                <Typo color={colors.neutral600} size={13}>
                  {isMissed ? 'Missed call' : isDeclined ? 'Call declined' : formatDuration(duration || 0)}
                </Typo>
              </View>
            </View>
            
            <Typo color={colors.neutral500} size={11} style={{ marginTop: spacingY._5 }}>
              {formattedDate}
            </Typo>
          </View>
        </View>
      </View>
    );
  }

  return (
    <>
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {!isMe && !isDirect && (
          <Avatar size={30} uri={item.sender.avatar} />
        )}

        <View>
          <View
            style={[
              styles.messageBubble,
              isMe ? styles.myBubble : styles.theirBubble,
            ]}
          >
            {!isMe && !isDirect && (
              <Typo color={colors.neutral900} fontWeight={"600"} size={13}>
                {item.sender.name}
              </Typo>
            )}

            {item.content && <Typo size={15}>{item.content}</Typo>}

            {item.attachment && (
              <TouchableOpacity 
                onPress={() => setImagePreviewVisible(true)}
                activeOpacity={0.9}
              >
                <Image 
                  source={{ uri: item.attachment }} 
                  style={styles.attachment}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('Image load error:', error.nativeEvent.error);
                  }}
                />
              </TouchableOpacity>
            )}

            <Typo
              style={{ alignSelf: "flex-end" }}
              size={11}
              fontWeight={"500"}
              color={colors.neutral600}
            >
              {formattedDate}
            </Typo>
          </View>
        </View>
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={imagePreviewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImagePreviewVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImagePreviewVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setImagePreviewVisible(false)}
            >
              <Ionicons name="close" size={30} color={colors.white} />
            </TouchableOpacity>
            
            <Image 
              source={{ uri: item.attachment || '' }} 
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default MessageItem;

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    gap: spacingX._7,
    maxWidth: "80%",
  },

  myMessage: {
    alignSelf: "flex-end",
  },

  theirMessage: {
    alignSelf: "flex-start",
  },

  messageAvatar: {
    alignSelf: "flex-end",
  },

  attachment: {
    height: verticalScale(180),
    width: verticalScale(180),
    borderRadius: radius._10,
  },

  messageBubble: {
    padding: spacingX._10,
    borderRadius: radius._15,
    gap: spacingY._5,
  },

  myBubble: {
    backgroundColor: colors.myBubble,
  },

  theirBubble: {
    backgroundColor: colors.otherBubble,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButton: {
    position: 'absolute',
    top: -50,
    right: 10,
    zIndex: 10,
    padding: 10,
  },

  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: radius._15,
  },

  // Call message styles
  callContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
  },

  callIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  callTextWrapper: {
    flex: 1,
    gap: spacingY._5,
  },
});
