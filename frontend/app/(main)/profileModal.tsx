import { StyleSheet, View, StatusBar, Platform, TouchableOpacity, Alert, ScrollView } from 'react-native';
import React, { useContext, useState } from 'react';
import Typo from '@/components/Typo';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import Avatar from '@/components/Avatar';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { AuthContext } from '@/context/authContext';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from '@/services/userService';
import { uploadImageToCloudinary } from '@/services/imageService';
import { useRouter } from 'expo-router';

const ProfileModal = () => {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  const { user, refreshUser, signOut } = useContext(AuthContext);
  const router = useRouter();
  
  // Initialize state from user context - will update when user context changes
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);

  // Update local state when user context changes (e.g., when modal reopens)
  React.useEffect(() => {
    console.log('[DEBUG] ProfileModal: User context updated', user);
    setName(user?.name || '');
    setEmail(user?.email || '');
    setAvatar(user?.avatar || null);
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to change your avatar');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    console.log('[DEBUG] ProfileModal: Image picker result:', result);

    if (!result.canceled && result.assets && result.assets[0]) {
      console.log('[DEBUG] ProfileModal: Image selected:', result.assets[0].uri);
      setAvatar(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    console.log('='.repeat(60));
    console.log('[DEBUG] ProfileModal: Starting update...');
    console.log('[DEBUG] ProfileModal: Update data:', { name, email, avatar });
    console.log('='.repeat(60));
    
    setLoading(true);
    try {
      let avatarUrl = avatar;

      // If avatar is a local URI (starts with file:// or content://), upload to Cloudinary
      if (avatar && (avatar.startsWith('file://') || avatar.startsWith('content://'))) {
        console.log('[DEBUG] ProfileModal: Detected local image, uploading to Cloudinary...');
        avatarUrl = await uploadImageToCloudinary(avatar);
        console.log('[DEBUG] ProfileModal: Cloudinary URL received:', avatarUrl);
      }

      const response = await updateProfile(name, email, avatarUrl || undefined);
      
      console.log('='.repeat(60));
      console.log('[DEBUG] ProfileModal: Update response received');
      console.log('[DEBUG] ProfileModal: Success:', response.success);
      console.log('[DEBUG] ProfileModal: Response data:', response.data);
      console.log('='.repeat(60));
      
      if (response.success && response.data) {
        // Update local user context immediately
        const updatedUser = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          avatar: response.data.avatar,
        };
        
        console.log('='.repeat(60));
        console.log('[DEBUG] ProfileModal: Updating local context');
        console.log('[DEBUG] ProfileModal: Updated user:', updatedUser);
        console.log('='.repeat(60));
        
        refreshUser(updatedUser);
        
        Alert.alert('Success', 'Details updated successfully', [
          {
            text: 'OK',
            onPress: () => {
              console.log('[DEBUG] ProfileModal: Navigating back to home');
              router.back();
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error('='.repeat(60));
      console.error('[DEBUG] ProfileModal: Update failed');
      console.error('[DEBUG] ProfileModal: Error:', error);
      console.error('='.repeat(60));
      Alert.alert('Error', error.response?.data?.msg || error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" translucent />
      <View style={[styles.topSpace, { height: statusBarHeight + 40 }]} />
      <View style={styles.container}>
        <Header 
          title={
            <Typo size={20} fontWeight="600" color={colors.neutral900}>
              Update Profile
            </Typo>
          }
          left={
            Platform.OS === "android" && <BackButton color={colors.black} />
          }
        />
        
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Avatar uri={avatar} size={100} />
              <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
                <Ionicons name="camera" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Typo size={14} color={colors.neutral600} style={styles.label}>
                Email
              </Typo>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Typo size={14} color={colors.neutral600} style={styles.label}>
                Name
              </Typo>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                containerStyle={styles.input}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <Button onPress={handleUpdate} loading={loading} style={styles.updateButton}>
            <Typo size={18} fontWeight="600" color={colors.white}>
              Update
            </Typo>
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topSpace: {
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacingX._20,
    paddingTop: 30,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._20,
    paddingBottom: spacingY._30,
  },
  avatarContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: spacingY._20,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  inputGroup: {
    gap: spacingY._10,
  },
  label: {
    marginLeft: spacingX._10,
  },
  input: {
    backgroundColor: colors.neutral100,
  },
  footer: {
    paddingVertical: spacingY._20,
    paddingHorizontal: spacingX._20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButton: {
    flex: 1,
    height: 56,
    borderRadius: radius._15,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
