import { StyleSheet, View, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { useRouter } from 'expo-router';
import Typo from '@/components/Typo';
import Input from '@/components/Input';
import Button from '@/components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ServerConfig = () => {
  const router = useRouter();
  const [serverIP, setServerIP] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSavedIP();
  }, []);

  const loadSavedIP = async () => {
    try {
      const savedIP = await AsyncStorage.getItem('serverIP');
      if (savedIP) {
        setServerIP(savedIP);
      } else {
        // Default to the current IP
        setServerIP('172.25.250.173');
      }
    } catch {
      console.error('Error loading saved IP');
    }
  };

  const testConnection = async (ip: string) => {
    try {
      const response = await fetch(`http://${ip}:3000/api/auth/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!serverIP.trim()) {
      Alert.alert('Error', 'Please enter a server IP address');
      return;
    }

    // Validate IP format (basic check)
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(serverIP.trim())) {
      Alert.alert('Error', 'Please enter a valid IP address (e.g., 192.168.1.100)');
      return;
    }

    setLoading(true);

    // Test connection
    const isConnected = await testConnection(serverIP.trim());

    if (isConnected) {
      // Save the IP
      await AsyncStorage.setItem('serverIP', serverIP.trim());
      Alert.alert('Success', 'Server configured successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } else {
      Alert.alert(
        'Connection Failed',
        `Cannot connect to server at ${serverIP.trim()}:3000\n\nMake sure:\n• Backend is running\n• Phone and computer are on same WiFi\n• IP address is correct`,
        [
          { text: 'Try Again', style: 'cancel' },
          {
            text: 'Save Anyway',
            onPress: async () => {
              await AsyncStorage.setItem('serverIP', serverIP.trim());
              router.back();
            },
          },
        ]
      );
    }

    setLoading(false);
  };

  const handleSkip = () => {
    router.back();
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.content}>
          <Typo size={28} fontWeight="700" color={colors.white} style={styles.title}>
            Server Configuration
          </Typo>
          <Typo size={16} color={colors.neutral300} style={styles.subtitle}>
            Enter your computer&apos;s IP address to connect
          </Typo>

          <View style={styles.form}>
            <View style={styles.instructionsBox}>
              <Typo size={14} fontWeight="600" color={colors.neutral700} style={styles.instructionTitle}>
                How to find your computer&apos;s IP:
              </Typo>
              <Typo size={13} color={colors.neutral600} style={styles.instruction}>
                • Windows: Open CMD and type &quot;ipconfig&quot;
              </Typo>
              <Typo size={13} color={colors.neutral600} style={styles.instruction}>
                • Mac: System Preferences → Network
              </Typo>
              <Typo size={13} color={colors.neutral600} style={styles.instruction}>
                • Look for &quot;IPv4 Address&quot; (e.g., 192.168.1.100)
              </Typo>
            </View>

            <Input
              placeholder="Enter server IP (e.g., 192.168.1.100)"
              value={serverIP}
              onChangeText={setServerIP}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              onPress={handleSave}
              loading={loading}
            >
              <Typo size={16} fontWeight="600" color={colors.neutral900}>
                {loading ? 'Testing Connection...' : 'Save & Test Connection'}
              </Typo>
            </Button>

            <Button
              onPress={handleSkip}
              style={styles.outlineButton}
            >
              <Typo size={16} fontWeight="600" color={colors.primary}>
                Skip for Now
              </Typo>
            </Button>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ServerConfig;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  content: {
    flex: 1,
    paddingTop: spacingY._40,
  },
  title: {
    marginBottom: spacingY._10,
  },
  subtitle: {
    marginBottom: spacingY._30,
  },
  form: {
    gap: spacingY._20,
  },
  instructionsBox: {
    backgroundColor: colors.neutral100,
    padding: spacingX._15,
    borderRadius: radius._12,
    marginBottom: spacingY._10,
  },
  instructionTitle: {
    marginBottom: spacingY._7,
  },
  instruction: {
    marginBottom: spacingY._5,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
