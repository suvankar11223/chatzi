import React, { useEffect } from 'react'
import { Stack, useRouter, usePathname } from 'expo-router'
import { AuthProvider, useAuth } from '@/context/authContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getSocket } from '@/socket/socket'

const InitialLayout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        if (pathname === '/') {
          const token = await AsyncStorage.getItem('token');
          if (token) {
            router.replace('/(main)/home');
          } else {
            router.replace('/(auth)/welcome');
          }
        }
      } catch (error) {
        console.error('Error checking initial route:', error);
        if (pathname === '/') {
          router.replace('/(auth)/welcome');
        }
      }
    };

    checkInitialRoute();
  }, [pathname, router]);

  useEffect(() => {
    const socket = getSocket();
    console.log('[_layout] Socket exists:', !!socket);
    console.log('[_layout] User ID:', user?.id);
    
    if (!socket || !user?.id) {
      console.log('[_layout] Not setting up incoming call listener - missing socket or user');
      return;
    }

    console.log('[_layout] Setting up incoming call listener for user:', user.id);

    const handleIncomingCall = (data: any) => {
      console.log('[IncomingCall] ✅ Received event:', data);
      console.log('[IncomingCall] Navigating to /incomingCall');
      
      router.push({
        pathname: '/incomingCall',
        params: {
          callId: String(data.callId),
          callerId: String(data.callerId),
          callerName: String(data.callerName),
          callerAvatar: String(data.callerAvatar || ''),
          callType: String(data.callType),
          roomId: String(data.roomId),
          conversationId: String(data.conversationId),
        },
      });
    };

    socket.on('incomingCall', handleIncomingCall);
    console.log('[_layout] ✅ Incoming call listener registered');
    
    return () => { 
      console.log('[_layout] Removing incoming call listener');
      socket.off('incomingCall', handleIncomingCall); 
    };
  }, [user?.id, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
};

export default RootLayout;
