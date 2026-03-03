import React from 'react'
import { Stack, Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

const AuthLayout = () => {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href="/(main)/home" />
  }

  return <Stack screenOptions={{headerShown: false}} />
}

export default AuthLayout
