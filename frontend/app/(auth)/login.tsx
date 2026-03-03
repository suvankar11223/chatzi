import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, spacingX, spacingY, radius } from '@/constants/theme'
import Typo from '@/components/Typo'
import BackButton from '@/components/BackButton'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSignIn, useOAuth } from '@clerk/clerk-expo'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()

export default function Login() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleSubmit = async () => {
    if (!isLoaded || !email || !password) {
      Alert.alert('Login', "Please fill all the fields")
      return
    }
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      Alert.alert('Login', "Please enter a valid email address")
      return
    }
    setIsLoading(true)
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      })
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/(main)/home')
      } else {
        Alert.alert('Error', 'Sign in failed. Please try again.')
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const { createdSessionId, setActive: setActiveSession } = await startOAuthFlow()
      if (createdSessionId) {
        await setActiveSession!({ session: createdSessionId })
        router.replace('/(main)/home')
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Google sign in failed.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? "padding" : "height"}
    >
      <ScreenWrapper showPattern={true}>
        <View style={styles.header}>
          <BackButton iconSize={28} />
          <Typo color={colors.white} size={17} fontWeight="300">
            Need some help?
          </Typo>
        </View>
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={{ gap: spacingY._10, marginBottom: spacingY._15 }}>
              <Typo size={25} fontWeight={"600"}>
                Welcome Back
              </Typo>
              <Typo color={colors.neutral600}>
                Login to continue
              </Typo>
            </View>

            <Input
              placeholder="Enter your email"
              icon={<Ionicons name="at-outline" size={24} color={colors.neutral500} />}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <Input
              placeholder="Enter your password"
              icon={<Ionicons name="lock-closed-outline" size={24} color={colors.neutral500} />}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />

            <Button
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading || isGoogleLoading}
              style={styles.loginButton}
            >
              <Typo color={colors.neutral900} size={18} fontWeight="800">
                {isLoading ? 'Logging in...' : 'Login'}
              </Typo>
            </Button>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Typo color={colors.neutral400} size={13}>or</Typo>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <Button
              onPress={handleGoogleSignIn}
              loading={isGoogleLoading}
              disabled={isLoading || isGoogleLoading}
              style={styles.googleButton}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="logo-google" size={20} color={colors.neutral900} />
                <Typo color={colors.neutral900} size={16} fontWeight="600">
                  {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
                </Typo>
              </View>
            </Button>

            <View style={styles.footer}>
              <Typo color={colors.neutral600} size={15}>
                Dont have an account?
              </Typo>
              <Typo
                color={colors.primary}
                size={15}
                fontWeight="600"
                textProps={{ onPress: () => router.push('/(auth)/register') }}
              >
                Register
              </Typo>
            </View>
          </ScrollView>
        </View>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._30,
    paddingTop: spacingY._20,
    marginTop: spacingY._30,
  },
  form: {
    gap: spacingY._15,
    marginTop: spacingY._20,
    paddingBottom: spacingY._30,
    flexGrow: 1,
  },
  loginButton: {
    marginTop: spacingY._5,
  },
  googleButton: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.neutral300,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
    marginVertical: spacingY._5,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral200,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: spacingY._5,
  },
})