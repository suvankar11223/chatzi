import { StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { colors, radius } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { BackButtonProps } from '@/types'

const BackButton = ({
  style,
  iconSize = 26,
  color = colors.white
}: BackButtonProps) => {
  const router = useRouter()

  return (
    <TouchableOpacity onPress={() => router.back()} style={[styles.button, style]}>
      <Ionicons name="arrow-back" size={iconSize} color={color} />
    </TouchableOpacity>
  )
}

export default BackButton

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    padding: 8,
    borderRadius: radius._10,
  },
})
