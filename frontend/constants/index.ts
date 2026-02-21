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

  // For iOS simulator
  if (Platform.OS === "ios") {
    cachedApiUrl = "http://localhost:3000/api";
    console.log("[DEBUG] API Configuration: iOS simulator - using localhost");
    return cachedApiUrl;
  }

  // For Android/physical device - use the network utility's IP
  try {
    const ip = await getLocalIP();
    if (ip) {
      cachedApiUrl = `http://${ip}:3000/api`;
      console.log("[DEBUG] API Configuration: Using IP from network utility:", ip);
      return cachedApiUrl;
    }
  } catch (error) {
    console.warn("[DEBUG] API Configuration: IP discovery failed");
  }
  
  // Fallback to production URL
  cachedApiUrl = "https://chatzi-1m0m.onrender.com/api";
  console.warn("[DEBUG] API Configuration: Using production URL");
  
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
export const API_URL = "https://chatzi-1m0m.onrender.com/api";

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
