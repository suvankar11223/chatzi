import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, spacingX, spacingY, radius } from '@/constants/theme'
import Typo from '@/components/Typo'
import BackButton from '@/components/BackButton'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSignUp, useOAuth } from '@clerk/clerk-expo'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()

export default function Register() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleSubmit = async () => {
    if (!isLoaded || !name || !email || !password) {
      Alert.alert('Sign Up', "Please fill all the fields")
      return
    }
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      Alert.alert('Sign Up', "Please enter a valid email address")
      return
    }
    if (password.length < 6) {
      Alert.alert('Sign Up', "Password must be at least 6 characters")
      return
    }
    setIsLoading(true)
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: name,
      })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(main)/home')
      } else {
        await setActive({ session: result.createdSessionId })
        router.replace('/(main)/home')
      }
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.errors?.[0]?.message || 'Registration failed.')
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
    <ScreenWrapper showPattern={true}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? "padding" : "height"}
      >
        <View style={styles.header}>
          <BackButton iconSize={28} />
          <Typo color={colors.white} size={17} fontWeight="300">Need some help?</Typo>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={{ gap: spacingY._10, marginBottom: spacingY._10 }}>
              <Typo size={25} fontWeight={"600"}>Getting Started</Typo>
              <Typo color={colors.neutral600}>Create an account to continue</Typo>
            </View>

            <Input
              placeholder="Enter your name"
              icon={<Ionicons name="person-outline" size={24} color={colors.neutral500} />}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!isLoading}
            />
            <Input
              placeholder="Enter your email"
              icon={<Ionicons name="at-outline" size={24} color={colors.neutral500} />}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <Input
              placeholder="Enter your password"
              icon={<Ionicons name="lock-closed-outline" size={24} color={colors.neutral500} />}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />

            <Button
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading || isGoogleLoading}
            >
              <Typo color={colors.neutral900} size={18} fontWeight="800">
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Typo>
            </Button>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Typo color={colors.neutral400} size={13}>or</Typo>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              style={styles.googleButton}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-google" size={22} color="#EA4335" />
              <Typo color={colors.neutral900} size={16} fontWeight="600">
                {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
              </Typo>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Typo color={colors.neutral600} size={15}>Already have an account?</Typo>
              <Typo
                color={colors.primary}
                size={15}
                fontWeight="600"
                textProps={{ onPress: () => router.push('/(auth)/login') }}
              >
                Login
              </Typo>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._30,
    paddingTop: spacingY._30,
    paddingBottom: spacingY._40,
    gap: spacingY._15,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    borderRadius: 14,
    paddingVertical: 15,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: spacingY._5,
  },
})