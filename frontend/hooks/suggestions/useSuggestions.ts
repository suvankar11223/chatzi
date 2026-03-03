import { useCallback } from 'react';
import { SuggestionAction, SuggestionCard } from '../../types/suggestions';
import {
  useActiveSuggestions,
  useSuggestionCount,
  useIsProcessing,
  useSuggestionStore,
} from '../../services/suggestions/suggestionStore';
import { executeAction, ActionContext } from '../../services/suggestions/actionHandler';

export function useSuggestions(context?: Partial<ActionContext>) {
  const suggestions = useActiveSuggestions();
  const count = useSuggestionCount();
  const isProcessing = useIsProcessing();
  const { dismissSuggestion, markActedOn } = useSuggestionStore();

  const handleAction = useCallback(
    async (action: SuggestionAction, card: SuggestionCard) => {
      const fullContext: ActionContext = {
        ...context,
      };

      const success = await executeAction(action, card, fullContext);

      if (success) {
        if (action.type === 'dismiss_all' || action.type === 'snooze') {
          dismissSuggestion(card.id);
        } else {
          markActedOn(card.id);
        }
      }

      return success;
    },
    [context, dismissSuggestion, markActedOn]
  );

  const dismiss = useCallback(
    (cardId: string) => dismissSuggestion(cardId),
    [dismissSuggestion]
  );

  return {
    suggestions,
    count,
    isProcessing,
    handleAction,
    dismiss,
  };
}
