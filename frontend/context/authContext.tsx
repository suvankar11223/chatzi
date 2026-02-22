import { AuthContextProps, DecodedTokenProps, UserProps } from "@/types";
import { createContext, ReactNode, useState, useEffect, useContext } from "react";
import { useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import * as authService from "@/services/authService";
import { connectSocket, disconnectSocket } from "@/socket/socket";

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  user: null,
  signIn: async (email: string, password: string) => {},
  signUp: async (email: string, password: string, name: string, avatar?: string) => {},
  signOut: async () => {},
  updateToken: async (token: string) => {},
  refreshUser: (userData: UserProps) => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProps | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Load token on app start
  useEffect(() => {
    loadToken();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inMainGroup = segments[0] === '(main)';

    if (!inAuthGroup && !inMainGroup) return;

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (token && inAuthGroup) {
      router.replace('/(main)/home');
    }
  }, [token, segments, isInitialized]);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      
      if (storedToken) {
        const decoded = jwtDecode<DecodedTokenProps>(storedToken);
        
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          await AsyncStorage.removeItem("token");
          setIsInitialized(true);
          return;
        }

        setToken(storedToken);
        
        const storedUserData = await AsyncStorage.getItem("userData");
        let userObj: UserProps;
        
        if (storedUserData) {
          userObj = JSON.parse(storedUserData);
        } else {
          userObj = {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name,
          };
        }
        
        setUser(userObj);
        
        // Try to connect socket (don't block)
        connectSocket().catch(() => {});
      }
    } catch {
      await AsyncStorage.removeItem("token");
    } finally {
      setIsInitialized(true);
    }
  };

  const updateToken = async (token: string) => {
    if (token) {
      setToken(token);
      await AsyncStorage.setItem("token", token);
      const decoded = jwtDecode<DecodedTokenProps>(token);
      
      const userObj: UserProps = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      };
      
      setUser(userObj);
      await AsyncStorage.setItem("userData", JSON.stringify(userObj));
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    if (response.token) {
      await updateToken(response.token);
      
      // Try to connect socket (don't block)
      connectSocket().catch(() => {});
      
      // Prefetch data IMMEDIATELY (no delay) for instant home screen load
      setTimeout(async () => {
        try {
          const { fetchContactsFromAPI, fetchConversationsFromAPI } = await import("@/services/contactsService");
          const { cacheContacts, cacheConversations } = await import("@/utils/network");
          
          const [contacts, conversations] = await Promise.all([
            fetchContactsFromAPI(response.token, 1),
            fetchConversationsFromAPI(response.token)
          ]);
          
          // Cache immediately for instant load on home screen
          if (contacts.length > 0) {
            await cacheContacts(contacts);
          }
          if (conversations.length > 0) {
            await cacheConversations(conversations);
          }
          
          console.log('[Auth] Prefetched', contacts.length, 'contacts and', conversations.length, 'conversations');
        } catch (error) {
          console.log('[Auth] Prefetch error:', error);
        }
      }, 500);
      
      router.replace("/(main)/home");
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    avatar?: string
  ) => {
    const response = await authService.register(email, password, name, avatar || "");
    if (response.token) {
      await updateToken(response.token);
      
      // Try to connect socket (don't block)
      connectSocket().catch(() => {});
      
      // Prefetch data IMMEDIATELY (no delay) for instant home screen load
      setTimeout(async () => {
        try {
          const { fetchContactsFromAPI, fetchConversationsFromAPI } = await import("@/services/contactsService");
          const { cacheContacts, cacheConversations } = await import("@/utils/network");
          
          const [contacts, conversations] = await Promise.all([
            fetchContactsFromAPI(response.token, 1),
            fetchConversationsFromAPI(response.token)
          ]);
          
          // Cache immediately for instant load on home screen
          if (contacts.length > 0) {
            await cacheContacts(contacts);
          }
          if (conversations.length > 0) {
            await cacheConversations(conversations);
          }
          
          console.log('[Auth] Prefetched', contacts.length, 'contacts and', conversations.length, 'conversations');
        } catch (error) {
          console.log('[Auth] Prefetch error:', error);
        }
      }, 500);
      
      router.replace("/(main)/home");
    }
  };

  const signOut = async () => {
    disconnectSocket();
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userData");
    router.replace("/(auth)/welcome");
  };

  const refreshUser = (userData: UserProps) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
    AsyncStorage.setItem("userData", JSON.stringify(userData)).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        signIn,
        signUp,
        signOut,
        updateToken,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
