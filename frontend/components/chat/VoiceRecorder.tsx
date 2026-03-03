import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet,
  Pressable, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { audioService } from '@/services/audioService';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';

interface Props {
  onVoiceSend: (uri: string, duration: number) => void;
  onCancel: () => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
}

export function VoiceRecorder({ onVoiceSend, onCancel, isRecording, onRecordingChange }: Props) {
  const [isCancelled, setIsCancelled] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await audioService.startRecording();
      onRecordingChange(true);
      setIsCancelled(false);
      setRecordingSecs(0);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { 
            toValue: 1.3, 
            duration: 600, 
            useNativeDriver: true 
          }),
          Animated.timing(scaleAnim, { 
            toValue: 1, 
            duration: 600, 
            useNativeDriver: true 
          }),
        ])
      ).start();

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingSecs(s => s + 1);
      }, 1000);
    } catch (err) {
      console.error('[VoiceRecorder] Start recording error:', err);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    scaleAnim.stopAnimation();
    Animated.spring(scaleAnim, { 
      toValue: 1, 
      useNativeDriver: true 
    }).start();
    
    onRecordingChange(false);

    if (isCancelled) {
      await audioService.cancelRecording();
      onCancel();
      return;
    }

    try {
      const { uri, duration } = await audioService.stopRecording();
      if (duration < 1) {
        await audioService.cancelRecording();
        return;
      }
      onVoiceSend(uri, duration);
    } catch (err) {
      console.error('[VoiceRecorder] Stop recording error:', err);
    }
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.recordingBar}>
          <View style={styles.redDot} />
          <Text style={styles.timer}>{formatTime(recordingSecs)}</Text>
          <Text style={styles.slideHint}>← Slide to cancel</Text>
        </View>
      )}

      <Pressable
        onPressIn={startRecording}
        onPress={stopRecording}
        delayLongPress={0}
      >
        <Animated.View style={[
          styles.micButton,
          isRecording && styles.micButtonActive,
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <Ionicons
            name={isRecording ? 'stop' : 'mic-outline'}
            size={28}
            color={isRecording ? '#fff' : colors.primary}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  recordingBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3f3',
    borderRadius: radius._20,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._8,
    marginRight: spacingX._8,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: spacingX._8,
  },
  timer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginRight: spacingX._8,
  },
  slideHint: {
    fontSize: 13,
    color: colors.neutral500
  },
  micButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: '#FF3B30',
  },
});
