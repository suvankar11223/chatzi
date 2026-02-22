import { colors, spacingX, spacingY } from "@/constants/theme";
import { ConversationListItemProps } from "@/types";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Avatar from "./Avatar";
import Typo from "./Typo";
import { useAuth } from "@/context/authContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const ConversationItem = ({
  item,
  showDivider,
  router,
}: ConversationListItemProps) => {
  const { user: currentUser } = useAuth();
  const { isOnline } = useOnlineStatus();

  const openConversation = () => {
    router.push({
      pathname: "/conversation",
      params: {
        id: item._id,
        name: isDirect ? otherParticipant?.name : item.name,
        avatar: avatar,
        type: item.type,
        participants: JSON.stringify(item.participants),
      },
    });
  };

  const lastMessage: any = item.lastMessage;
  const isDirect = item.type === "direct";
  let avatar = item.avatar;
  const otherParticipant = isDirect
    ? item.participants.find((p) => p._id !== currentUser?.id)
    : null;
  if (isDirect && otherParticipant) avatar = otherParticipant?.avatar;

  const displayName = isDirect ? (otherParticipant?.name || 'Unknown') : (item?.name || 'Unknown');

  const online = isDirect ? isOnline(otherParticipant?._id || '') : false;

  const getLastMessageContent = () => {
    if (!lastMessage) return "Say hi 👋";
    return lastMessage?.attachment ? "📷 Image" : lastMessage.content;
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return date.toLocaleDateString([], { weekday: 'short' }); // "Mon"
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }); // "Dec 12"
  };

  const getLastMessageDate = () => {
    if (!lastMessage?.createdAt) return null;
    return formatTime(lastMessage.createdAt);
  };

  const unreadCount = item.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={openConversation}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <Avatar 
            uri={avatar} 
            size={52} 
            isGroup={item.type === "group"}
            showOnline={item.type === "direct"}
            isOnline={online}
          />
        </View>

        {/* Middle: name + last message */}
        <View style={styles.content}>
          <Typo
            size={16}
            fontWeight={hasUnread ? "700" : "600"}
            color={colors.neutral900}
            textProps={{ numberOfLines: 1 }}
          >
            {displayName}
          </Typo>
          <Typo
            size={13}
            color={hasUnread ? colors.neutral700 : colors.neutral500}
            fontWeight={hasUnread ? "500" : "400"}
            textProps={{ numberOfLines: 1 }}
          >
            {getLastMessageContent()}
          </Typo>
        </View>

        {/* Right: time + badge */}
        <View style={styles.right}>
          {lastMessage && (
            <Typo 
              size={11} 
              color={hasUnread ? colors.primary : colors.neutral400}
              fontWeight={hasUnread ? "600" : "400"}
            >
              {getLastMessageDate()}
            </Typo>
          )}
          {hasUnread && (
            <View style={styles.badge}>
              <Typo size={11} fontWeight="700" color={colors.white}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Typo>
            </View>
          )}
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
    backgroundColor: colors.white,
  },
  avatarWrapper: {
    marginRight: spacingX._12,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
    minWidth: 48,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginLeft: spacingX._20 + 52 + spacingX._12,
  },
});
