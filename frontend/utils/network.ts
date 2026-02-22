import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================
// LOCAL BACKEND CONFIGURATION
// ============================================
// Using Render production backend
const PRODUCTION_URL = "https://chatzi-1m0m.onrender.com";

// ============================================
// NETWORK STATE
// ============================================
let isConnected: boolean = true;
let onlineListeners: (() => void)[] = [];
let offlineListeners: (() => void)[] = [];
let cachedApiUrl: string | null = null;

/**
 * Force refresh the cached URL (call this when ngrok restarts)
 */
export const forceRefreshUrl = (): void => {
  cachedApiUrl = null;
  console.log('[Network] URL cache cleared - will refresh on next request');
};

/**
 * Get the base server URL
 * Priority: production URL (always use Render deployment)
 */
export const getServerUrl = async (): Promise<string> => {
  // Return cached URL if available
  if (cachedApiUrl) {
    return cachedApiUrl;
  }
  
  // Always use production URL
  console.log('[Network] Using production URL:', PRODUCTION_URL);
  cachedApiUrl = PRODUCTION_URL;
  return PRODUCTION_URL;
};

/**
 * Get API URL
 */
export const getApiUrl = async (): Promise<string> => {
  const baseUrl = await getServerUrl();
  return `${baseUrl}/api`;
};

/**
 * Get Socket URL
 */
export const getSocketUrl = async (): Promise<string> => {
  return await getServerUrl();
};

/**
 * Get local IP (for display purposes only)
 */
export const getLocalIP = async (): Promise<string> => {
  return PRODUCTION_URL.replace('https://', '').replace('http://', '');
};

/**
 * Check if we can reach the server
 */
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const baseUrl = await getServerUrl();
    const url = `${baseUrl}/api/health`;
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const connected = response.ok;
    
    if (connected !== isConnected) {
      isConnected = connected;
      if (connected) {
        console.log('[Network] Connection restored');
        onlineListeners.forEach(listener => listener());
      } else {
        console.log('[Network] Connection lost');
        offlineListeners.forEach(listener => listener());
      }
    }
    
    return connected;
  } catch {
    if (isConnected) {
      isConnected = false;
      console.log('[Network] Connection lost');
      offlineListeners.forEach(listener => listener());
    }
    return false;
  }
};

/**
 * Get current network connection status
 */
export const getNetworkStatus = (): boolean => {
  return isConnected;
};

/**
 * Add listener for when network comes online
 */
export const addOnlineListener = (listener: () => void): void => {
  onlineListeners.push(listener);
};

/**
 * Add listener for when network goes offline
 */
export const addOfflineListener = (listener: () => void): void => {
  offlineListeners.push(listener);
};

/**
 * Initialize network state listener
 */
export const initializeNetworkListener = (): void => {
  // Check network every 10 seconds
  setInterval(() => {
    checkNetworkConnection();
  }, 10000);
  
  // Initial check
  checkNetworkConnection();
};

/**
 * Clear cached IP (no-op, kept for compatibility)
 */
export const clearCachedIP = (): void => {
  console.log('[Network] clearCachedIP called - clearing cached URL');
  cachedApiUrl = null;
};

/**
 * Discover server IP (no-op, kept for compatibility)
 */
export const discoverServerIP = async (): Promise<string> => {
  cachedApiUrl = null; // Force refresh
  return await getLocalIP();
};

// ============================================
// CACHE STORAGE
// ============================================
const CACHE_KEYS = {
  CONTACTS: 'cached_contacts',
  CONVERSATIONS: 'cached_conversations',
  CONTACTS_TIMESTAMP: 'cached_contacts_timestamp',
  CONVERSATIONS_TIMESTAMP: 'cached_conversations_timestamp',
};

const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached contacts
 */
export const getCachedContacts = async (): Promise<any[] | null> => {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_KEYS.CONTACTS_TIMESTAMP);
    const contacts = await AsyncStorage.getItem(CACHE_KEYS.CONTACTS);
    
    if (!contacts) return null;
    
    if (timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      if (age > CACHE_EXPIRY_MS) {
        console.log('[Network] Contacts cache expired');
        return null;
      }
    }
    
    return JSON.parse(contacts);
  } catch (error) {
    console.error('[Network] Error reading cached contacts:', error);
    return null;
  }
};

/**
 * Save contacts to cache
 */
export const cacheContacts = async (contacts: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.CONTACTS, JSON.stringify(contacts));
    await AsyncStorage.setItem(CACHE_KEYS.CONTACTS_TIMESTAMP, Date.now().toString());
    console.log('[Network] Cached', contacts.length, 'contacts');
  } catch (error) {
    console.error('[Network] Error caching contacts:', error);
  }
};

/**
 * Get cached conversations
 */
export const getCachedConversations = async (): Promise<any[] | null> => {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_KEYS.CONVERSATIONS_TIMESTAMP);
    const conversations = await AsyncStorage.getItem(CACHE_KEYS.CONVERSATIONS);
    
    if (!conversations) return null;
    
    if (timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      if (age > CACHE_EXPIRY_MS) {
        console.log('[Network] Conversations cache expired');
        return null;
      }
    }
    
    return JSON.parse(conversations);
  } catch (error) {
    console.error('[Network] Error reading cached conversations:', error);
    return null;
  }
};

/**
 * Save conversations to cache
 */
export const cacheConversations = async (conversations: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    await AsyncStorage.setItem(CACHE_KEYS.CONVERSATIONS_TIMESTAMP, Date.now().toString());
    console.log('[Network] Cached', conversations.length, 'conversations');
  } catch (error) {
    console.error('[Network] Error caching conversations:', error);
  }
};

/**
 * Clear all cached data
 */
export const clearCache = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      CACHE_KEYS.CONTACTS,
      CACHE_KEYS.CONVERSATIONS,
      CACHE_KEYS.CONTACTS_TIMESTAMP,
      CACHE_KEYS.CONVERSATIONS_TIMESTAMP,
    ]);
    console.log('[Network] Cache cleared');
  } catch (error) {
    console.error('[Network] Error clearing cache:', error);
  }
};

// Log configuration on startup
console.log('='.repeat(60));
console.log('[Network] Configuration');
console.log('='.repeat(60));
console.log('[Network] Platform:', Platform.OS);
console.log('[Network] Production URL:', PRODUCTION_URL);
console.log('='.repeat(60));
