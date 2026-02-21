import * as Contacts from 'expo-contacts';
import { Alert } from 'react-native';

export interface PhoneContact {
  id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
}

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
    console.error('[DEBUG] Error requesting contacts permission:', error);
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

    console.log(`[DEBUG] Fetched ${data.length} contacts from device`);

    // Transform contacts to our format
    const phoneContacts: PhoneContact[] = data
      .filter(contact => contact.name) // Only contacts with names
      .map(contact => ({
        id: contact.id,
        name: contact.name || 'Unknown',
        phoneNumbers: contact.phoneNumbers?.map(p => p.number || '') || [],
        emails: contact.emails?.map(e => e.email || '') || [],
      }));

    return phoneContacts;
  } catch (error) {
    console.error('[DEBUG] Error fetching contacts:', error);
    Alert.alert('Error', 'Failed to fetch contacts');
    return [];
  }
};

/**
 * Normalize phone number for comparison
 * Removes spaces, dashes, parentheses, and country codes
 */
export const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');
  
  // Remove country code if present (assuming +1, +91, etc.)
  if (normalized.length > 10) {
    normalized = normalized.slice(-10); // Take last 10 digits
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

  // Create a map of normalized phone numbers and emails from app users
  const userPhoneMap = new Map<string, any>();
  const userEmailMap = new Map<string, any>();

  appUsers.forEach(user => {
    // Map by email
    if (user.email) {
      userEmailMap.set(user.email.toLowerCase(), user);
    }
    
    // Map by phone if available
    if (user.phone) {
      const normalizedPhone = normalizePhoneNumber(user.phone);
      userPhoneMap.set(normalizedPhone, user);
    }
  });

  // Match contacts with app users
  phoneContacts.forEach(contact => {
    // Try to match by phone number
    for (const phoneNumber of contact.phoneNumbers) {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const matchedUser = userPhoneMap.get(normalizedPhone);
      
      if (matchedUser && !matchedUsers.find(u => u._id === matchedUser._id)) {
        matchedUsers.push({
          ...matchedUser,
          contactName: contact.name, // Keep the name from contacts
          isContact: true,
        });
        break;
      }
    }

    // Try to match by email
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

  console.log(`[DEBUG] Matched ${matchedUsers.length} contacts with app users`);
  
  return matchedUsers;
};

/**
 * Fetch contacts (other users) from the backend via REST API
 * Includes retry logic with exponential backoff
 */
export const fetchContactsFromAPI = async (token: string, retries = 3): Promise<any[]> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { getApiUrl } = await import("@/constants");
      const API_URL = await getApiUrl();
      const url = `${API_URL}/user/contacts`;
      
      console.log(`[DEBUG] Fetching contacts from API (attempt ${attempt}/${retries}):`, url);
      console.log('[DEBUG] Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      console.log('[DEBUG] API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[DEBUG] API contacts response:', {
        success: data.success,
        count: data.data?.length || 0,
        names: data.data?.map((u: any) => u.name).join(', ') || 'none'
      });

      if (data.success) {
        console.log('[DEBUG] ✓ Successfully fetched', data.data.length, 'contacts from API');
        return data.data;
      } else {
        console.error('[DEBUG] API returned success=false:', data.msg);
        return [];
      }
    } catch (error: any) {
      console.error(`[DEBUG] ✗ Error fetching contacts (attempt ${attempt}/${retries}):`, error.message || error);
      
      // If this is the last attempt, return empty array
      if (attempt === retries) {
        console.error('[DEBUG] All retry attempts failed');
        return [];
      }
      
      // Wait before retrying (exponential backoff: 1s, 2s, 4s)
      const waitTime = Math.pow(2, attempt - 1) * 1000;
      console.log(`[DEBUG] Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return [];
};
