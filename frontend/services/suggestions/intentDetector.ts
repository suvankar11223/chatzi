import { DetectedIntent, IntentType } from '../../types/suggestions';
import { INTENT_PATTERNS, extractEntities, scoreIntent } from '../../utils/intentPatterns';
import { MessageProps, ConversationProps } from '../../types';

export function detectIntentRuleBased(
  message: MessageProps,
  chatName: string,
  chatId: string
): DetectedIntent | null {
  const text = message.content;
  let bestIntent: { type: IntentType; confidence: number } | null = null;

  for (const pattern of INTENT_PATTERNS) {
    const score = scoreIntent(text, pattern);
    if (score >= pattern.minConfidence) {
      if (!bestIntent || score > bestIntent.confidence) {
        bestIntent = { type: pattern.type, confidence: score };
      }
    }
  }

  if (!bestIntent) return null;

  return {
    type: bestIntent.type,
    confidence: bestIntent.confidence,
    sourceMessageId: message.id,
    sourceChatId: chatId,
    sourceChatName: chatName,
    senderName: message.sender.name,
    originalText: message.content,
    detectedAt: new Date(),
    extractedEntities: extractEntities(message.content),
  };
}

export function detectAllIntents(conversations: ConversationProps[]): DetectedIntent[] {
  const intents: DetectedIntent[] = [];

  for (const conv of conversations) {
    // Get last 5 messages from conversation (would need to fetch from backend in real app)
    // For now, we'll work with the lastMessage only
    if (conv.lastMessage && conv.lastMessage.senderId) {
      const message: MessageProps = {
        id: conv.lastMessage._id,
        sender: {
          id: conv.lastMessage.senderId,
          name: conv.participants.find(p => p._id === conv.lastMessage?.senderId)?.name || 'Unknown',
          avatar: conv.participants.find(p => p._id === conv.lastMessage?.senderId)?.avatar || null,
        },
        content: conv.lastMessage.content,
        createdAt: conv.lastMessage.createdAt,
        type: conv.lastMessage.type,
        attachment: conv.lastMessage.attachment,
      };

      const intent = detectIntentRuleBased(message, conv.name || 'Chat', conv._id);
      if (intent) {
        intents.push(intent);
      }
    }
  }

  return intents.sort((a, b) => b.confidence - a.confidence);
}
