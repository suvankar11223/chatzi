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
    if (!socket || !user?.id) return;

    const handleIncomingCall = (data: any) => {
      console.log('[IncomingCall] Received:', data);
      router.push({
        pathname: '/(main)/incomingCall' as any,
        params: {
          callId: String(data.callId),
          callerId: String(data.callerId),
          callerName: String(data.callerName),
          callerAvatar: String(data.callerAvatar || ''),
          callType: String(data.callType),
          channelName: String(data.channelName),
          conversationId: String(data.conversationId),
        },
      });
    };

    socket.on('incomingCall', handleIncomingCall);
    return () => { socket.off('incomingCall', handleIncomingCall); };
  }, [user?.id]);

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