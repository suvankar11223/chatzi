import * as Contacts from 'expo-contacts';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCachedContacts,
  cacheContacts,
  getCachedConversations,
  cacheConversations,
} from '@/utils/network';

export interface PhoneContact {
  id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
}

// Track if we're currently loading data
let isLoadingContacts = false;
let isLoadingConversations = false;

/**
 * Request permission to access contacts
 */
export const requestContactsPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'This app needs access to your contacts to find friends who use the app.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Fetch all contacts from the device
 */
export const getPhoneContacts = async (): Promise<PhoneContact[]> => {
  try {
    const hasPermission = await requestContactsPermission();
    
    if (!hasPermission) {
      return [];
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
      ],
    });

    const phoneContacts: PhoneContact[] = data
      .filter(contact => contact.name)
      .map(contact => ({
        id: contact.id,
        name: contact.name || 'Unknown',
        phoneNumbers: contact.phoneNumbers?.map(p => p.number || '') || [],
        emails: contact.emails?.map(e => e.email || '') || [],
      }));

    return phoneContacts;
  } catch {
    Alert.alert('Error', 'Failed to fetch contacts');
    return [];
  }
};

/**
 * Normalize phone number for comparison
 */
export const normalizePhoneNumber = (phone: string): string => {
  let normalized = phone.replace(/\D/g, '');
  if (normalized.length > 10) {
    normalized = normalized.slice(-10);
  }
  return normalized;
};

/**
 * Match phone contacts with registered app users
 */
export const matchContactsWithUsers = (
  phoneContacts: PhoneContact[],
  appUsers: any[]
): any[] => {
  const matchedUsers: any[] = [];
  const userPhoneMap = new Map<string, any>();
  const userEmailMap = new Map<string, any>();

  appUsers.forEach(user => {
    if (user.email) {
      userEmailMap.set(user.email.toLowerCase(), user);
    }
    if (user.phone) {
      const normalizedPhone = normalizePhoneNumber(user.phone);
      userPhoneMap.set(normalizedPhone, user);
    }
  });

  phoneContacts.forEach(contact => {
    for (const phoneNumber of contact.phoneNumbers) {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const matchedUser = userPhoneMap.get(normalizedPhone);
      
      if (matchedUser && !matchedUsers.find(u => u._id === matchedUser._id)) {
        matchedUsers.push({
          ...matchedUser,
          contactName: contact.name,
          isContact: true,
        });
        break;
      }
    }

    for (const email of contact.emails) {
      const matchedUser = userEmailMap.get(email.toLowerCase());
      
      if (matchedUser && !matchedUsers.find(u => u._id === matchedUser._id)) {
        matchedUsers.push({
          ...matchedUser,
          contactName: contact.name,
          isContact: true,
        });
        break;
      }
    }
  });
  
  return matchedUsers;
};

/**
 * Fetch contacts from the backend - tries API first, falls back to cache
 */
export const fetchContactsFromAPI = async (token: string, retries = 1): Promise<any[]> => {
  if (isLoadingContacts) {
    console.log('[ContactsService] Already loading contacts, returning cached');
    const cached = await getCachedContacts();
    return cached || [];
  }

  isLoadingContacts = true;

  try {
    // First get any cached data
    const cached = await getCachedContacts();
    console.log('[ContactsService] Cached contacts:', cached?.length || 0);
    
    // Try fetching from API with retries
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { getApiUrl } = await import("@/constants");
        const API_URL = await getApiUrl();
        const url = `${API_URL}/user/contacts`;
        console.log('[ContactsService] Fetching from:', url, 'Attempt:', attempt);
        console.log('[ContactsService] Token exists:', !!token, 'Token prefix:', token?.substring(0, 20));
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // Faster timeout
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        
        console.log('[ContactsService] Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[ContactsService] API response success:', data.success);

        if (data.success && data.data) {
          // Cache the results
          await cacheContacts(data.data);
          isLoadingContacts = false;
          console.log('[ContactsService] Cached', data.data.length, 'contacts');
          return data.data;
        }
        
        // API returned empty or error - use cached
        console.log('[ContactsService] API returned no data, using cached');
        isLoadingContacts = false;
        return cached || data.data || [];
      } catch (error: any) {
        console.log('[ContactsService] Attempt', attempt, 'failed:', error.message);
        if (attempt === retries) {
          isLoadingContacts = false;
          // Return cached if available
          console.log('[ContactsService] All attempts failed, returning cached');
          return cached || [];
        }
        
        const waitTime = Math.pow(2, attempt - 1) * 500; // Faster retries
        console.log('[ContactsService] Retrying in', waitTime, 'ms');
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    isLoadingContacts = false;
    return cached || [];
  } catch (error: any) {
    console.error('[ContactsService] Fatal error:', error);
    isLoadingContacts = false;
    const cached = await getCachedContacts();
    return cached || [];
  }
};

/**
 * Fetch all conversations from the backend
 */
export const fetchConversationsFromAPI = async (token: string): Promise<any[]> => {
  if (isLoadingConversations) {
    console.log('[ContactsService] Already loading conversations, returning cached');
    const cached = await getCachedConversations();
    return cached || [];
  }

  isLoadingConversations = true;

  try {
    // First get any cached data
    const cached = await getCachedConversations();
    console.log('[ContactsService] Cached conversations:', cached?.length || 0);

    try {
      const { getApiUrl } = await import("@/constants");
      const API_URL = await getApiUrl();
      console.log('[ContactsService] Fetching conversations from:', API_URL);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Faster timeout
      
      const response = await fetch(`${API_URL}/user/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('[ContactsService] Conversations API response:', response.status);

      const data = await response.json();

      if (data.success && data.data) {
        await cacheConversations(data.data);
        isLoadingConversations = false;
        console.log('[ContactsService] Cached', data.data.length, 'conversations');
        return data.data;
      }
      
      console.log('[ContactsService] API returned no conversations, using cached');
      isLoadingConversations = false;
      return cached || [];
    } catch (error: any) {
      console.log('[ContactsService] Error fetching conversations:', error.message);
      isLoadingConversations = false;
      return cached || [];
    }
  } catch (error: any) {
    console.error('[ContactsService] Fatal error:', error);
    isLoadingConversations = false;
    const cached = await getCachedConversations();
    return cached || [];
  }
};

/**
 * Force refresh contacts
 */
export const forceRefreshContacts = async (token: string): Promise<any[]> => {
  isLoadingContacts = false;
  return fetchContactsFromAPI(token, 3);
};

/**
 * Force refresh conversations
 */
export const forceRefreshConversations = async (token: string): Promise<any[]> => {
  isLoadingConversations = false;
  return fetchConversationsFromAPI(token);
};
