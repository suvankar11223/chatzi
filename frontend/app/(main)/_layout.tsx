import { Stack } from "expo-router";
import React from "react";

const RootLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="home"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="conversation"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profileModal"
        options={{ 
          presentation: "transparentModal",
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="newConversationModal"
        options={{ 
          presentation: "transparentModal",
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="callHistory"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="callScreen"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="incomingCall"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
};

export default RootLayout;
