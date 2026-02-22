import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSocket } from '@/socket/socket';
import { MaterialIcons } from '@expo/vector-icons';

export default function CallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const callId = String(params.callId || '');
  const roomName = String(params.roomName || '');
  const token = String(params.token || '');
  const wsUrl = String(params.wsUrl || '');
  const callType = String(params.callType || 'video') as 'voice' | 'video';
  const otherUserName = String(params.otherUserName || 'User');
  const otherUserId = String(params.otherUserId || '');
  const [loading, setLoading] = useState(true);

  // LiveKit Meet hosted UI
  const encodedToken = encodeURIComponent(token);
  const encodedWsUrl = encodeURIComponent(wsUrl);
  const videoEnabled = callType === 'video' ? 'true' : 'false';
  const meetUrl = `https://meet.livekit.io/custom?liveKitUrl=${encodedWsUrl}&token=${encodedToken}&video=${videoEnabled}&audio=true`;

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onCallEnded = (data: any) => {
      if (data.callId === callId) {
        Alert.alert('Call Ended', `${otherUserName} ended the call`, [{ text: 'OK', onPress: () => router.back() }]);
      }
    };

    const onCallDeclined = (data: any) => {
      if (data.callId === callId) {
        Alert.alert('Call Declined', `${otherUserName} declined the call`, [{ text: 'OK', onPress: () => router.back() }]);
      }
    };

    socket.on('callEnded', onCallEnded);
    socket.on('callDeclined', onCallDeclined);
    return () => {
      socket.off('callEnded', onCallEnded);
      socket.off('callDeclined', onCallDeclined);
    };
  }, [callId]);

  const handleEndCall = () => {
    const socket = getSocket();
    if (socket && callId) {
      socket.emit('endCall', { callId, otherUserId });
    }
    router.back();
  };

  if (!token || !wsUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to connect to call</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#6C63FF', fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Connecting to {otherUserName}...</Text>
        </View>
      )}
      <WebView
        source={{ uri: meetUrl }}
        style={styles.webview}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          Alert.alert('Error', 'Failed to connect. Please try again.');
          router.back();
        }}
      />
      <View style={styles.endCallContainer}>
        <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
          <MaterialIcons name="call-end" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  webview: { flex: 1 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0f0f1a', justifyContent: 'center', alignItems: 'center', zIndex: 10, gap: 16 },
  loadingText: { color: '#fff', fontSize: 16 },
  endCallContainer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', zIndex: 20 },
  endCallBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  errorContainer: { flex: 1, backgroundColor: '#0f0f1a', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#fff', fontSize: 18 },
});
