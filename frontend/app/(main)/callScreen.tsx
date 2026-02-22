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

    // Build URL pointing to the HTML page served by your backend
    const url = `${serverUrl}/call.html?roomId=${encodeURIComponent(roomId)}&userId=${encodeURIComponent(userId || '')}&isCaller=${isCaller}&callType=${callType}&serverUrl=${encodeURIComponent(serverUrl)}&token=${encodeURIComponent(token || '')}&name=${encodeURIComponent(name)}&conversationId=${encodeURIComponent(conversationId)}`;
    
    console.log('[CallScreen] Call URL built');
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

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'endCall' || data.type === 'callEnded') {
        const socket = getSocket();
        if (socket && callId) {
          socket.emit('endCall', { callId, otherUserId });
        }
        router.back();
      }
    } catch (e) {}
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
