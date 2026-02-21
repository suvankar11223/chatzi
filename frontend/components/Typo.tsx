import { Text, TextStyle } from 'react-native'
import React from 'react'
import { TypoProps } from '@/types'

const Typo = ({
  size,
  color,
  fontWeight,
  children,
  style,
  textProps,
}: TypoProps) => {
  const textStyle: TextStyle = {
    fontSize: size,
    color: color,
    fontWeight: fontWeight,
    ...style,
  }

  return (
    <Text style={textStyle} {...textProps}>
      {children}
    </Text>
  )
}

export default Typo
