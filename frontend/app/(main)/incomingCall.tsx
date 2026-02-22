import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSocket } from '@/socket/socket';
import Avatar from '@/components/Avatar';
import { MaterialIcons } from '@expo/vector-icons';

export default function IncomingCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const callId = String(params.callId || '');
  const callerId = String(params.callerId || '');
  const callerName = String(params.callerName || 'Unknown');
  const callerAvatar = String(params.callerAvatar || '');
  const callType = String(params.callType || 'video') as 'voice' | 'video';
  const roomId = String(params.roomId || '');

  useEffect(() => {
    Vibration.vibrate([500, 500, 500], true);
    return () => Vibration.cancel();
  }, []);

  const handleAnswer = () => {
    Vibration.cancel();
    getSocket()?.emit('answerCall', { callId, callerId });

    router.replace({
      pathname: '/callScreen',
      params: {
        callId,
        roomId,
        callType,
        name: callerName,
        avatar: callerAvatar,
        otherUserId: callerId,
        conversationId: String(params.conversationId || ''),
        isCaller: 'false',
      },
    });
  };

  const handleDecline = () => {
    Vibration.cancel();
    getSocket()?.emit('declineCall', { callId, callerId });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.callType}>
        Incoming {callType === 'video' ? '📹 Video' : '📞 Voice'} Call
      </Text>

      <Avatar size={120} uri={callerAvatar} />
      <Text style={styles.name}>{callerName}</Text>
      <Text style={styles.subtitle}>is calling you...</Text>

      <View style={styles.buttons}>
        <View style={styles.btnWrapper}>
          <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
            <MaterialIcons name="call-end" size={36} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.btnLabel}>Decline</Text>
        </View>

        <View style={styles.btnWrapper}>
          <TouchableOpacity style={styles.answerBtn} onPress={handleAnswer}>
            <MaterialIcons
              name={callType === 'video' ? 'videocam' : 'call'}
              size={36} color="#fff"
            />
          </TouchableOpacity>
          <Text style={styles.btnLabel}>Answer</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#0f0f1a',
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 20,
  },
  callType: { fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 10 },
  name: { fontSize: 32, fontWeight: '700', color: '#fff', marginTop: 16 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.5)' },
  buttons: { flexDirection: 'row', gap: 60, marginTop: 60 },
  btnWrapper: { alignItems: 'center', gap: 12 },
  declineBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center', alignItems: 'center',
  },
  answerBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#22C55E',
    justifyContent: 'center', alignItems: 'center',
  },
  btnLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
