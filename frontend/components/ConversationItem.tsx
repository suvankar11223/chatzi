import { colors, spacingX, spacingY } from "@/constants/theme";
import { ConversationListItemProps } from "@/types";
import moment from "moment";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Avatar from "./Avatar";
import Typo from "./Typo";
import { useAuth } from "@/context/authContext";

const ConversationItem = ({
  item,
  showDivider,
  router,
}: ConversationListItemProps) => {
  const openConversation = () => {
    router.push({
      pathname: "/(main)/conversation",
      params: {
        id: item._id,
        name: isDirect ? otherParticipant?.name : item.name,
        avatar: avatar,
        type: item.type,
        participants: JSON.stringify(item.participants),
      },
    });
  };

  const { user: currentUser } = useAuth();

  const lastMessage: any = item.lastMessage;
  const isDirect = item.type === "direct";
  let avatar = item.avatar;
  const otherParticipant = isDirect
    ? item.participants.find((p) => p._id !== currentUser?.id)
    : null;
  if (isDirect && otherParticipant) avatar = otherParticipant?.avatar;

  const getLastMessageContent = () => {
    if (!lastMessage) return "Say hi 👋";

    return lastMessage?.attachment ? "Image" : lastMessage.content;
  };

  const getLastMessageDate = () => {
    if (!lastMessage?.createdAt) return null;

    const messageDate = moment(lastMessage.createdAt);
    const now = moment();

    if (messageDate.isSame(now, "day")) {
      return messageDate.format("h:mm A");
    } else if (messageDate.isSame(now.subtract(1, "day"), "day")) {
      return "Yesterday";
    } else if (messageDate.isSame(now, "week")) {
      return messageDate.format("dddd");
    } else if (messageDate.isSame(now, "year")) {
      return messageDate.format("MMM D");
    } else {
      return messageDate.format("MMM D, YYYY");
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={openConversation}>
        <View>
          <Avatar uri={avatar} size={47} isGroup={item.type === "group"} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Typo size={17} fontWeight={"600"}>
              {isDirect ? otherParticipant?.name : item?.name}
            </Typo>

            {item.lastMessage && <Typo size={15}>{getLastMessageDate()}</Typo>}
          </View>

          <Typo
            size={15}
            color={colors.neutral600}
            textProps={{ numberOfLines: 1 }}
          >
            {getLastMessageContent()}
          </Typo>
        </View>
      </TouchableOpacity>

      {showDivider && <View style={styles.divider} />}
    </>
  );
};

export default ConversationItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
    alignItems: "center",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral200,
    marginLeft: spacingX._20 + 47 + 12,
    marginRight: spacingX._20,
  },
});
