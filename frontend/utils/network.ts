import { Platform } from "react-native";

// Static IP - this is the IP of your computer on the network
// Change this if your computer's IP changes
const COMPUTER_IP = "172.25.254.47";

/**
 * Get the server IP address.
 * Returns the correct IP based on platform.
 */
export const getLocalIP = async (): Promise<string> => {
  // For iOS simulator - use localhost
  if (Platform.OS === "ios") {
    console.log("[DEBUG] Network: iOS simulator detected, using localhost");
    return "localhost";
  }

  // For Android - check if running in Expo Go (physical device)
  // In Expo Go, we should use the computer's IP, not 10.0.2.2
  // The 10.0.2.2 is only for Android emulator, not for Expo Go
  if (Platform.OS === "android") {
    // Use computer's IP for Expo Go on physical Android device
    console.log("[DEBUG] Network: Android platform detected, using computer IP:", COMPUTER_IP);
    return COMPUTER_IP;
  }

  // For all other cases (including Expo Go on physical device), use computer IP
  console.log("[DEBUG] Network: Using computer IP:", COMPUTER_IP);
  return COMPUTER_IP;
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
