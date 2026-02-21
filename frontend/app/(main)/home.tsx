import { StyleSheet, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors, spacingX, spacingY, radius } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import Typo from '@/components/Typo';
import ConversationItem from '@/components/ConversationItem';
import Avatar from '@/components/Avatar';
import { ConversationProps, ResponseProps } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { getConversations, newConversation, newMessage, getContacts } from '@/socket/socketEvents';
import { getSocket } from '@/socket/socket';
import { fetchContactsFromAPI } from '@/services/contactsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'direct' | 'group'>('direct');
  const [conversations, setConversations] = useState<ConversationProps[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Monitor socket connection status
  useEffect(() => {
    const checkSocket = () => {
      const socket = getSocket();
      setSocketConnected(socket?.connected || false);
    };

    // Check immediately
    checkSocket();

    // Check every 2 seconds
    const interval = setInterval(checkSocket, 2000);

    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    console.log('[DEBUG] Home: Component mounted, setting up socket listeners');
    setLoading(true);
    
    // Setup socket listeners
    getConversations(processConversations);
    newConversation(newConversationHandler);
    getContacts(processContacts);

    // Listen for new messages to update lastMessage in conversations
    const handleNewMessage = (res: ResponseProps) => {
      console.log('[DEBUG] handleNewMessage:', res);
      if (res.success && res.data) {
        const { conversationId, content, createdAt, sender, attachment, id } = res.data;
        
        // Update the conversation's lastMessage or add new conversation
        setConversations((prev) => {
          const existingConv = prev.find(conv => conv._id === conversationId);
          
          if (existingConv) {
            // Update existing conversation
            console.log('[DEBUG] Updating existing conversation:', conversationId);
            return prev.map((conv) => 
              conv._id === conversationId
                ? {
                    ...conv,
                    lastMessage: {
                      _id: id,
                      content,
                      createdAt,
                      senderId: sender.id,
                      type: attachment ? 'image' as const : 'text' as const,
                      attachment,
                    },
                    updatedAt: createdAt,
                  }
                : conv
            );
          } else {
            // Conversation doesn't exist, fetch it
            console.log('[DEBUG] Conversation not found, refreshing list');
            getConversations(null);
            return prev;
          }
        });
      }
    };

    newMessage(handleNewMessage);

    // Emit requests - wait a bit to ensure socket is ready
    const socket = getSocket();
    if (socket && socket.connected) {
      console.log('[DEBUG] Home: Socket already connected, emitting requests');
      getConversations(null);
      getContacts(null);
    } else {
      console.log('[DEBUG] Home: Socket not connected yet, waiting...');
      // Also try to load from API as fallback
      loadContactsFromAPI();
      // Wait for connection
      const checkConnection = setInterval(() => {
        const s = getSocket();
        if (s && s.connected) {
          console.log('[DEBUG] Home: Socket connected, emitting requests');
          clearInterval(checkConnection);
          getConversations(null);
          getContacts(null);
        }
      }, 500);
      
      // Stop checking after 10 seconds
      setTimeout(() => clearInterval(checkConnection), 10000);
    }

    return () => {
      console.log('[DEBUG] Home: Cleaning up socket listeners');
      getConversations(processConversations, true);
      newConversation(newConversationHandler, true);
      newMessage(handleNewMessage, true);
      getContacts(processContacts, true);
    };
  }, []);

  const processContacts = (res: ResponseProps) => {
    console.log('[DEBUG] processContacts received:', res);
    setLoading(false);
    if (res.success) {
      setContacts(res.data || []);
      console.log('[DEBUG] Loaded', (res.data || []).length, 'contacts via socket');
      if (res.data && res.data.length > 0) {
        console.log('[DEBUG] Contact names:', res.data.map((c: any) => c.name).join(', '));
      }
    } else {
      console.log('[DEBUG] Failed to load contacts via socket:', res.msg);
      // Fallback: Try to load contacts from API
      loadContactsFromAPI();
    }
  };

  // Fallback function to load contacts from API
  const loadContactsFromAPI = async () => {
    try {
      console.log('[DEBUG] Loading contacts from API as fallback');
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('[DEBUG] No token found');
        return;
      }
      const apiContacts = await fetchContactsFromAPI(token);
      if (apiContacts && apiContacts.length > 0) {
        console.log('[DEBUG] Loaded', apiContacts.length, 'contacts from API');
        setContacts(apiContacts);
      }
    } catch (error) {
      console.error('[DEBUG] Error loading contacts from API:', error);
    }
  };



  const processConversations = (res: ResponseProps) => {
    console.log('[DEBUG] processConversations:', res);
    setLoading(false);
    if (res.success) {
      setConversations(res.data);
      console.log('[DEBUG] Loaded', res.data.length, 'conversations');
    } else {
      console.log('[DEBUG] Failed to load conversations:', res.msg);
    }
  };

  const newConversationHandler = (res: ResponseProps) => {
    console.log('[DEBUG] newConversationHandler:', res);
    if (res.success && res.data) {
      // Check if conversation already exists
      setConversations((prev) => {
        const exists = prev.some(conv => conv._id === res.data._id);
        if (exists) {
          console.log('[DEBUG] Conversation already exists, not adding');
          return prev;
        }
        console.log('[DEBUG] Adding new conversation:', res.data);
        return [res.data, ...prev];
      });
    }
  };

  const refreshConversations = async () => {
    console.log('[DEBUG] Home: Manual refresh triggered');
    setLoading(true);
    
    const socket = getSocket();
    if (socket && socket.connected) {
      console.log('[DEBUG] Home: Socket connected, fetching data');
      getConversations(null);
      getContacts(null);
      setTimeout(() => setLoading(false), 2000);
    } else {
      console.log('[DEBUG] Home: Socket not connected, attempting to reconnect...');
      try {
        const { connectSocket } = await import('@/socket/socket');
        await connectSocket();
        console.log('[DEBUG] Home: Reconnected successfully');
        getConversations(null);
        getContacts(null);
        setTimeout(() => setLoading(false), 2000);
      } catch (error) {
        console.error('[DEBUG] Home: Reconnection failed:', error);
        setLoading(false);
      }
    }
  };

  // Refresh conversations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('[DEBUG] Home: Screen focused, refreshing conversations');
      refreshConversations();
      
      // Return cleanup function
      return () => {
        console.log('[DEBUG] Home: Screen unfocused');
      };
    }, [])
  );

  const openProfile = () => {
    router.push('/(main)/profileModal');
  };

  const startConversationWithUser = async (contact: any) => {
    console.log('='.repeat(60));
    console.log('[DEBUG] === STARTING CONVERSATION ===');
    console.log('[DEBUG] Contact:', contact.name, '(', contact._id, ')');
    console.log('[DEBUG] Current user:', user?.name, '(', user?.id, ')');
    
    try {
      // Check if conversation already exists
      const existingConv = conversations.find((conv: ConversationProps) => {
        if (conv.type !== 'direct') return false;
        return conv.participants.some((p: any) => p._id === contact._id);
      });

      if (existingConv) {
        console.log('[DEBUG] Found existing conversation:', existingConv._id);
        // Navigate to existing conversation
        router.push({
          pathname: "/(main)/conversation" as any,
          params: {
            id: existingConv._id,
            name: contact.name,
            avatar: contact.avatar || '',
            type: "direct",
            participants: JSON.stringify(existingConv.participants),
          },
        });
      } else {
        console.log('[DEBUG] No existing conversation, creating new one via socket...');
        // Create new conversation via socket
        const socket = getSocket();
        if (!socket || !socket.connected) {
          console.error('[DEBUG] Socket not connected');
          Alert.alert('Connection Error', 'Cannot connect to server. Please try again.');
          return;
        }

        // Emit newConversation event directly
        socket.emit('newConversation', {
          type: 'direct',
          participants: [user?.id, contact._id],
        });

        // Listen for response
        const handleNewConversation = (response: ResponseProps) => {
          console.log('[DEBUG] newConversation response:', response);
          if (response.success && response.data) {
            // Remove listener
            socket.off('newConversation', handleNewConversation);
            
            // Navigate to new conversation
            router.push({
              pathname: "/(main)/conversation" as any,
              params: {
                id: response.data._id,
                name: contact.name,
                avatar: contact.avatar || '',
                type: "direct",
                participants: JSON.stringify(response.data.participants),
              },
            });
          } else {
            console.error('[DEBUG] Failed to create conversation:', response.msg);
            socket.off('newConversation', handleNewConversation);
            Alert.alert('Error', response.msg || 'Failed to create conversation');
          }
        };

        socket.on('newConversation', handleNewConversation);
      }
    } catch (error) {
      console.error('[DEBUG] Error in startConversationWithUser:', error);
      Alert.alert('Error', String(error));
    }
    console.log('='.repeat(60));
  };

  // Show all users in direct messages, not just those without conversations
  const allUsers = contacts;

  // Separate conversations by type and sort by most recent
  const groupConversations = conversations
    .filter((item: ConversationProps) => item.type === "group")
    .sort((a: ConversationProps, b: ConversationProps) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });



  const renderList = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <Typo size={16} color={colors.neutral600}>
            Loading...
          </Typo>
        </View>
      );
    }

    if (!socketConnected) {
      return (
        <View style={styles.centerContainer}>
          <Typo size={16} color={colors.rose} style={{ textAlign: 'center', marginBottom: 10 }}>
            Connection issue
          </Typo>
          <Typo size={14} color={colors.neutral600} style={{ textAlign: 'center', marginBottom: 20 }}>
            Cannot connect to server. Make sure backend is running.
          </Typo>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshConversations}
          >
            <Typo size={14} fontWeight="600" color={colors.white}>
              Retry Connection
            </Typo>
          </TouchableOpacity>
        </View>
      );
    }

    // Prepare data for FlatList based on selected tab
    const listData = selectedTab === 'direct' ? allUsers : groupConversations;

    if (listData.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Typo size={16} color={colors.neutral600}>
            {selectedTab === 'direct' ? 'No users available' : 'No groups yet'}
          </Typo>
        </View>
      );
    }

    return (
      <FlatList
        data={listData}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item, index }) => {
          if (selectedTab === 'direct') {
            // Check if there's an existing conversation with this user
            const existingConv = conversations.find((conv: ConversationProps) => {
              if (conv.type !== 'direct') return false;
              return conv.participants.some((p: any) => p._id === item._id);
            });

            if (existingConv) {
              // Show as conversation item
              return (
                <ConversationItem
                  item={existingConv}
                  router={router}
                  showDivider={index < listData.length - 1}
                />
              );
            } else {
              // Show as available user
              return (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => {
                    console.log('[DEBUG] TOUCH DETECTED for:', item.name);
                    startConversationWithUser(item);
                  }}
                  onPressIn={() => console.log('[DEBUG] PRESS IN:', item.name)}
                  activeOpacity={0.7}
                >
                  <Avatar size={50} uri={item.avatar} />
                  <View style={styles.userInfo}>
                    <Typo size={16} fontWeight="600" color={colors.neutral900}>
                      {item.name}
                    </Typo>
                    <Typo size={14} color={colors.neutral500}>
                      Tap to start chatting
                    </Typo>
                  </View>
                  <Feather name="arrow-right" size={20} color={colors.neutral400} />
                </TouchableOpacity>
              );
            }
          } else {
            // Group conversation
            return (
              <ConversationItem
                item={item}
                router={router}
                showDivider={index < listData.length - 1}
              />
            );
          }
        }}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Typo size={18} fontWeight="400" color={colors.white}>
              Welcome back, <Typo size={18} fontWeight="700" color={colors.white}>{user?.name || 'User'}</Typo> 👑
            </Typo>
            <TouchableOpacity onPress={openProfile}>
              <Feather name="settings" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'direct' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('direct')}
            >
              <Typo
                size={14}
                fontWeight="600"
                color={selectedTab === 'direct' ? colors.neutral900 : colors.neutral500}
              >
                Direct Messages
              </Typo>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'group' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('group')}
            >
              <Typo
                size={14}
                fontWeight="600"
                color={selectedTab === 'group' ? colors.neutral900 : colors.neutral500}
              >
                Groups
              </Typo>
            </TouchableOpacity>
          </View>

          {renderList()}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
    paddingBottom: 65,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginHorizontal: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
    paddingBottom: spacingY._15,
    gap: 12,
    justifyContent: 'center',
  },
  tab: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._10,
    borderRadius: radius._20,
    backgroundColor: colors.neutral100,
  },
  activeTab: {
    backgroundColor: colors.primaryLight,
  },
  conversationList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacingY._60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacingX._40,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
    gap: spacingX._12,
  },
  userInfo: {
    flex: 1,
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: spacingX._20 + 50 + spacingX._12,
    right: spacingX._20,
    height: 1,
    backgroundColor: colors.neutral200,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
    borderRadius: radius._20,
  },
});
