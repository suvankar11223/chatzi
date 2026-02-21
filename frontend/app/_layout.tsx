import React, { useEffect } from 'react'
import { Stack, useRouter, usePathname } from 'expo-router'
import { AuthProvider } from '@/context/authContext'
import { CallProvider } from '@/context/callContext'
import CallModal from '@/components/call/CallModal'
import AsyncStorage from '@react-native-async-storage/async-storage'

const InitialLayout = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        // Only navigate if we're at the root path
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

  return <Stack screenOptions={{ headerShown: false }} />;
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <CallProvider>
        <InitialLayout />
        <CallModal />
      </CallProvider>
    </AuthProvider>
  )
}

export default RootLayout
