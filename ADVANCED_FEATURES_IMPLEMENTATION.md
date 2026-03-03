# 🎯 Advanced Chat Features Implementation Guide

## Overview

This guide covers the implementation of three advanced chat features:
1. 🎙️ **Voice Messages** - Record and send audio messages
2. 📌 **Pinned Messages** - Pin important messages to the top
3. 😂 **Emoji Reactions** - React to messages with emojis

---

## ✅ Backend Setup (COMPLETED)

### Dependencies Installed
```bash
npm install multer cloudinary @types/multer
```

### Files Created/Modified

1. **`backend/routes/upload.routes.ts`** ✅
   - Voice message upload endpoint
   - Cloudinary integration
   - File validation

2. **`backend/modals/Message.ts`** ✅
   - Added `type` field ('text' | 'image' | 'voice')
   - Added `audioUrl` and `audioDuration` fields
   - Added `isPinned`, `pinnedAt`, `pinnedBy` fields
   - Added `reactions` array with emoji and users

3. **`backend/socket/chatEvents.ts`** ✅
   - `voice:send` - Send voice message
   - `voice:received` - Receive voice message
   - `message:pin` - Pin a message
   - `message:unpin` - Unpin a message
   - `reaction:add` - Add/remove reaction
   - `reaction:updated` - Reaction update notification
   - `getPinnedMessages` - Fetch pinned messages

4. **`backend/index.ts`** ✅
   - Added upload routes

### Environment Variables Required

Add to `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## 📱 Frontend Setup (IN PROGRESS)

### Dependencies Installed
```bash
npm install expo-av expo-file-system
```

### Files Created

1. **`frontend/services/audioService.ts`** ✅
   - Audio recording
   - Audio playback
   - Voice message upload

---

## 🎙️ Feature 1: Voice Messages

### How It Works

1. User **long-presses** the microphone button
2. Recording starts with visual feedback
3. User **releases** to send or **slides left** to cancel
4. Audio uploads to Cloudinary
5. Voice message appears in chat with play button
6. Recipients can play/pause the audio

### Components to Create

#### 1. VoiceRecorder Component

Create `frontend/components/chat/VoiceRecorder.tsx`:

```typescript
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet,
  Pressable, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { audioService } from '../../services/audioService';

interface Props {
  onVoiceSend: (uri: string, duration: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onVoiceSend, onCancel }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await audioService.startRecording();
      setIsRecording(true);
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
      console.error('Start recording error:', err);
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
    
    setIsRecording(false);

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
      console.error('Stop recording error:', err);
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
        onPressOut={stopRecording}
        delayLongPress={0}
      >
        <Animated.View style={[
          styles.micButton,
          isRecording && styles.micButtonActive,
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <Ionicons
            name={isRecording ? 'mic' : 'mic-outline'}
            size={28}
            color={isRecording ? '#fff' : '#007AFF'}
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
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  timer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginRight: 8,
  },
  slideHint: {
    fontSize: 13,
    color: '#999'
  },
  micButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: '#FF3B30',
  },
});
```

#### 2. VoiceMessageBubble Component

Create `frontend/components/chat/VoiceMessageBubble.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioService } from '../../services/audioService';

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
          color={isMine ? '#fff' : '#007AFF'}
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: 240,
  },
  mine: { backgroundColor: '#007AFF' },
  theirs: { backgroundColor: '#E8E8E8' },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
  waveFillTheirs: { backgroundColor: '#007AFF' },
  duration: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  durationMine: { color: 'rgba(255,255,255,0.8)' },
});
```

### Integration in Conversation Screen

Add to `frontend/app/(main)/Conversation.tsx`:

```typescript
import { VoiceRecorder } from '@/components/chat/VoiceRecorder';
import { VoiceMessageBubble } from '@/components/chat/VoiceMessageBubble';
import { audioService } from '@/services/audioService';
import { SERVER_IP, SERVER_PORT } from '@/utils/network';

// In your component:
const handleVoiceSend = async (uri: string, duration: number) => {
  try {
    setLoading(true);
    
    const apiBaseUrl = `http://${SERVER_IP}:${SERVER_PORT}`;
    const { audioUrl } = await audioService.uploadVoice(uri, duration, apiBaseUrl);
    
    const socket = getSocket();
    socket.emit('voice:send', {
      conversationId,
      senderId: currentUser?.id,
      audioUrl,
      duration,
    });
    
    setLoading(false);
  } catch (error) {
    console.error('Voice send error:', error);
    Alert.alert('Error', 'Failed to send voice message');
    setLoading(false);
  }
};

