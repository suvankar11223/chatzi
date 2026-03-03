import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { SuggestionAction } from '../../types/suggestions';
import { colors, spacingX, spacingY, radius } from '../../constants/theme';
import Typo from '../Typo';

interface ActionButtonProps {
  action: SuggestionAction;
  accentColor: string;
  onPress: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  accentColor,
  onPress,
}) => {
  const isPrimary = action.isPrimary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary
          ? [styles.primary, { backgroundColor: accentColor }]
          : [styles.secondary, { borderColor: accentColor + '40' }],
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Typo size={14} color={isPrimary ? colors.white : accentColor}>
        {action.emoji} {action.label}
      </Typo>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._8,
    borderRadius: radius._20,
    marginRight: spacingX._8,
    marginBottom: spacingY._8,
  },
  primary: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  secondary: {
    backgroundColor: colors.neutral50,
    borderWidth: 1,
  },
});
