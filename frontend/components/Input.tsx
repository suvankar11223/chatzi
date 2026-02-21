import { StyleSheet, TextInput, View } from 'react-native'
import React from 'react'
import { InputProps } from '@/types'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'

const Input = ({
  icon,
  containerStyle,
  inputStyle,
  inputRef,
  ...props
}: InputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {icon && icon}
      <TextInput
        ref={inputRef}
        style={[styles.input, inputStyle]}
        placeholderTextColor={colors.neutral400}
        {...props}
      />
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._15,
    paddingHorizontal: spacingX._15,
    gap: spacingX._10,
  },
  input: {
    flex: 1,
    paddingVertical: spacingY._15,
    fontSize: 16,
    color: colors.text,
  },
})
