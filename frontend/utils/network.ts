import { Platform } from "react-native";

// Static fallback IP - this will be used as primary
// This solves the issue of IP detection being unreliable
const FALLBACK_IP = "172.25.250.173";

/**
 * Get the server IP address.
 * For now, uses a static IP that works on your network.
 * In production, this could be a domain name.
 */
export const getLocalIP = async (): Promise<string> => {
  // For iOS simulator - use localhost
  if (Platform.OS === "ios") {
    return "localhost";
  }

  // For Android emulator - use special IP for host machine
  if (Platform.OS === "android") {
    return "10.0.2.2";
  }

  // For physical device (Expo Go) - use the known working IP
  // This IP is hardcoded as a fallback since dynamic detection is complex
  console.log("[DEBUG] Network: Using static IP for physical device:", FALLBACK_IP);
  return FALLBACK_IP;
};

/**
 * Get API URL
 */
export const getApiUrl = async (): Promise<string> => {
  const ip = await getLocalIP();
  return `http://${ip}:3000/api`;
};

/**
 * Get Socket URL
 */
export const getSocketUrl = async (): Promise<string> => {
  const ip = await getLocalIP();
  return `http://${ip}:3000`;
};

/**
 * Clear any cached IP (not used in this implementation)
 */
export const clearCachedIP = (): void => {
  // No-op for static implementation
};

/**
 * Discover server IP - tries multiple strategies
 */
export const discoverServerIP = async (): Promise<string> => {
  return getLocalIP();
};
