import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import { ButtonProps } from '@/types'
import { colors, radius, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'

const Button = ({
  style,
  onPress,
  children,
  loading = false,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors.neutral900} />
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

export default Button

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacingY._15,
    height:verticalScale(60),
    borderRadius: radius._15,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
