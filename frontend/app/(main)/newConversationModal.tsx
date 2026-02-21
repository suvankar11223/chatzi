import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Typo from '@/components/Typo';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import Avatar from '@/components/Avatar';
import ScreenWrapper from '@/components/ScreenWrapper';
import Button from '@/components/Button';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { AuthContext } from '@/context/authContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '@/services/imageService';
import { getSocket } from '@/socket/socket';
import { getPhoneContacts, matchContactsWithUsers } from '@/services/contactsService';

const NewConversationModal = () => {
  const { isGroup } = useLocalSearchParams();
  const isGroupMode = isGroup === "1";
  const router = useRouter();
  const { user: currentUser } = React.useContext(AuthContext);
  
  console.log("[DEBUG] NewConversationModal: Component loaded, isGroupMode:", isGroupMode);
  
  const [contacts, setContacts] = useState<any[]>([]);
  const [matchedContacts, setMatchedContacts] = useState<any[]>([]);
  const [groupAvatar, setGroupAvatar] = useState<{ uri: string } | null>(null);
  const [groupName, setGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  const processGetContacts = useCallback((res: any) => {
    console.log("[DEBUG] NewConversationModal: Got contacts response:", res);
    
    if (res.success && res.data && res.data.length > 0) {
      console.log("[DEBUG] NewConversationModal: Setting contacts from backend:", res.data.length);
      setContacts(res.data);
      
      // Fetch phone contacts and match with app users (async operation)
      (async () => {
        try {
          console.log("[DEBUG] Fetching phone contacts...");
          const phoneContacts = await getPhoneContacts();
          console.log("[DEBUG] Got phone contacts:", phoneContacts.length);
          const matched = matchContactsWithUsers(phoneContacts, res.data);
          setMatchedContacts(matched);
          console.log("[DEBUG] NewConversationModal: Matched contacts:", matched.length);
        } catch (error) {
          console.error("[DEBUG] Error matching contacts:", error);
        } finally {
          setIsLoadingContacts(false);
        }
      })();
    } else {
      console.log("[DEBUG] NewConversationModal: No contacts from backend");
      setIsLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    console.log("[DEBUG] NewConversationModal: Setting up socket listeners...");
    
    const socket = getSocket();
    if (!socket) {
      console.log("[DEBUG] Socket not connected!");
      setIsLoadingContacts(false);
      return;
    }
    
    // Set up listener for getContacts
    console.log("[DEBUG] Setting up getContacts listener");
    socket.on("getContacts", processGetContacts);
    
    // Emit the getContacts event
    console.log("[DEBUG] Emitting getContacts");
    socket.emit("getContacts");

    return () => {
      console.log("[DEBUG] Cleaning up socket listeners");
      socket.off("getContacts", processGetContacts);
    };
  }, [processGetContacts]);

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      aspect: [4, 3],
      quality: 0.5,
    });

    console.log(result);

    if (!result.canceled) {
      setGroupAvatar(result.assets[0]);
    }
  };

  const toggleParticipant = (user: any) => {
    const userId = user._id || user.id;
    setSelectedParticipants((prev: any) => {
      if (prev.includes(userId)) {
        return prev.filter((id: string) => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const onSelectUser = (user: any) => {
    console.log("[DEBUG] onSelectUser: FUNCTION CALLED!");
    console.log("[DEBUG] onSelectUser: User data:", JSON.stringify(user, null, 2));
    
    if (!currentUser) {
      Alert.alert("Authentication", "Please login to start a conversation");
      return;
    }

    if (isGroupMode) {
      toggleParticipant(user);
    } else {
      // For direct message, create conversation first, then navigate
      const userId = user._id || user.id;
      const currentUserId = currentUser.id;
      
      console.log("[DEBUG] onSelectUser: Selected user ID:", userId);
      console.log("[DEBUG] onSelectUser: Current user ID:", currentUserId);
      
      if (!currentUserId) {
        Alert.alert("Error", "User ID not found");
        return;
      }
      
      // Create conversation and wait for response
      const socket = getSocket();
      if (socket && socket.connected) {
        const payload = {
          type: "direct",
          participants: [currentUserId, userId],
        };
        
        console.log("[DEBUG] Creating conversation:", JSON.stringify(payload, null, 2));
        
        // Listen for response once
        socket.once("newConversation", (response: any) => {
          console.log("[DEBUG] Got newConversation response:", response);
          
          if (response.success && response.data) {
            const conversation = response.data;
            
            // Navigate to conversation with real ID
            router.back();
            router.push({
              pathname: "/(main)/conversation",
              params: {
                id: conversation._id,
                name: user.name,
                avatar: user.avatar || null,
                type: "direct",
                participants: JSON.stringify(conversation.participants),
              },
            });
          } else {
            Alert.alert("Error", response.msg || "Failed to create conversation");
          }
        });
        
        // Emit the request
        socket.emit("newConversation", payload);
      } else {
        Alert.alert("Connection Error", "Socket not connected");
      }
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || !currentUser || selectedParticipants.length < 2) {
      return;
    }

    setIsLoading(true);

    try {
      const currentUserId = currentUser.id;
      
      if (!currentUserId) {
        Alert.alert("Error", "User ID not found");
        setIsLoading(false);
        return;
      }

      let avatar = null;
      if (groupAvatar) {
        console.log("[DEBUG] Uploading group avatar...");
        avatar = await uploadImageToCloudinary(groupAvatar.uri);
        console.log("[DEBUG] Avatar uploaded:", avatar);
      }
      
      // Include current user in participants
      const allParticipants = [currentUserId, ...selectedParticipants];

      console.log("[DEBUG] Creating group with participants:", allParticipants);
      console.log("[DEBUG] Group name:", groupName);
      console.log("[DEBUG] Group avatar:", avatar);
      
      // Create conversation via socket and WAIT for response
      const socket = getSocket();
      if (!socket || !socket.connected) {
        Alert.alert("Connection Error", "Socket not connected. Please try again.");
        setIsLoading(false);
        return;
      }

      const payload = {
        type: "group",
        name: groupName,
        participants: allParticipants,
        avatar: avatar || "",
      };
      
      console.log("[DEBUG] Emitting newConversation:", JSON.stringify(payload, null, 2));
      
      // Listen for response
      const handleNewConversation = (response: any) => {
        console.log("[DEBUG] Got newConversation response:", response);
        
        // Remove listener
        socket.off("newConversation", handleNewConversation);
        
        if (response.success && response.data) {
          const conversation = response.data;
          console.log("[DEBUG] Group created successfully:", conversation._id);
          
          setIsLoading(false);
          
          // Navigate to the group conversation
          router.back(); // Close modal first
          
          // Small delay to ensure modal is closed
          setTimeout(() => {
            router.push({
              pathname: "/(main)/conversation",
              params: {
                id: conversation._id,
                name: groupName,
                avatar: avatar || '',
                type: "group",
                participants: JSON.stringify(conversation.participants),
              },
            });
          }, 100);
        } else {
          setIsLoading(false);
          Alert.alert("Error", response.msg || "Failed to create group");
        }
      };
      
      // Set up listener
      socket.on("newConversation", handleNewConversation);
      
      // Emit the request
      socket.emit("newConversation", payload);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        socket.off("newConversation", handleNewConversation);
        if (isLoading) {
          setIsLoading(false);
          Alert.alert("Timeout", "Failed to create group. Please try again.");
        }
      }, 10000);
      
    } catch (error) {
      console.error("[DEBUG] Error creating group:", error);
      setIsLoading(false);
      Alert.alert("Error", "Failed to create group");
    }
  };

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        <Header 
          title={
            <Typo size={20} fontWeight="600" color={colors.neutral900}>
              {isGroupMode ? "New Group" : "Select User"}
            </Typo>
          }
          left={<BackButton color={colors.black} />}
        />

        {isGroupMode && (
          <View style={styles.groupInfoContainer}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={onPickImage}>
                <Avatar
                  uri={groupAvatar?.uri || null}
                  size={100}
                  isGroup={true}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.groupNameContainer}>
              <TextInput
                style={styles.groupNameInput}
                placeholder="Group Name"
                placeholderTextColor={colors.neutral400}
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>
          </View>
        )}

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.contactList}
        >
          {isLoadingContacts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Typo size={14} color={colors.neutral500} style={{ marginTop: 10 }}>
                Loading contacts...
              </Typo>
            </View>
          ) : (
            <>
              {/* Matched Contacts (from phone) */}
              {matchedContacts.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Typo size={14} fontWeight="600" color={colors.neutral600}>
                      FROM YOUR CONTACTS
                    </Typo>
                  </View>
                  {matchedContacts.map((user: any, index) => {
                    const userId = user._id || user.id;
                    const isSelected = selectedParticipants.includes(userId);
                    return (
                      <TouchableOpacity
                        key={`matched-${index}`}
                        style={[styles.contactRow, isSelected && styles.selectedContact]}
                        onPress={() => onSelectUser(user)}
                      >
                        <Avatar size={45} uri={user.avatar} name={user.contactName || user.name} />
                        <View style={styles.contactInfo}>
                          <Typo fontWeight="500">{user.contactName || user.name}</Typo>
                          {user.contactName && user.contactName !== user.name && (
                            <Typo size={12} color={colors.neutral500}>{user.name}</Typo>
                          )}
                        </View>
                        {isGroupMode && (
                          <View style={styles.selectionIndicator}>
                            <View style={[styles.checkbox, isSelected && styles.checked]}>
                              {isSelected && <View style={styles.selectedDot} />}
                            </View>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}

              {/* All App Users */}
              {contacts.length > 0 && (
                <>
                  {/* Real Users Section */}
                  {contacts.filter(user => 
                    !matchedContacts.find(m => m._id === user._id) && 
                    !user.email.includes('sample') && 
                    !user.email.includes('test')
                  ).length > 0 && (
                    <>
                      <View style={styles.sectionHeader}>
                        <Typo size={14} fontWeight="600" color={colors.neutral600}>
                          {matchedContacts.length > 0 ? 'OTHER USERS' : 'REAL USERS'}
                        </Typo>
                      </View>
                      {contacts
                        .filter(user => 
                          !matchedContacts.find(m => m._id === user._id) && 
                          !user.email.includes('sample') && 
                          !user.email.includes('test')
                        )
                        .map((user: any, index) => {
                          const userId = user._id || user.id;
                          const isSelected = selectedParticipants.includes(userId);
                          return (
                            <TouchableOpacity
                              key={`real-${index}`}
                              style={[styles.contactRow, isSelected && styles.selectedContact]}
                              onPress={() => onSelectUser(user)}
                            >
                              <Avatar size={45} uri={user.avatar} name={user.name} />
                              <View style={styles.contactInfo}>
                                <Typo fontWeight="500">{user.name}</Typo>
                                <Typo size={12} color={colors.neutral500}>{user.email}</Typo>
                              </View>
                              {isGroupMode && (
                                <View style={styles.selectionIndicator}>
                                  <View style={[styles.checkbox, isSelected && styles.checked]}>
                                    {isSelected && <View style={styles.selectedDot} />}
                                  </View>
                                </View>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                    </>
                  )}

                  {/* Sample Data Section */}
                  {contacts.filter(user => 
                    !matchedContacts.find(m => m._id === user._id) && 
                    (user.email.includes('sample') || user.email.includes('test'))
                  ).length > 0 && (
                    <>
                      <View style={styles.sectionHeader}>
                        <Typo size={14} fontWeight="600" color={colors.neutral600}>
                          SAMPLE DATA
                        </Typo>
                      </View>
                      {contacts
                        .filter(user => 
                          !matchedContacts.find(m => m._id === user._id) && 
                          (user.email.includes('sample') || user.email.includes('test'))
                        )
                        .map((user: any, index) => {
                          const userId = user._id || user.id;
                          const isSelected = selectedParticipants.includes(userId);
                          return (
                            <TouchableOpacity
                              key={`sample-${index}`}
                              style={[styles.contactRow, isSelected && styles.selectedContact]}
                              onPress={() => onSelectUser(user)}
                            >
                              <Avatar size={45} uri={user.avatar} name={user.name} />
                              <View style={styles.contactInfo}>
                                <Typo fontWeight="500">{user.name}</Typo>
                                <Typo size={12} color={colors.neutral500}>{user.email}</Typo>
                              </View>
                              {isGroupMode && (
                                <View style={styles.selectionIndicator}>
                                  <View style={[styles.checkbox, isSelected && styles.checked]}>
                                    {isSelected && <View style={styles.selectedDot} />}
                                  </View>
                                </View>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                    </>
                  )}
                </>
              )}

              {!isLoadingContacts && contacts.length === 0 && (
                <View style={styles.emptyState}>
                  <Typo size={16} color={colors.neutral500}>
                    No users found
                  </Typo>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {isGroupMode && selectedParticipants.length >= 2 && (
          <View style={styles.createGroupButton}>
            <Button
              onPress={createGroup}
              disabled={!groupName.trim()}
              loading={isLoading}
            >
              <Typo fontWeight="bold" size={17}>
                Create Group
              </Typo>
            </Button>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NewConversationModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  groupInfoContainer: {
    paddingVertical: spacingY._20,
    paddingHorizontal: spacingX._20,
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.white,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  groupNameContainer: {
    width: '100%',
  },
  groupNameInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._12,
    paddingHorizontal: spacingX._20,
    fontSize: 16,
    color: colors.neutral900,
    backgroundColor: colors.white,
  },
  contactList: {
    paddingVertical: spacingY._10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacingY._40,
  },
  sectionHeader: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._10,
    backgroundColor: colors.neutral50,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
    gap: 12,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  selectedContact: {
    backgroundColor: colors.neutral100,
  },
  selectionIndicator: {
    marginLeft: 'auto',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    borderColor: '#FFC107',
    backgroundColor: colors.white,
  },
  selectedDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFC107',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacingY._40,
  },
  createGroupButton: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
});
