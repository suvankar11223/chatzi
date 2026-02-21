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

  // Handle navigation based on auth state (but not initial load)
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inMainGroup = segments[0] === '(main)';

    // Only redirect if we're actually in a group (not at root)
    if (!inAuthGroup && !inMainGroup) return;

    if (!token && !inAuthGroup) {
      // User is not signed in and not in auth screens, redirect to welcome
      router.replace('/(auth)/welcome');
    } else if (token && inAuthGroup) {
      // User is signed in but still in auth screens, redirect to home
      router.replace('/(main)/home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, segments, isInitialized]);

  const loadToken = async () => {
    try {
      console.log("[DEBUG] AuthContext: Loading stored token...");
      const storedToken = await AsyncStorage.getItem("token");
      
      if (storedToken) {
        console.log("[DEBUG] AuthContext: Token found in storage");
        const decoded = jwtDecode<DecodedTokenProps>(storedToken);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          console.log("[DEBUG] AuthContext: Token has expired");
          await AsyncStorage.removeItem("token");
          setIsInitialized(true);
          return;
        }

        // Token is valid, restore user session
        console.log("[DEBUG] AuthContext: Token is valid, restoring session");
        setToken(storedToken);
        
        // Try to get stored user data with avatar
        const storedUserData = await AsyncStorage.getItem("userData");
        let userObj: UserProps;
        
        if (storedUserData) {
          console.log("[DEBUG] AuthContext: Found stored user data");
          userObj = JSON.parse(storedUserData);
        } else {
          // Fallback to token data
          userObj = {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name,
          };
        }
        
        setUser(userObj);
        console.log("[DEBUG] AuthContext: User restored:", userObj);
        
        // Connect socket immediately after restoring session
        try {
          console.log("[DEBUG] AuthContext: Connecting socket after token restore...");
          await connectSocket();
          console.log("[DEBUG] AuthContext: Socket connected successfully");
        } catch (error) {
          console.error("[DEBUG] AuthContext: Socket connection failed:", error);
        }
      } else {
        console.log("[DEBUG] AuthContext: No token found in storage");
      }
    } catch (error) {
      console.log("[DEBUG] AuthContext: Failed to decode token:", error);
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
      console.log("[DEBUG] AuthContext: Decoded token:", decoded);
      
      // Map decoded token to user object
      const userObj: UserProps = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      };
      
      setUser(userObj);
      await AsyncStorage.setItem("userData", JSON.stringify(userObj));
      console.log("[DEBUG] AuthContext: User set:", userObj);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("[DEBUG] AuthContext: signIn called", { email });
    const response = await authService.login(email, password);
    console.log("[DEBUG] AuthContext: Login response", response);
    if (response.token) {
      await updateToken(response.token);
      
      // Wait for socket to connect before navigating
      try {
        console.log("[DEBUG] AuthContext: Waiting for socket connection...");
        await connectSocket();
        console.log("[DEBUG] AuthContext: Socket connected, navigating to home");
      } catch (error) {
        console.error("[DEBUG] AuthContext: Socket connection failed, but continuing:", error);
      }
      
      console.log("[DEBUG] AuthContext: Redirecting to home");
      router.replace("/(main)/home");
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    avatar?: string
  ) => {
    console.log("[DEBUG] AuthContext: signUp called", { email, name });
    const response = await authService.register(email, password, name, avatar || "");
    console.log("[DEBUG] AuthContext: Register response", response);
    if (response.token) {
      await updateToken(response.token);
      
      // Wait for socket to connect before navigating
      try {
        console.log("[DEBUG] AuthContext: Waiting for socket connection...");
        await connectSocket();
        console.log("[DEBUG] AuthContext: Socket connected, navigating to home");
      } catch (error) {
        console.error("[DEBUG] AuthContext: Socket connection failed, but continuing:", error);
      }
      
      console.log("[DEBUG] AuthContext: Redirecting to home");
      router.replace("/(main)/home");
    }
  };

  const signOut = async () => {
    console.log("[DEBUG] AuthContext: Signing out");
    
    // Disconnect socket first
    disconnectSocket();
    
    // Clear auth state
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userData");
    
    router.replace("/(auth)/welcome");
  };

  const refreshUser = (userData: UserProps) => {
    console.log("[DEBUG] AuthContext: Refreshing user data", userData);
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
    
    // Persist updated user data to AsyncStorage
    AsyncStorage.setItem("userData", JSON.stringify(userData)).catch((error) => {
      console.error("[DEBUG] AuthContext: Failed to save user data:", error);
    });
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
