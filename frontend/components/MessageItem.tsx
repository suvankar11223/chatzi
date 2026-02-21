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
});