// In your message rendering:
const renderMessage = ({ item }: { item: MessageType }) => {
  if (item.type === 'voice') {
    return (
      <VoiceMessageBubble
        audioUrl={item.audioUrl!}
        duration={item.audioDuration!}
        isMine={item.isMe}
      />
    );
  }
  
  // ... existing text/image rendering
};

// In your input area:
<View style={styles.footer}>
  <VoiceRecorder
    onVoiceSend={handleVoiceSend}
    onCancel={() => console.log('Cancelled')}
  />
  {/* ... existing input */}
</View>
```

---

## 📌 Feature 2: Pinned Messages

### How It Works

1. User **long-presses** a message
2. Menu appears with "Pin Message" option
3. Message is pinned and appears in banner at top
4. Banner shows up to 3 pinned messages
5. Tap banner to jump to message
6. Admin can unpin messages

### Components to Create

#### PinnedMessageBanner Component

Create `frontend/components/chat/PinnedMessageBanner.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface PinnedMessage {
  _id: string;
  content: string;
  type: 'text' | 'voice' | 'image';
  sender: { name: string };
}

interface Props {
  pinnedMessages: PinnedMessage[];
  onJumpToMessage: (messageId: string) => void;
  onUnpin: (messageId: string) => void;
  isAdmin: boolean;
}

export function PinnedMessageBanner({
  pinnedMessages,
  onJumpToMessage,
  onUnpin,
  isAdmin,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!pinnedMessages.length) return null;

  const current = pinnedMessages[currentIndex];

  const cycleNext = () => {
    setCurrentIndex((i) => (i + 1) % pinnedMessages.length);
  };

  const getPreview = (msg: PinnedMessage) => {
    if (msg.type === 'voice') return '🎙 Voice message';
    if (msg.type === 'image') return '📷 Photo';
    return msg.content?.slice(0, 50) || '';
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        onJumpToMessage(current._id);
        cycleNext();
      }}
    >
      <View style={styles.accent} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Ionicons name="pin" size={14} color={colors.primary} />
          <Text style={styles.label}>
            Pinned Message {pinnedMessages.length > 1 ? `${currentIndex + 1}/${pinnedMessages.length}` : ''}
          </Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {getPreview(current)}
        </Text>
      </View>

      <View style={styles.actions}>
        {pinnedMessages.length > 1 && (
          <Pressable onPress={cycleNext} style={styles.actionBtn}>
            <Ionicons name="chevron-up" size={18} color={colors.primary} />
          </Pressable>
        )}
        {isAdmin && (
          <Pressable
            onPress={() => onUnpin(current._id)}
            style={styles.actionBtn}
          >
            <Ionicons name="close" size={18} color="#999" />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  accent: {
    width: 3,
    height: 36,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginRight: 10,
  },
  content: { flex: 1 },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 2 
  },
  label: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4
  },
  preview: { 
    fontSize: 13, 
    color: '#333' 
  },
  actions: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  actionBtn: { padding: 6 },
});
```

### Integration

```typescript
// In Conversation.tsx
const [pinnedMessages, setPinnedMessages] = useState([]);

// Socket listeners
useEffect(() => {
  const socket = getSocket();
  
  socket.on('message:pinned', ({ message }) => {
    setPinnedMessages(prev => [message, ...prev].slice(0, 3));
  });
  
  socket.on('message:unpinned', ({ messageId }) => {
    setPinnedMessages(prev => prev.filter(m => m._id !== messageId));
  });
  
  // Fetch pinned messages on mount
  socket.emit('getPinnedMessages', { conversationId });
  
  socket.on('pinnedMessages', ({ data }) => {
    setPinnedMessages(data);
  });
  
  return () => {
    socket.off('message:pinned');
    socket.off('message:unpinned');
    socket.off('pinnedMessages');
  };
}, [conversationId]);

// In JSX
<PinnedMessageBanner
  pinnedMessages={pinnedMessages}
  onJumpToMessage={(id) => {
    // Scroll to message
  }}
  onUnpin={(id) => {
    const socket = getSocket();
    socket.emit('message:unpin', {
      messageId: id,
      conversationId
    });
  }}
  isAdmin={true}
