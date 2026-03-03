import React, { useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { SuggestionCard as SuggestionCardType, SuggestionAction } from '../../types/suggestions';
import { ActionButton } from './ActionButton';
import { colors, spacingX, spacingY, radius } from '../../constants/theme';
import Typo from '../Typo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CARD_WIDTH = SCREEN_WIDTH - 40;

interface SuggestionCardProps {
  card: SuggestionCardType;
  onAction: (action: SuggestionAction, card: SuggestionCardType) => void;
  onDismiss: (id: string) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  card,
  onAction,
  onDismiss,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          borderLeftColor: card.accentColor,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.emojiBubble, { backgroundColor: card.accentColor + '20' }]}>
            <Typo size={24}>{card.emoji}</Typo>
          </View>
          <View style={styles.headerText}>
            <Typo size={15} fontWeight="700" color={colors.neutral900} textProps={{ numberOfLines: 2 }}>
              {card.headline}
            </Typo>
            <Typo size={12} color={colors.neutral500} textProps={{ numberOfLines: 1 }}>
              {card.subheadline}
            </Typo>
          </View>
        </View>
        <TouchableOpacity onPress={() => onDismiss(card.id)} style={styles.closeButton}>
          <Typo size={18} color={colors.neutral400}>✕</Typo>
        </TouchableOpacity>
      </View>

      {/* Body */}
      {card.bodyText ? (
        <Typo size={13} color={colors.neutral600} style={styles.body} textProps={{ numberOfLines: 3 }}>
          {card.bodyText}
        </Typo>
      ) : null}

      {/* Source chats */}
      {card.sourceChats.length > 1 && (
        <View style={styles.sourcesRow}>
          <Typo size={11} color={colors.neutral500}>🔗 Connected: </Typo>
          {card.sourceChats.map(c => (
            <View key={c.id} style={[styles.chatChip, { borderColor: card.accentColor + '40' }]}>
              <Typo size={11} color={card.accentColor}>{c.name}</Typo>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        {card.actions.map(action => (
          <ActionButton
            key={action.id}
            action={action}
            accentColor={card.accentColor}
            onPress={() => onAction(action, card)}
          />
        ))}
      </View>

      {/* Urgent badge */}
      {card.priority === 'urgent' && (
        <View style={[styles.urgentBadge, { backgroundColor: card.accentColor }]}>
          <Typo size={9} fontWeight="800" color={colors.white}>URGENT</Typo>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: radius._20,
    borderLeftWidth: 4,
    padding: spacingX._15,
    marginHorizontal: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacingY._10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: spacingX._10,
  },
  emojiBubble: {
    width: 44,
    height: 44,
    borderRadius: radius._12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    paddingRight: spacingX._8,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    marginBottom: spacingY._10,
    fontStyle: 'italic',
  },
  sourcesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacingY._10,
  },
  chatChip: {
    paddingHorizontal: spacingX._8,
    paddingVertical: 3,
    borderRadius: radius._10,
    borderWidth: 1,
    backgroundColor: colors.neutral50,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacingY._5,
  },
  urgentBadge: {
    position: 'absolute',
    top: 12,
    right: 40,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius._6,
  },
});
