import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/constants";
import { CallHistoryItem } from "@/types";

export const getCallHistory = async (limit = 20, offset = 0): Promise<CallHistoryItem[]> => {
  try {
    const API_URL = await getApiUrl();
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(`${API_URL}/calls/history?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch call history: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    throw new Error(data.msg || "Failed to fetch call history");
  } catch (error: any) {
    // Re-throw network errors with proper message
    if (error.message === "Network request failed" || error.message.includes("Network")) {
      throw new Error("Network request failed");
    }
    throw error;
  }
};

export const getCallDetails = async (callId: string): Promise<CallHistoryItem | null> => {
  try {
    const API_URL = await getApiUrl();
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(`${API_URL}/calls/${callId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("[DEBUG] CallService: Error fetching call details:", error);
    return null;
  }
};

export const deleteCallRecord = async (callId: string): Promise<boolean> => {
  try {
    const API_URL = await getApiUrl();
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(`${API_URL}/calls/${callId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("[DEBUG] CallService: Error deleting call record:", error);
    return false;
  }
};
