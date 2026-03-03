import { SuggestionAction, SuggestionCard } from '../../types/suggestions';
import { Alert } from 'react-native';
import { Router } from 'expo-router';

export interface ActionContext {
  router?: Router;
  onNavigateToChat?: (chatId: string) => void;
  onSendMessage?: (chatId: string, text: string) => void;
}

export async function executeAction(
  action: SuggestionAction,
  card: SuggestionCard,
  context: ActionContext
): Promise<boolean> {
  const { type, targetChatId, payload } = action;

  switch (type) {
    case 'open_chat': {
      if (targetChatId && context.onNavigateToChat) {
        context.onNavigateToChat(targetChatId);
      } else if (targetChatId && context.router) {
        // Find the conversation to get details
        context.router.push({
          pathname: '/conversation',
          params: { id: targetChatId },
        });
      } else {
        Alert.alert('Navigate', `Opening chat: ${targetChatId}`);
      }
      return true;
    }

    case 'reply_yes': {
      const text = payload?.text || "Yes, I'll be there! ✅";
      if (targetChatId && context.onSendMessage) {
        context.onSendMessage(targetChatId, text);
      } else {
        Alert.alert('Reply Sent', `"${text}"`);
      }
      return true;
    }

    case 'reply_no': {
      const text = payload?.text || "Sorry, I can't make it 😔";
      if (targetChatId && context.onSendMessage) {
        context.onSendMessage(targetChatId, text);
      } else {
        Alert.alert('Reply Sent', `"${text}"`);
      }
      return true;
    }

    case 'share_location': {
      // In production: use expo-location
      Alert.alert('📍 Location Shared', 'Your location has been shared!');
      return true;
    }

    case 'add_to_calendar': {
      // In production: use expo-calendar
      const title = card.headline;
      Alert.alert('📅 Added to Calendar', `"${title}" saved`);
      return true;
    }

    case 'snooze': {
      Alert.alert('⏰ Snoozed', "We'll remind you in 1 hour");
      return true;
    }

    case 'dismiss_all': {
      return true;
    }

    default:
      return false;
  }
}
