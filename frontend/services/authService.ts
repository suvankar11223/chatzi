import { getApiUrl } from "@/constants";
import axios, { AxiosError, AxiosInstance } from "axios";

let apiClient: AxiosInstance | null = null;

/**
 * Get or create the API client with dynamic URL
 */
const getApiClient = async (): Promise<AxiosInstance> => {
  if (apiClient) {
    return apiClient;
  }
  
  const API_URL = await getApiUrl();
  
  apiClient = axios.create({
    baseURL: API_URL,
    timeout: 15000, // 15 second timeout
  });
  
  return apiClient;
};

export const login = async (email: string, password: string) => {
  try {
    const api = await getApiClient();
    const API_URL = await getApiUrl();
    console.log("[DEBUG authService] Login request to:", `${API_URL}/auth/login`);
    
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    const axiosError = error as AxiosError;
    
    // Check if it's a network error
    if (axiosError.message === 'Network Error' || axiosError.code === 'ERR_NETWORK') {
      const API_URL = await getApiUrl();
      
      // Check if using ngrok
      if (API_URL.includes('ngrok')) {
        throw new Error(`ngrok Connection Issue\n\n⚠️ IMPORTANT: ngrok free plan shows a warning page on first visit.\n\n✓ Open this URL in your phone's browser FIRST:\n${API_URL.replace('/api', '')}\n\n✓ Click "Visit Site" on the ngrok warning page\n\n✓ Then come back to the app and try again\n\nThis only needs to be done once per session.`);
      }
      
      const baseUrl = API_URL.replace('/api', '');
      throw new Error(`Cannot connect to server at ${API_URL}.\n\n✓ Backend is running on your computer\n✓ Make sure your phone and computer are on the SAME WiFi network\n✓ Try opening ${baseUrl} in your phone's browser\n\nIf browser works but app doesn't, restart Expo Go app.`);
    }
    
    // Check for other axios errors
    if (axiosError.response) {
      const errorData = axiosError.response.data as any;
      throw new Error(errorData.msg || 'Login failed');
    }
    
    throw error;
  }
};

export const register = async (email: string, password: string, name: string, avatar?: string) => {
  try {
    const api = await getApiClient();
    const API_URL = await getApiUrl();
    console.log("[DEBUG authService] Register request to:", `${API_URL}/auth/register`);
    console.log("[DEBUG authService] Register payload:", { email, name, avatar });
    
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
      avatar,
    });
    return response.data;
  } catch (error: any) {
    const axiosError = error as AxiosError;
    
    // Check if it's a network error
    if (axiosError.message === 'Network Error' || axiosError.code === 'ERR_NETWORK') {
      const API_URL = await getApiUrl();
      
      // Check if using ngrok
      if (API_URL.includes('ngrok')) {
        throw new Error(`ngrok Connection Issue\n\n⚠️ IMPORTANT: ngrok free plan shows a warning page on first visit.\n\n✓ Open this URL in your phone's browser FIRST:\n${API_URL.replace('/api', '')}\n\n✓ Click "Visit Site" on the ngrok warning page\n\n✓ Then come back to the app and try again\n\nThis only needs to be done once per session.`);
      }
      
      const baseUrl = API_URL.replace('/api', '');
      throw new Error(`Cannot connect to server at ${API_URL}.\n\n✓ Backend is running on your computer\n✓ Make sure your phone and computer are on the SAME WiFi network\n✓ Try opening ${baseUrl} in your phone's browser\n\nIf browser works but app doesn't, restart Expo Go app.`);
    }
    
    // Check for other axios errors
    if (axiosError.response) {
      const errorData = axiosError.response.data as any;
      throw new Error(errorData.msg || 'Registration failed');
    }
    
    throw error;
  }
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const API_URL = await getApiUrl();
    console.log("[DEBUG authService] Testing connection to:", API_URL);
    const response = await axios.get(`${API_URL.replace('/api', '')}/`, { timeout: 5000 });
    console.log("[DEBUG authService] Connection test successful:", response.data);
    return true;
  } catch (error) {
    console.error("[DEBUG authService] Connection test failed:", error);
    return false;
  }
};

// Export getApiUrl for other services to use
export { getApiUrl };
