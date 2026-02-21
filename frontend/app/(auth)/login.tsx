import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import React, { useState, useContext } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, spacingX, spacingY, radius } from '@/constants/theme'
import Typo from '@/components/Typo'
import BackButton from '@/components/BackButton'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { AuthContext } from '@/context/authContext'

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useContext(AuthContext)

  const handleSubmit = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert('Login', "Please fill all the fields")
      return;
    }

    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Login', "Please enter a valid email address")
      return;
    }

    setIsLoading(true)
    
    try {
      console.log("[DEBUG] Login: Starting login for:", email)
      
      // Call the signIn function from AuthContext
      await signIn(email, password)
      
      console.log("[DEBUG] Login: Success, redirecting to home")
    } catch (error: any) {
      console.error("[DEBUG] Login: Error:", error)
      
      // Show error message to user
      const errorMessage = error?.message || 'Login failed. Please try again.'
      Alert.alert('Login Error', errorMessage)
    } finally {
      // Always set loading to false when done
      setIsLoading(false)
    }
  }
  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === 'ios' ? "padding" : "height"}
    >
      <ScreenWrapper showPattern={true}>
        <View style={styles.header}>
          <BackButton iconSize={28}/>
          <Typo color={colors.white} size={17} fontWeight="300">
            Forgot Your Password
          </Typo>
        </View>
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={{gap:spacingY._10,marginBottom:spacingY._15}}>
              <Typo size={25} fontWeight={"600"}>
                Welcome Back😊
              </Typo>
              <Typo color={colors.neutral600}>
                Happy to see you again!
              </Typo>
            </View>
            
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
              disabled={isLoading}
              style={styles.signUpButton}
            >
              <Typo color={colors.neutral900} size={18} fontWeight="800">
                {isLoading ? 'Logging in...' : 'Lets Go'}
              </Typo>
            </Button>
            
            <View style={styles.footer}>
              <Typo color={colors.neutral600} size={15}>
                {"Don't have an account?"}
              </Typo>
              <Typo 
                color={colors.primary} 
                size={15} 
                fontWeight="600"
                textProps={{onPress: () => router.push('/(auth)/register')}}
              >
                Sign Up
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
  },
  signUpButton: {
    marginTop: spacingY._20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: spacingY._15,
  },
})
