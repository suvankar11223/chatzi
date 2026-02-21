import { Platform } from "react-native";
import { getLocalIP } from "@/utils/network";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================
// DYNAMIC IP CONFIGURATION
// ============================================================
// The IP address is now discovered dynamically at runtime
// to solve the issue of hardcoded IPs that change when network changes
// ============================================================

// This will be set dynamically
let cachedApiUrl: string | null = null;

/**
 * Get the API URL - dynamically discovers server IP if needed
 * This function handles the IP address automatically
 */
export const getApiUrl = async (): Promise<string> => {
  if (cachedApiUrl) {
    return cachedApiUrl;
  }

  // First, check if user has configured a custom server IP
  try {
    const savedIP = await AsyncStorage.getItem('serverIP');
    if (savedIP) {
      cachedApiUrl = `http://${savedIP}:3000/api`;
      console.log("[DEBUG] API Configuration: Using saved server IP:", savedIP);
      return cachedApiUrl;
    }
  } catch (error) {
    console.warn("[DEBUG] Failed to load saved server IP:", error);
  }

  // For iOS simulator
  if (Platform.OS === "ios") {
    cachedApiUrl = "http://localhost:3000/api";
    console.log("[DEBUG] API Configuration: iOS simulator - using localhost");
    return cachedApiUrl;
  }

  // For Android emulator  
  if (Platform.OS === "android") {
    // For physical devices, always try to discover IP
    // Emulators would use 10.0.2.2, but we're targeting physical devices
    try {
      const ip = await getLocalIP();
      if (ip) {
        cachedApiUrl = `http://${ip}:3000/api`;
        console.log("[DEBUG] API Configuration: Android physical device - discovered IP:", ip);
        return cachedApiUrl;
      }
    } catch (error) {
      console.warn("[DEBUG] API Configuration: IP discovery failed for Android");
    }
    
    // Fallback to local network IP for physical device
    cachedApiUrl = "http://172.25.251.53:3000/api";
    console.log("[DEBUG] API Configuration: Android - using fallback IP");
    return cachedApiUrl;
  }

  // For physical device (Expo Go) - try to discover IP
  try {
    const ip = await getLocalIP();
    if (ip) {
      cachedApiUrl = `http://${ip}:3000/api`;
      console.log("[DEBUG] API Configuration: Physical device - discovered IP:", ip);
      return cachedApiUrl;
    }
  } catch (error) {
    console.warn("[DEBUG] API Configuration: IP discovery failed");
  }
  
  // Fallback to local network IP
  cachedApiUrl = "http://172.25.251.53:3000/api";
  console.warn("[DEBUG] API Configuration: Using fallback IP");
  
  console.log("[DEBUG] API Configuration for Physical Device (Expo Go)");
  console.log("[DEBUG] API_URL:", cachedApiUrl);
  console.log("[DEBUG] Platform:", Platform.OS);
  console.log("=".repeat(60));
  
  return cachedApiUrl;
};

/**
 * Get Socket URL - derives from API URL
 */
export const getSocketUrl = async (): Promise<string> => {
  const apiUrl = await getApiUrl();
  return apiUrl.replace("/api", "");
};

/**
 * Clear cached URL - useful when server IP changes
 */
export const clearCachedUrl = () => {
  cachedApiUrl = null;
};

// Legacy export for backward compatibility
// Use getApiUrl() instead for dynamic IP resolution
export const API_URL = "http://172.25.251.53:3000/api";

// ============================================================
// CONFIGURATION LOGGING
// ============================================================
// This runs when the app starts to help debug connection issues
// ============================================================

const logConfiguration = () => {
  console.log("=".repeat(60));
  console.log("[DEBUG] API Configuration - Dynamic IP Mode");
  console.log("=".repeat(60));
  console.log("[DEBUG] Platform:", Platform.OS);
  console.log("[DEBUG] IMPORTANT: Make sure your phone and computer are on the SAME WiFi network!");
  console.log("=".repeat(60));
  
  // Try to get the API URL
  getApiUrl().then(url => {
    console.log("[DEBUG] Resolved API URL:", url);
  });
};

// Run configuration logging
if (Platform.OS !== "ios") {
  logConfiguration();
}
