import React from 'react';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SuggestionCard, SuggestionStore } from '../../types/suggestions';

const STORAGE_KEY = 'ai_suggestions_v1';
const MAX_STORED = 20;

export const useSuggestionStore = create<SuggestionStore>((set, get) => ({
  suggestions: [],
  isProcessing: false,
  lastProcessedAt: null,
  permissionGranted: false,

  addSuggestion: (card: SuggestionCard) => {
    set(state => {
      const isDuplicate = state.suggestions.some(
        s => s.cluster.id === card.cluster.id || s.headline === card.headline
      );
      if (isDuplicate) return state;

      const updated = [card, ...state.suggestions].slice(0, MAX_STORED);
      return { suggestions: updated };
    });

    setTimeout(() => get().persist(), 100);
  },

  dismissSuggestion: (id: string) => {
    set(state => ({
      suggestions: state.suggestions.map(s =>
        s.id === id ? { ...s, isDismissed: true } : s
      ),
    }));
    setTimeout(() => get().persist(), 100);
  },

  markActedOn: (id: string) => {
    set(state => ({
      suggestions: state.suggestions.map(s =>
        s.id === id ? { ...s, isActedOn: true, isDismissed: true } : s
      ),
    }));
    setTimeout(() => get().persist(), 100);
  },

  clearExpired: () => {
    const now = new Date();
    set(state => ({
      suggestions: state.suggestions.filter(
        s => new Date(s.expiresAt) > now && !s.isDismissed
      ),
    }));
  },

  setProcessing: (val: boolean) => set({ isProcessing: val }),

  setPermissionGranted: (val: boolean) => set({ permissionGranted: val }),

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed: SuggestionCard[] = JSON.parse(raw).map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        expiresAt: new Date(s.expiresAt),
        cluster: {
          ...s.cluster,
          createdAt: new Date(s.cluster.createdAt),
          intents: s.cluster.intents.map((i: any) => ({
            ...i,
            detectedAt: new Date(i.detectedAt),
          })),
        },
      }));

      const now = new Date();
      const fresh = parsed.filter(s => new Date(s.expiresAt) > now && !s.isDismissed);
      set({ suggestions: fresh });
    } catch {
      // Silent fail
    }
  },

  persist: async () => {
    try {
      const { suggestions } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(suggestions));
    } catch {
      // Silent fail
    }
  },
}));

export const useActiveSuggestions = () => {
  const suggestions = useSuggestionStore(state => state.suggestions);
  
  return React.useMemo(() => 
    suggestions
      .filter(s => !s.isDismissed && !s.isActedOn)
      .sort((a, b) => {
        const pw: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (pw[a.priority] || 3) - (pw[b.priority] || 3);
      }),
    [suggestions]
  );
};

export const useSuggestionCount = () =>
  useSuggestionStore(state =>
    state.suggestions.filter(s => !s.isDismissed && !s.isActedOn).length
  );

export const useIsProcessing = () =>
  useSuggestionStore(state => state.isProcessing);
