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

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signUp } = useContext(AuthContext)

  const handleSubmit = async () => {
    // Validate inputs
    if (!name || !email || !password) {
      Alert.alert('Sign Up', "Please fill all the fields")
      return;
    }

    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Sign Up', "Please enter a valid email address")
      return;
    }

    // Password length validation
    if (password.length < 6) {
      Alert.alert('Sign Up', "Password must be at least 6 characters")
      return;
    }

    setIsLoading(true)
    
    try {
      console.log("[DEBUG] Register: Starting registration for:", email)
      
      // Use AuthContext signUp which handles token storage and navigation
      await signUp(email, password, name, "")
      
      console.log("[DEBUG] Register: Registration successful")
    } catch (error: any) {
      console.error("[DEBUG] Register: Error:", error)
      
      // Show error message to user
      const errorMessage = error?.message || 'Registration failed. Please try again.'
      Alert.alert('Sign Up Error', errorMessage)
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
            Need some help?
          </Typo>
        </View>
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={{gap:spacingY._10,marginBottom:spacingY._15}}>
              <Typo size={25} fontWeight={"600"}>
                Getting Started
              </Typo>
              <Typo color={colors.neutral600}>
                Create an account to continue
              </Typo>
            </View>
            
            <Input 
              placeholder="Enter your name" 
              icon={<Ionicons name="person-outline" size={24} color={colors.neutral500} />}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <Input 
              placeholder="Enter your email" 
              icon={<Ionicons name="at-outline" size={24} color={colors.neutral500} />}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <Input 
              placeholder="Enter your password" 
              icon={<Ionicons name="lock-closed-outline" size={24} color={colors.neutral500} />}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            
            <Button 
              onPress={handleSubmit} 
              loading={isLoading} 
              disabled={isLoading}
              style={styles.signUpButton}
            >
              <Typo color={colors.neutral900} size={18} fontWeight="800">
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Typo>
            </Button>
            
            <View style={styles.footer}>
              <Typo color={colors.neutral600} size={15}>
                Already have an account?
              </Typo>
              <Typo 
                color={colors.primary} 
                size={15} 
                fontWeight="600"
                textProps={{onPress: () => router.push('/(auth)/login')}}
              >
                Login
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
