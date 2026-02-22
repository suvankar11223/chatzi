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

let isLoadingContacts = false;
let isLoadingConversations = false;
let serverWarmedUp = false;

/**
 * Wake up Render server before making API calls
 * Render free tier sleeps after 15 mins of inactivity
 */
export const warmUpServer = async (): Promise<void> => {
  if (serverWarmedUp) return;

  try {
    console.log('[ContactsService] Waking up server...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for cold start

    await fetch('https://chatzi-1m0m.onrender.com/', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    serverWarmedUp = true;
    console.log('[ContactsService] Server is awake ✅');

    // Reset flag after 10 mins so it warms up again if needed
    setTimeout(() => { serverWarmedUp = false; }, 10 * 60 * 1000);
  } catch (e) {
    // Even if ping fails, continue — server might still respond to API calls
    console.log('[ContactsService] Warm-up ping failed, continuing anyway');
  }
};

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

export const getPhoneContacts = async (): Promise<PhoneContact[]> => {
  try {
    const hasPermission = await requestContactsPermission();
    if (!hasPermission) return [];

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
      ],
    });

    return data
      .filter(contact => contact.name)
      .map(contact => ({
        id: contact.id,
        name: contact.name || 'Unknown',
        phoneNumbers: contact.phoneNumbers?.map(p => p.number || '') || [],
        emails: contact.emails?.map(e => e.email || '') || [],
      }));
  } catch {
    Alert.alert('Error', 'Failed to fetch contacts');
    return [];
  }
};

export const normalizePhoneNumber = (phone: string): string => {
  let normalized = phone.replace(/\D/g, '');
  if (normalized.length > 10) normalized = normalized.slice(-10);
  return normalized;
};

export const matchContactsWithUsers = (
  phoneContacts: PhoneContact[],
  appUsers: any[]
): any[] => {
  const matchedUsers: any[] = [];
  const userPhoneMap = new Map<string, any>();
  const userEmailMap = new Map<string, any>();

  appUsers.forEach(user => {
    if (user.email) userEmailMap.set(user.email.toLowerCase(), user);
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
        matchedUsers.push({ ...matchedUser, contactName: contact.name, isContact: true });
        break;
      }
    }

    for (const email of contact.emails) {
      const matchedUser = userEmailMap.get(email.toLowerCase());
      if (matchedUser && !matchedUsers.find(u => u._id === matchedUser._id)) {
        matchedUsers.push({ ...matchedUser, contactName: contact.name, isContact: true });
        break;
      }
    }
  });

  return matchedUsers;
};

export const fetchContactsFromAPI = async (token: string, retries = 2): Promise<any[]> => {
  if (isLoadingContacts) {
    console.log('[ContactsService] Already loading contacts, returning cached');
    const cached = await getCachedContacts();
    return cached || [];
  }

  isLoadingContacts = true;

  try {
    const cached = await getCachedContacts();
    console.log('[ContactsService] Cached contacts:', cached?.length || 0);

    // ✅ Warm up server before API call
    await warmUpServer();

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { getApiUrl } = await import("@/constants");
        const API_URL = await getApiUrl();
        const url = `${API_URL}/user/contacts`;
        console.log('[ContactsService] Fetching from:', url, 'Attempt:', attempt);

        const controller = new AbortController();
        // ✅ 45s timeout — enough for Render cold start
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log('[ContactsService] Response status:', response.status);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (data.success && data.data) {
          await cacheContacts(data.data);
          isLoadingContacts = false;
          console.log('[ContactsService] Got', data.data.length, 'contacts');
          return data.data;
        }

        isLoadingContacts = false;
        return cached || data.data || [];

      } catch (error: any) {
        console.log('[ContactsService] Attempt', attempt, 'failed:', error.message);

        if (attempt === retries) {
          isLoadingContacts = false;
          console.log('[ContactsService] All attempts failed, returning cached');
          return cached || [];
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
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

export const fetchConversationsFromAPI = async (token: string): Promise<any[]> => {
  if (isLoadingConversations) {
    console.log('[ContactsService] Already loading conversations, returning cached');
    const cached = await getCachedConversations();
    return cached || [];
  }

  isLoadingConversations = true;

  try {
    const cached = await getCachedConversations();
    console.log('[ContactsService] Cached conversations:', cached?.length || 0);

    // ✅ Warm up server before API call
    await warmUpServer();

    try {
      const { getApiUrl } = await import("@/constants");
      const API_URL = await getApiUrl();
      console.log('[ContactsService] Fetching conversations from:', API_URL);

      const controller = new AbortController();
      // ✅ 45s timeout — enough for Render cold start
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(`${API_URL}/user/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('[ContactsService] Conversations response:', response.status);

      const data = await response.json();

      if (data.success && data.data) {
        await cacheConversations(data.data);
        isLoadingConversations = false;
        console.log('[ContactsService] Got', data.data.length, 'conversations');
        return data.data;
      }

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

export const forceRefreshContacts = async (token: string): Promise<any[]> => {
  isLoadingContacts = false;
  serverWarmedUp = false; // Force re-warm on manual refresh
  return fetchContactsFromAPI(token, 3);
};

export const forceRefreshConversations = async (token: string): Promise<any[]> => {
  isLoadingConversations = false;
  return fetchConversationsFromAPI(token);
};