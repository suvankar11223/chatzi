// ─────────────────────────────────────────────────────────────────────────────
// AI-POWERED SUGGESTIONS - TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export type IntentType =
  | 'dinner_invite'
  | 'meeting_schedule'
  | 'location_request'
  | 'plan_confirmation'
  | 'task_assignment'
  | 'reminder_needed'
  | 'decision_pending'
  | 'follow_up_needed'
  | 'event_coordination'
  | 'urgent_response';

export type LinkType =
  | 'same_date'
  | 'same_person'
  | 'same_topic'
  | 'calendar_conflict'
  | 'unanswered_chain'
  | 'location_context';

export type ActionType =
  | 'reply_yes'
  | 'reply_no'
  | 'reply_later'
  | 'add_to_calendar'
  | 'share_location'
  | 'open_chat'
  | 'call_contact'
  | 'send_custom_reply'
  | 'dismiss_all'
  | 'snooze';

export interface ExtractedEntities {
  dates?: string[];
  people?: string[];
  places?: string[];
  topics?: string[];
  timeWords?: string[];
}

export interface DetectedIntent {
  type: IntentType;
  confidence: number;
  sourceMessageId: string;
  sourceChatId: string;
  sourceChatName: string;
  senderName: string;
  originalText: string;
  detectedAt: Date;
  extractedEntities: ExtractedEntities;
}

export interface LinkedCluster {
  id: string;
  linkType: LinkType;
  intents: DetectedIntent[];
  sharedEntities: ExtractedEntities;
  conflictDetected: boolean;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  createdAt: Date;
}

export interface SuggestionAction {
  id: string;
  label: string;
  emoji: string;
  type: ActionType;
  targetChatId?: string;
  payload?: Record<string, any>;
  isPrimary: boolean;
}

export interface SuggestionCard {
  id: string;
  headline: string;
  subheadline: string;
  bodyText: string;
  emoji: string;
  accentColor: string;
  actions: SuggestionAction[];
  sourceChats: Array<{ id: string; name: string; emoji?: string }>;
  cluster: LinkedCluster;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  createdAt: Date;
  expiresAt: Date;
  isDismissed: boolean;
  isActedOn: boolean;
}

export interface SuggestionState {
  suggestions: SuggestionCard[];
  isProcessing: boolean;
  lastProcessedAt: Date | null;
  permissionGranted: boolean;
}

export interface SuggestionStore extends SuggestionState {
  addSuggestion: (card: SuggestionCard) => void;
  dismissSuggestion: (id: string) => void;
  markActedOn: (id: string) => void;
  clearExpired: () => void;
  setProcessing: (val: boolean) => void;
  setPermissionGranted: (val: boolean) => void;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
}
