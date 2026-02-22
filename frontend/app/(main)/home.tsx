import { StyleSheet, View, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
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
import { fetchContactsFromAPI, fetchConversationsFromAPI } from '@/services/contactsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const Home = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { isOnline } = useOnlineStatus();
  const [selectedTab, setSelectedTab] = useState<'direct' | 'group'>('direct');
  const [conversations, setConversations] = useState<ConversationProps[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Instant load - load from cache immediately, then refresh
  useEffect(() => {
    console.log('[DEBUG] Home: Component mounted');
    
    // Step 1: Load cached data INSTANTLY (no waiting)
    loadCachedData();
    
    // Step 2: Fetch fresh data in background
    fetchFreshData();
    
    // Step 3: Setup socket for real-time updates
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  // Instant load from cache
  const loadCachedData = async () => {
    try {
      const { getCachedContacts, getCachedConversations } = await import('@/utils/network');
      const [cachedContacts, cachedConversations] = await Promise.all([
        getCachedContacts(),
        getCachedConversations()
      ]);
      
      if (cachedContacts && cachedContacts.length > 0) {
        console.log('[DEBUG] Home: Loaded', cachedContacts.length, 'contacts from cache');
        setContacts(cachedContacts);
      }
      
      if (cachedConversations && cachedConversations.length > 0) {
        console.log('[DEBUG] Home: Loaded', cachedConversations.length, 'conversations from cache');
        setConversations(cachedConversations);
      }
    } catch (error) {
      console.log('[DEBUG] Home: Error loading cache:', error);
    }
  };

  // Fetch fresh data from API (non-blocking)
  const fetchFreshData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('[DEBUG] Home: No token found');
        return;
      }

      const { fetchContactsFromAPI, fetchConversationsFromAPI } = await import('@/services/contactsService');
      
      // Fetch in parallel
      const [apiContacts, apiConversations] = await Promise.all([
        fetchContactsFromAPI(token, 1), // 1 retry only for speed
        fetchConversationsFromAPI(token)
      ]);

      console.log('[DEBUG] Home: Fresh data -', apiContacts?.length || 0, 'contacts,', apiConversations?.length || 0, 'conversations');

      if (apiContacts && apiContacts.length > 0) {
        setContacts(apiContacts);
      }

      if (apiConversations && apiConversations.length > 0) {
        setConversations(apiConversations);
      }
    } catch (error) {
      console.log('[DEBUG] Home: Error fetching fresh data:', error);
    }
  };

  // Setup socket listeners for real-time updates
  const setupSocketListeners = () => {
    getConversations(processConversations);
    newConversation(newConversationHandler);
    getContacts(processContacts);

    const handleNewMessage = (res: ResponseProps) => {
      if (res.success && res.data) {
        const { conversationId, content, createdAt, sender, attachment, id } = res.data;
        const isMyMessage = sender.id === user?.id;
        
        setConversations((prev) => {
          const existingConv = prev.find(conv => conv._id === conversationId);
          if (existingConv) {
            const updatedConv = {
              ...existingConv,
              lastMessage: { _id: id, content, createdAt, senderId: sender.id, type: attachment ? 'image' as const : 'text' as const, attachment },
              updatedAt: createdAt,
              unreadCount: isMyMessage ? existingConv.unreadCount : (existingConv.unreadCount || 0) + 1,
            };
            const filtered = prev.filter(c => c._id !== conversationId);
            return [updatedConv, ...filtered];
          }
          return prev;
        });
      }
    };

    newMessage(handleNewMessage);
    
    const socket = getSocket();
    if (socket) {
      socket.on('markAsRead', (res: ResponseProps) => {
        if (res.success && res.data?.conversationId) {
          setConversations(prev => prev.map(c => c._id === res.data.conversationId ? { ...c, unreadCount: 0 } : c));
        }
      });
    }
  };

  const cleanupSocketListeners = () => {
    getConversations(processConversations, true);
    newConversation(newConversationHandler, true);
    getContacts(processContacts, true);
    newMessage(() => {}, true);
  };

  const processContacts = (res: ResponseProps) => {
    console.log('[DEBUG] processContacts received:', res);
    if (res.success) {
      setContacts(res.data || []);
      console.log('[DEBUG] Loaded', (res.data || []).length, 'contacts via socket');
    }
  };

  // Fallback function to load contacts and conversations from API
  const loadContactsFromAPI = async () => {
    try {
      console.log('[DEBUG] Loading contacts and conversations from API');
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('[DEBUG] No token found');
        return;
      }
      
      // Fetch both contacts and conversations in parallel
      const [apiContacts, apiConversations] = await Promise.all([
        fetchContactsFromAPI(token),
        fetchConversationsFromAPI(token)
      ]);
      
      console.log('[DEBUG] API returned:', apiContacts?.length || 0, 'contacts');
      console.log('[DEBUG] API returned:', apiConversations?.length || 0, 'conversations');
      
      if (apiContacts && apiContacts.length > 0) {
        console.log('[DEBUG] Loaded', apiContacts.length, 'contacts from API');
        console.log('[DEBUG] Contact names:', apiContacts.map((c: any) => c.name).join(', '));
        setContacts(apiContacts);
      } else {
        console.log('[DEBUG] No contacts returned from API');
        // Still show cached if available
        setContacts(apiContacts || []);
      }
      
      if (apiConversations && apiConversations.length > 0) {
        console.log('[DEBUG] Loaded', apiConversations.length, 'conversations from API');
        // Update conversations list - merge with existing or replace
        setConversations((prev) => {
          const existingIds = new Set(prev.map(c => c._id));
          const newConversations = apiConversations.filter((c: any) => !existingIds.has(c._id));
          return [...newConversations, ...prev];
        });
      } else {
        console.log('[DEBUG] No conversations returned from API');
      }
    } catch (error) {
      console.error('[DEBUG] Error loading data from API:', error);
    }
  };



  const processConversations = (res: ResponseProps) => {
    console.log('[DEBUG] processConversations:', res);
    if (res.success) {
      setConversations(res.data);
      console.log('[DEBUG] Loaded', res.data.length, 'conversations');
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
    
    // Always try API first (more reliable)
    await loadContactsFromAPI();
    
    const socket = getSocket();
    if (socket && socket.connected) {
      console.log('[DEBUG] Home: Socket connected, fetching conversations');
      getConversations(null);
      getContacts(null); // Also try socket as backup
      setTimeout(() => setLoading(false), 1000);
    } else {
      console.log('[DEBUG] Home: Socket not connected, attempting to reconnect...');
      try {
        const { connectSocket } = await import('@/socket/socket');
        await connectSocket();
        console.log('[DEBUG] Home: Reconnected successfully');
        getConversations(null);
        getContacts(null);
        setTimeout(() => setLoading(false), 1000);
      } catch (error) {
        console.error('[DEBUG] Home: Reconnection failed:', error);
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    console.log('[DEBUG] Home: Pull-to-refresh triggered');
    setRefreshing(true);
    await loadContactsFromAPI();
    
    const socket = getSocket();
    if (socket && socket.connected) {
      getConversations(null);
      getContacts(null);
    }
    
    setRefreshing(false);
  };

  // Refresh conversations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('[DEBUG] Home: Screen focused, refreshing conversations');
      
      // Fetch conversations from socket
      const socket = getSocket();
      if (socket && socket.connected) {
        console.log('[DEBUG] Home: Socket connected, fetching conversations');
        getConversations(null);
      } else {
        console.log('[DEBUG] Home: Socket not connected, will retry');
        // Try to reconnect
        setTimeout(() => {
          const s = getSocket();
          if (s && s.connected) {
            getConversations(null);
          }
        }, 1000);
      }
      
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
        
        // Reset unread count locally
        setConversations(prev =>
          prev.map(c =>
            c._id === existingConv._id
              ? { ...c, unreadCount: 0 }
              : c
          )
        );
        
        // Navigate to existing conversation
        router.push({
          pathname: "/conversation",
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
          console.log('[DEBUG] Socket not connected, attempting to reconnect...');
          
          // Try to reconnect
          try {
            const { connectSocket } = await import('@/socket/socket');
            await connectSocket();
            const newSocket = getSocket();
            
            if (!newSocket || !newSocket.connected) {
              Alert.alert('Connection Error', 'Cannot connect to server. Please check your internet connection and try again.');
              return;
            }
            
            // Continue with the connected socket
            createNewConversation(newSocket, contact);
          } catch (error) {
            console.error('[DEBUG] Reconnection failed:', error);
            Alert.alert('Connection Error', 'Cannot connect to server. Please try again.');
            return;
          }
        } else {
          createNewConversation(socket, contact);
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error in startConversationWithUser:', error);
      Alert.alert('Error', String(error));
    }
    console.log('='.repeat(60));
  };

  const createNewConversation = (socket: any, contact: any) => {
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
          pathname: "/conversation",
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
  };

  // Separate conversations by type and sort by most recent
  const directConversations = conversations
    .filter((item: ConversationProps) => item.type === "direct")
    .sort((a: ConversationProps, b: ConversationProps) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  const groupConversations = conversations
    .filter((item: ConversationProps) => item.type === "group")
    .sort((a: ConversationProps, b: ConversationProps) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  // Contacts who DON'T have a conversation yet (shown below active chats)
  const contactsWithoutConversation = contacts.filter(contact =>
    !conversations.some((conv: ConversationProps) =>
      conv.type === 'direct' &&
      conv.participants.some((p: any) => p._id === contact._id)
    )
  );

  // Debug logging
  if (contactsWithoutConversation.length > 0) {
    console.log('[DEBUG] Contacts without conversation:', contactsWithoutConversation.map(c => ({ id: c._id, name: c.name, email: c.email })));
  }

  // Final merged list: active chats first (sorted), then unused contacts
  const directListData = [...directConversations, ...contactsWithoutConversation];



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

    // Show empty state only if we have no data at all
    if (directListData.length === 0 && groupConversations.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Typo size={16} color={colors.neutral600} style={{ textAlign: 'center' }}>
            {selectedTab === 'direct' ? 'No other users found' : 'No groups yet'}
          </Typo>
          <Typo size={14} color={colors.neutral500} style={{ textAlign: 'center', marginTop: 8 }}>
            {selectedTab === 'direct' ? 'Register another account to chat' : ''}
          </Typo>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshConversations}
          >
            <Typo size={14} fontWeight="600" color={colors.white}>
              Refresh
            </Typo>
          </TouchableOpacity>
        </View>
      );
    }

    // Prepare data for FlatList based on selected tab
    const listData = selectedTab === 'direct' ? directListData : groupConversations;

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item, index }) => {
          if (selectedTab === 'direct') {
            // Check if this item is a conversation (has participants array from DB)
            if (item.participants && item.lastMessage !== undefined) {
              // It's a conversation - show with ConversationItem
              return (
                <ConversationItem
                  item={item}
                  router={router}
                  showDivider={index < listData.length - 1}
                />
              );
            } else {
              // It's a plain contact (no conversation yet)
              return (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => {
                    console.log('[DEBUG] TOUCH DETECTED for:', item.name);
                    startConversationWithUser(item);
                  }}
                  activeOpacity={0.7}
                >
                  <Avatar 
                    size={52} 
                    uri={item.avatar}
                    showOnline={true}
                    isOnline={isOnline(item._id)}
                  />
                  <View style={styles.userInfo}>
                    <Typo size={16} fontWeight="600" color={colors.neutral900}>
                      {item.name || item.email || 'Unknown User'}
                    </Typo>
                    <Typo size={13} color={colors.neutral400}>
                      Tap to start chatting
                    </Typo>
                  </View>
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

  const openNewGroupModal = () => {
    router.push({
      pathname: '/newConversationModal',
      params: { isGroup: '1' }
    });
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

        {/* Floating Action Button - Only show on Groups tab */}
        {selectedTab === 'group' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={openNewGroupModal}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={28} color={colors.white} />
          </TouchableOpacity>
        )}
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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