/>
```

---

## 😂 Feature 3: Emoji Reactions

### How It Works

1. User **long-presses** a message
2. Emoji picker appears above message
3. User taps an emoji to react
4. Reaction appears below message
5. Tap reaction again to remove it
6. Shows count and who reacted

### Components to Create

#### 1. EmojiReactionPicker Component

Create `frontend/components/chat/EmojiReactionPicker.tsx`:

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '🙏', '👍'];

interface Props {
  visible: boolean;
  position: { x: number; y: number };
  onReact: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiReactionPicker({ visible, position, onReact, onClose }: Props) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 150 });
    } else {
      scale.value = withTiming(0, { duration: 100 });
      opacity.value = withTiming(0, { duration: 100 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[
          styles.picker,
          animStyle,
          { 
            top: position.y - 60, 
            left: Math.max(20, position.x - 140) 
          }
        ]}>
          {QUICK_EMOJIS.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => {
                onReact(emoji);
                onClose();
              }}
              style={({ pressed }) => [
                styles.emojiBtn,
                pressed && styles.emojiBtnPressed
              ]}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  picker: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    gap: 4,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiBtnPressed: {
    backgroundColor: '#F0F0F0',
    transform: [{ scale: 1.3 }],
  },
  emoji: { fontSize: 26 },
});
```

#### 2. ReactionBubble Component

Create `frontend/components/chat/ReactionBubble.tsx`:

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Props {
  reactions: Reaction[];
  currentUserId: string;
  onReact: (emoji: string) => void;
}

export function ReactionBubble({ reactions, currentUserId, onReact }: Props) {
  if (!reactions?.length) return null;

  return (
    <View style={styles.container}>
      {reactions.map((reaction) => {
        const iReacted = reaction.users.includes(currentUserId);
        return (
          <Pressable
            key={reaction.emoji}
            style={[styles.pill, iReacted && styles.pillActive]}
            onPress={() => onReact(reaction.emoji)}
          >
            <Text style={styles.emojiText}>{reaction.emoji}</Text>
            {reaction.count > 1 && (
              <Text style={[styles.count, iReacted && styles.countActive]}>
                {reaction.count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
    marginLeft: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: '#E8F0FE',
    borderColor: colors.primary,
  },
  emojiText: { fontSize: 14 },
  count: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginLeft: 3
  },
  countActive: { color: colors.primary },
});
```

### Integration

```typescript
// In Conversation.tsx
const [reactionPicker, setReactionPicker] = useState({
  visible: false,
  messageId: '',
  position: { x: 0, y: 0 }
});

// Socket listener
socket.on('reaction:updated', ({ messageId, reactions }) => {
  setMessages(prev => prev.map(m =>
    m.id === messageId ? { ...m, reactions } : m
  ));
});

// In message rendering
<Pressable
  onLongPress={(e) => {
    setReactionPicker({
      visible: true,
      messageId: message.id,
      position: {
        x: e.nativeEvent.pageX,
        y: e.nativeEvent.pageY
      },
    });
  }}
>
  {/* Message content */}
  
  <ReactionBubble
    reactions={message.reactions || []}
    currentUserId={currentUser?.id || ''}
    onReact={(emoji) => {
      const socket = getSocket();
      socket.emit('reaction:add', {
        messageId: message.id,
        emoji,
        conversationId,
        userId: currentUser?.id,
      });
    }}
  />
</Pressable>

<EmojiReactionPicker
  visible={reactionPicker.visible}
  position={reactionPicker.position}
  onReact={(emoji) => {
    const socket = getSocket();
    socket.emit('reaction:add', {
      messageId: reactionPicker.messageId,
      emoji,
      conversationId,
      userId: currentUser?.id,
    });
  }}
  onClose={() => setReactionPicker(p => ({ ...p, visible: false }))}
/>
```

---

## 🧪 Testing Guide

### Test Voice Messages
1. Open a conversation
2. Long-press microphone button
3. Speak for a few seconds
4. Release to send
5. Verify voice message appears
6. Tap play button to listen
7. Test pause/resume

### Test Pinned Messages
1. Long-press a message
2. Select "Pin Message"
3. Verify banner appears at top
4. Send more messages
5. Verify banner stays at top
6. Tap banner to jump to message
7. Test unpinning

### Test Reactions
1. Long-press a message
2. Emoji picker appears
3. Tap an emoji
4. Verify reaction appears below message
5. Tap reaction again to remove
6. Test multiple reactions
7. Test reaction counts

---

## 📝 Next Steps

1. **Create the frontend components** listed above
2. **Update MessageItem component** to handle voice messages
3. **Add long-press menu** for pin/unpin options
4. **Test each feature** thoroughly
5. **Add error handling** for edge cases
6. **Optimize performance** for large message lists

---

## 🎉 Summary

✅ Backend fully implemented
✅ Audio service created
✅ Socket events configured
⏳ Frontend components ready to implement
⏳ Integration with Conversation screen needed

**You're 60% done!** Just need to create the UI components and wire them up.

Let me know which feature you want to implement first, or if you want me to create all the components now! 🚀
