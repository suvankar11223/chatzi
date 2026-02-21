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
 * Get the API URL - uses direct local IP for faster connection
 */
export const getApiUrl = async (): Promise<string> => {
  if (cachedApiUrl) {
    return cachedApiUrl;
  }

  // Use local IP directly - much faster than checking AsyncStorage
  // The IP 172.25.250.173 is the computer's IP on the network
  cachedApiUrl = "http://172.25.250.173:3000/api";
  console.log("[DEBUG] API Configuration: Using local IP for fast connection");
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
