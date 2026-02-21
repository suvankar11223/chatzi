import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Typo from "@/components/Typo";
import Avatar from "@/components/Avatar";
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
import { getCallHistory } from "@/services/callService";
import { CallHistoryItem } from "@/types";
import { useAuth } from "@/context/authContext";

const CallHistoryScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCallHistory = async () => {
    try {
      setError(null);
      const history = await getCallHistory(50, 0);
      setCalls(history);
    } catch (err: any) {
      console.error("[DEBUG] CallHistory: Error loading call history:", err);
      // Check if it's a network error
      if (err.message && err.message.includes("Network request failed")) {
        setError("Unable to connect to server. Please check your network connection.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Unable to load call history. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCallHistory();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCallHistory();
    setRefreshing(false);
  };

  const getOtherUser = (call: CallHistoryItem) => {
    if (call.callerId._id === user?.id) {
      return call.calleeId;
    }
    return call.callerId;
  };

  const isOutgoing = (call: CallHistoryItem) => {
    return call.callerId._id === user?.id;
  };

  const getCallStatusIcon = (status: string, isAudio: boolean) => {
    switch (status) {
      case "missed":
        return "❌";
      case "declined":
        return "⛔";
      case "connected":
        return isAudio ? "📞" : "📹";
      default:
        return "📱";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const renderCallItem = ({ item }: { item: CallHistoryItem }) => {
    const otherUser = getOtherUser(item);
    const outgoing = isOutgoing(item);
    const isAudio = item.type === "audio";

    return (
      <TouchableOpacity style={styles.callItem}>
        <Avatar size={50} uri={otherUser.avatar || null} />
        
        <View style={styles.callInfo}>
          <Typo size={16} fontWeight="500" color={colors.text}>
            {otherUser.name}
          </Typo>
          <View style={styles.callDetails}>
            <Typo size={12} color={colors.neutral500}>
              {outgoing ? "⬆️" : "⬇️"} {getCallStatusIcon(item.status, isAudio)}
            </Typo>
            {item.duration && item.status === "connected" && (
              <Typo size={12} color={colors.neutral500}>
                {" "}• {formatDuration(item.duration)}
              </Typo>
            )}
            {item.status === "missed" && (
              <Typo size={12} color={colors.rose}>
                {" "}• Missed
              </Typo>
            )}
            {item.status === "declined" && (
              <Typo size={12} color={colors.neutral500}>
                {" "}• Declined
              </Typo>
            )}
          </View>
        </View>

        <View style={styles.callTime}>
          <Typo size={12} color={colors.neutral500}>
            {formatDate(item.createdAt)}
          </Typo>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper bgOpacity={1}>
      <Header 
        title={<Typo size={18} fontWeight="600">Call History</Typo>}
        left={<BackButton />}
      />
      
      <FlatList
        data={calls}
        keyExtractor={(item) => item._id}
        renderItem={renderCallItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {error ? (
              <>
                <Typo size={48}>⚠️</Typo>
                <Typo size={18} color={colors.rose} style={styles.emptyText}>
                  {error}
                </Typo>
                <Typo size={14} color={colors.neutral400}>
                  Make sure your phone and computer are on the same WiFi network
                </Typo>
              </>
            ) : (
              <>
                <Typo size={48}>📞</Typo>
                <Typo size={18} color={colors.neutral500} style={styles.emptyText}>
                  No call history yet
                </Typo>
                <Typo size={14} color={colors.neutral400}>
                  Your calls will appear here
                </Typo>
              </>
            )}
          </View>
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: spacingX._15,
    paddingTop: spacingY._10,
  },
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacingY._12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  callInfo: {
    flex: 1,
    marginLeft: spacingX._12,
  },
  callDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacingY._5,
  },
  callTime: {
    alignItems: "flex-end",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    marginTop: spacingY._15,
    marginBottom: spacingY._5,
  },
});

export default CallHistoryScreen;
