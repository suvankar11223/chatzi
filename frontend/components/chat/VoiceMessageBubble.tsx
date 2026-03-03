import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioService } from '@/services/audioService';
import { colors, spacingX, spacingY } from '@/constants/theme';

interface Props {
  audioUrl: string;
  duration: number;
  isMine: boolean;
}

export function VoiceMessageBubble({ audioUrl, duration, isMine }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const togglePlay = async () => {
    if (isPlaying) {
      await audioService.pauseAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await audioService.playAudio(
        audioUrl,
        (pos, dur) => {
          setPosition(pos);
          setTotalDuration(dur);
        },
        () => {
          setIsPlaying(false);
          setPosition(0);
        }
      );
    }
  };

  useEffect(() => {
    return () => {
      audioService.stopAudio();
    };
  }, []);

  const progress = totalDuration > 0 ? position / totalDuration : 0;

  return (
    <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
      <Pressable onPress={togglePlay} style={styles.playButton}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={22}
          color={isMine ? '#fff' : colors.primary}
        />
      </Pressable>

      <View style={styles.waveformContainer}>
        <View style={styles.waveformTrack}>
          <View style={[
            styles.waveformFill,
            { width: `${progress * 100}%` },
            isMine ? styles.waveFillMine : styles.waveFillTheirs,
          ]} />
        </View>
        <Text style={[styles.duration, isMine && styles.durationMine]}>
          {isPlaying ? formatTime(position) : formatTime(totalDuration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._10,
    maxWidth: 240,
  },
  mine: { backgroundColor: colors.primary },
  theirs: { backgroundColor: colors.neutral200 },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacingX._8,
  },
  waveformContainer: { flex: 1 },
  waveformTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  waveformFill: { height: '100%', borderRadius: 2 },
  waveFillMine: { backgroundColor: '#fff' },
  waveFillTheirs: { backgroundColor: colors.primary },
  duration: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  durationMine: { color: 'rgba(255,255,255,0.8)' },
});
