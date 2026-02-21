import { Image, StyleSheet, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Typo from '@/components/Typo'
import Animated, { FadeIn } from 'react-native-reanimated'
import Button from '@/components/Button'
import { Feather } from '@expo/vector-icons'

const AnimatedImage = Animated.createAnimatedComponent(Image)

const Welcome = () => {
  const router = useRouter()

  return (
    <ScreenWrapper showPattern={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{alignItems:'center', flex: 1}}>
            <Typo color={colors.white} size={35} fontWeight="900">
              Sharingzi
            </Typo>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/(auth)/serverConfig')}
          >
            <Feather name="settings" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        <AnimatedImage
          entering={FadeIn.duration(700).springify()}
          source={require('../../images/panda.png')}
          style={[styles.welcomeImage, { marginBottom: -20 }]}
          resizeMode='contain'
        />
        <View>
          <Typo color={colors.white} size={28} fontWeight="800">
            Stay Connected
          </Typo>
          <Typo color={colors.white} size={28} fontWeight="800">
            To Your
          </Typo>
          <Typo color={colors.white} size={28} fontWeight="800">
            Family and friends
          </Typo>
        </View>

        <Button onPress={() => router.push('/(auth)/register')}>
          <Typo color={colors.neutral900} size={18} fontWeight="800">
            Get Started
          </Typo>
        </Button>
      </View>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    paddingHorizontal: spacingX._20,
    marginVertical: spacingY._10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsButton: {
    padding: spacingX._20,
  },
  background: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  welcomeImage: {
    height: verticalScale(300),
    aspectRatio: 1,
    alignSelf: "center",
  },
})
