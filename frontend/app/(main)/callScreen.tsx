import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSocket } from '@/socket/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const callId = String(params.callId || '');
  const roomId = String(params.roomId || '');
  const callType = String(params.callType || 'video');
  const name = String(params.name || 'User');
  const otherUserId = String(params.otherUserId || '');
  const isCaller = params.isCaller === 'true';
  
  const [callUrl, setCallUrl] = useState<string | null>(null);

  useEffect(() => {
    buildCallUrl();
  }, []);

  const buildCallUrl = async () => {
    const token = await AsyncStorage.getItem('token');
    const serverUrl = 'https://chatzi-1m0m.onrender.com';
    const userId = await AsyncStorage.getItem('userId');
    const conversationId = String(params.conversationId || '');

    console.log('[CallScreen] ========== BUILD CALL URL ==========');
    console.log('[CallScreen] userId:', userId);
    console.log('[CallScreen] conversationId:', conversationId);
    console.log('[CallScreen] roomId:', roomId);
    console.log('[CallScreen] callType:', callType);

    // Build URL pointing to the HTML page served by your backend
    const url = `${serverUrl}/call.html?roomId=${encodeURIComponent(roomId)}&userId=${encodeURIComponent(userId || '')}&isCaller=${isCaller}&callType=${callType}&serverUrl=${encodeURIComponent(serverUrl)}&token=${encodeURIComponent(token || '')}&name=${encodeURIComponent(name)}&conversationId=${encodeURIComponent(conversationId)}`;
    
    console.log('[CallScreen] Call URL built successfully');
    setCallUrl(url);
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onCallEnded = (data: any) => {
      if (data.callId === callId) {
        Alert.alert('Call Ended', `${name} ended the call`, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    };

    socket.on('callEnded', onCallEnded);
    return () => { socket.off('callEnded', onCallEnded); };
  }, [callId]);

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('[CallScreen] ========== WEBVIEW MESSAGE ==========');
      console.log('[CallScreen] Message type:', data.type);
      console.log('[CallScreen] Message data:', JSON.stringify(data, null, 2));
      
      if (data.type === 'endCall' || data.type === 'callEnded') {
        console.log('[CallScreen] Call ended, handling cleanup');
        
        const socket = getSocket();
        const conversationId = String(params.conversationId || '');
        const userId = await AsyncStorage.getItem('userId');
        
        console.log('[CallScreen] conversationId:', conversationId);
        console.log('[CallScreen] userId (caller):', userId);
        console.log('[CallScreen] roomId:', roomId);
        console.log('[CallScreen] callType:', callType);
        
        // Send endCallRoom from React Native (backup for WebView socket)
        if (socket && conversationId && userId) {
          const callData = {
            conversationId,
            callerId: userId, // Current user's ID
            duration: data.duration || 0,
            callType,
            status: 'completed',
          };
          
          console.log('[CallScreen] Emitting endCallRoom with data:', JSON.stringify(callData, null, 2));
          
          socket.emit('endCallRoom', {
            roomId,
            callData,
          });
          
          console.log('[CallScreen] ✅ endCallRoom emitted');
        } else {
          console.error('[CallScreen] ❌ Cannot emit endCallRoom');
          console.error('[CallScreen] socket:', !!socket);
          console.error('[CallScreen] conversationId:', conversationId);
          console.error('[CallScreen] userId:', userId);
        }
        
        // Also send endCall to the other user
        if (socket && callId) {
          socket.emit('endCall', { callId, otherUserId });
        }
        
        console.log('[CallScreen] Navigating back');
        router.back();
      }
    } catch (error) {
      console.error('[CallScreen] Error handling WebView message:', error);
    }
  };

  if (!callUrl) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <WebView
        source={{ uri: callUrl }}
        style={styles.webview}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        onMessage={handleMessage}
        onError={() => {
          Alert.alert('Error', 'Call failed. Please try again.');
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  webview: { flex: 1 },
});
