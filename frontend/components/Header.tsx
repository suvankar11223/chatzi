import { View, StyleSheet } from 'react-native'
import React, { ReactNode } from 'react'
import { spacingY } from '@/constants/theme'

interface HeaderProps {
  title?: ReactNode
  left?: ReactNode
  right?: ReactNode
}

const Header = ({ title, left, right }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {left}
      </View>
      <View style={styles.titleContainer}>
        {title}
      </View>
      <View style={styles.rightContainer}>
        {right}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacingY._15,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 3,
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
})

export default Header
