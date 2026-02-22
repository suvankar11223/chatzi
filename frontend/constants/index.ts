import { getApiUrl, getSocketUrl } from "@/utils/network";

/**
 * Get the API URL dynamically
 * Uses ngrok URL from network.ts
 */
export { getApiUrl, getSocketUrl };

/**
 * Legacy export for backward compatibility
 * DO NOT USE - use getApiUrl() instead
 */
export const API_URL = "https://chatzi-1m0m.onrender.com/api";
