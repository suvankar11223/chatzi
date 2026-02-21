import axios from 'axios';
import { getApiUrl } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ensureStreamUsers = async (userIds: string[]) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const API_URL = await getApiUrl();
    
    console.log('[DEBUG] userService: Ensuring StreamChat users exist for:', userIds);
    
    const response = await axios.post(
      `${API_URL}/user/ensure-stream-users`,
      { userIds },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[DEBUG] userService: ensureStreamUsers response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[DEBUG] userService: ensureStreamUsers error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateProfile = async (name: string, email: string, avatar?: string) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const API_URL = await getApiUrl();
    
    console.log('='.repeat(60));
    console.log('[DEBUG] userService: Starting profile update');
    console.log('[DEBUG] userService: Token exists:', !!token);
    console.log('[DEBUG] userService: Token (first 20 chars):', token?.substring(0, 20) + '...');
    console.log('[DEBUG] userService: Update data:', { name, email, avatar });
    console.log('[DEBUG] userService: Avatar provided:', avatar ? 'YES' : 'NO');
    if (avatar) {
      console.log('[DEBUG] userService: Avatar URL:', avatar);
      console.log('[DEBUG] userService: Avatar is Cloudinary URL:', avatar.includes('cloudinary.com'));
    }
    console.log('='.repeat(60));
    
    const response = await axios.put(
      `${API_URL}/user/profile`,
      { name, email, avatar },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('='.repeat(60));
    console.log('[DEBUG] userService: Update successful');
    console.log('[DEBUG] userService: Response:', response.data);
    console.log('[DEBUG] userService: Updated user ID:', response.data.data?.id);
    console.log('[DEBUG] userService: Updated user name:', response.data.data?.name);
    console.log('[DEBUG] userService: Updated user email:', response.data.data?.email);
    console.log('[DEBUG] userService: Updated user avatar:', response.data.data?.avatar || 'null');
    console.log('='.repeat(60));
    
    return response.data;
  } catch (error: any) {
    console.error('='.repeat(60));
    console.error('[DEBUG] userService: Update error');
    console.error('[DEBUG] userService: Error status:', error.response?.status);
    console.error('[DEBUG] userService: Error data:', error.response?.data);
    console.error('[DEBUG] userService: Error message:', error.message);
    console.error('='.repeat(60));
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const API_URL = await getApiUrl();
    
    const response = await axios.get(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('[DEBUG] Get profile error:', error.response?.data || error.message);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const API_URL = await getApiUrl();
    
    const response = await axios.get(`${API_URL}/user/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('[DEBUG] Get all users error:', error.response?.data || error.message);
    throw error;
  }
};


export const getMessagesAPI = async (conversationId: string, token: string) => {
  try {
    const API_URL = await getApiUrl();
    console.log('[DEBUG] Fetching messages from API:', `${API_URL}/user/messages/${conversationId}`);
    
    const response = await fetch(`${API_URL}/user/messages/${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('[DEBUG] API messages response:', data);

    if (data.success) {
      console.log('[DEBUG] Fetched', data.data.length, 'messages from API');
      return data.data;
    } else {
      console.error('[DEBUG] Failed to fetch messages:', data.msg);
      return [];
    }
  } catch (error) {
    console.error('[DEBUG] Error fetching messages from API:', error);
    return [];
  }
};
