# 🧠 AI-Powered Suggestions - Implementation Plan

## Overview
Implementing cross-context proactive suggestions that read messages across chats, detect patterns, and suggest bundled actions - all on-device, matching your existing UI theme.

## Your Theme Colors (Adapted)
- Primary: `#facc15` (yellow)
- Primary Light: `#fef08a`
- Primary Dark: `#eab308`
- Accent Colors for Priority:
  - Urgent: `#ef4444` (rose/red)
  - High: `#f97316` (orange)
  - Medium: `#facc15` (your primary yellow)
  - Low: `#16a34a` (green)

## Phase 1: Core Infrastructure ✅
**Files to Create:**
1. `frontend/types/suggestions.ts` - All TypeScript interfaces
2. `frontend/utils/intentPatterns.ts` - Rule-based NLP patterns
3. `frontend/services/suggestionStore.ts` - Zustand store with AsyncStorage

**What it does:**
- Defines all data structures
- Sets up 10 intent types (dinner_invite, meeting_schedule, etc.)
- Creates persistent storage for suggestions

## Phase 2: Intent Detection Engine
**Files to Create:**
1. `frontend/services/intentDetector.ts` - Analyzes messages for intents
2. `frontend/services/contextCollector.ts` - Gathers chat snapshots

**What it does:**
- Scans last 5 messages per chat
- Detects intents using keyword matching (~5ms per message)
- Extracts entities (dates, times, people, places)
- Caches context for 30 seconds

## Phase 3: Cross-Chat Linking
**Files to Create:**
1. `frontend/services/crossChatLinker.ts` - Links related intents
2. `frontend/services/suggestionBuilder.ts` - Builds suggestion cards

**What it does:**
- Groups intents by: same date, same topic, location requests
- Detects calendar conflicts
- Builds actionable suggestion cards with 2-4 actions each

## Phase 4: UI Components (Adapted to Your Theme)
**Files to Create:**
1. `frontend/components/suggestions/ActionButton.tsx`
2. `frontend/components/suggestions/SuggestionCard.tsx`
3. `frontend/components/suggestions/SuggestionCarousel.tsx`
4. `frontend/components/suggestions/PermissionGate.tsx`

**Design Adaptations:**
- Use your existing `colors.white` background
- Primary yellow (`#facc15`) for active states
- Neutral grays for text
- Rounded corners matching your `radius` values
- Shadows matching your existing elevation

## Phase 5: Integration Hooks
**Files to Create:**
1. `frontend/hooks/useMessageWatcher.ts` - Watches for new messages
2. `frontend/hooks/useSuggestions.ts` - UI hook for components
3. `frontend/services/actionHandler.ts` - Executes user actions

**What it does:**
- Debounces message changes (2s wait)
- Runs pipeline in background (InteractionManager)
- Never blocks UI
- Handles action execution (reply, calendar, location)

## Phase 6: Home Screen Integration
**Modifications:**
1. Update `frontend/app/(main)/home.tsx`
   - Add `<SuggestionCarousel>` above conversation list
   - Import hooks and components
   - Pass navigation context

**What users see:**
- Horizontal swipeable cards above chats
- "✨ Smart Suggestions" header
- Live dot when processing
- Smooth animations

## Performance Guarantees
- ✅ Never blocks UI (InteractionManager)
- ✅ Debounced processing (2s after last message)
- ✅ Fast intent detection (<5ms per message)
- ✅ Cached context (30s in-memory)
- ✅ Only scans last 5 messages per chat
- ✅ Background processing only

## Privacy
- ✅ All processing on-device
- ✅ No data sent anywhere
- ✅ User permission required
- ✅ Can be disabled anytime

## Next Steps
1. ✅ Create type definitions
2. Create intent patterns and detector
3. Create suggestion store
4. Create UI components
5. Create hooks
6. Integrate into home screen
7. Test and refine

Ready to proceed with Phase 2?
