"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Animated,
  Alert
} from "react-native"
import { Feather } from "@expo/vector-icons"
import ColorPalette from "../../constants/ColorPalette"
import ChatItem from "../../components/ChatItem"
import GroupChatItem from "../../components/GroupChatItem"
import { useNavigation } from "@react-navigation/native"
import LoadingIndicator from "../../components/common/LoadingIndicator"
import messagingService from "../../services/messagingService"
import AsyncStorage from '@react-native-async-storage/async-storage'
import Header, { HEADER_HEIGHT } from "../../components/Header"
import ScreenLayout from "../../components/layout/ScreenLayout"
import CustomDialog from "../../components/CustomDialog"
import { useNetworkStatus, processOfflineMessages, getOfflineMessageCount } from '../../utils/networkUtils';
import websocketManager from '../../utils/websocketManager';

// Create animated FlatList component
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function MessagingScreen() {
  const [activeTab, setActiveTab] = useState("Messages")
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [groupChats, setGroupChats] = useState([])
  const [currentWorkspace, setCurrentWorkspace] = useState(null)
  const [error, setError] = useState(null)
  const [isOnline, setIsOnline] = useState(true);
  const [pendingMessagesCount, setPendingMessagesCount] = useState(0);
  const [userStatuses, setUserStatuses] = useState(new Map());
  const navigation = useNavigation()
  
  // State for deletion confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Animation related states
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const isScrolling = useRef(false);
  const scrollEndTimeout = useRef(null);

  // Load current workspace from AsyncStorage
  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const storedWorkspace = await AsyncStorage.getItem('selectedWorkspace');
        if (storedWorkspace) {
          setCurrentWorkspace(JSON.parse(storedWorkspace));
        }
      } catch (error) {
        console.error('Error loading workspace from storage:', error);
      }
    };
    
    loadWorkspace();
  }, []);

  // Load conversations when screen is focused
  useEffect(() => {
    loadConversations();
    
    // Also set up a refresh handler when returning to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadConversations();
    });
    
    return unsubscribe;
  }, [navigation]);

  // Enhanced cleanup for animations
  useEffect(() => {
    return () => {
      scrollY.setValue(0);
      headerTranslateY.setValue(0);
      isScrolling.current = false;
      if (scrollEndTimeout.current) {
        clearTimeout(scrollEndTimeout.current);
      }
    };
  }, []);

  // Monitor network status
  useNetworkStatus(
    // Connected callback
    async () => {
      setIsOnline(true);
      
      // Process any pending messages when coming online
      const result = await processOfflineMessages();
      if (result.processed > 0) {
        // Refresh the conversations list to show updated messages
        loadConversations();
      }
      
      // Update pending messages count
      const count = await getOfflineMessageCount();
      setPendingMessagesCount(count);
    },
    // Disconnected callback
    () => {
      setIsOnline(false);
      
      // Get offline message count
      getOfflineMessageCount().then(count => {
        setPendingMessagesCount(count);
      });
    }
  );

  useEffect(() => {
    // Subscribe to user_status events from WebSocket
    const unsubscribe = websocketManager.on('user_status', (data) => {
      setConversations((prevConversations) =>
        prevConversations.map((conversation) => {
          const otherParticipant = conversation.participants?.find(
            (p) => p.id === data.userId
          );
          if (otherParticipant) {
            return {
              ...conversation,
              isOnline: data.status === 'online',
            };
          }
          return conversation;
        })
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await messagingService.getConversations();

      // Get current user ID to determine which participant is the other person
      const userDataString = await AsyncStorage.getItem('user_data');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const currentUserId = userData?.id;

      // Format the data to match our ChatItem component
      const formattedConversations = data.map(conversation => {
        const otherParticipant = conversation.participants?.find(p => p.id !== currentUserId);

        return {
          ...conversation,
          isOnline: messagingService.getUserStatus(otherParticipant?.id)?.status === 'online', // Use synchronized status
          id: conversation.id,
          username: otherParticipant 
            ? `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() || otherParticipant.username
            : 'Unknown User',
          profileImage: otherParticipant?.profile_image || 'https://randomuser.me/api/portraits/men/1.jpg',
          lastMessage: conversation.last_message?.content || 'No messages yet',
          time: formatMessageTime(conversation.last_message?.created_at),
          unreadCount: conversation.unread_count || 0,
          participant: otherParticipant,
          currentUserId: currentUserId
        };
      });

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = (conversation) => {
    // Show deletion confirmation dialog
    setSelectedConversation(conversation);
    setShowDeleteDialog(true);
  };

  const confirmDeleteConversation = async () => {
    if (!selectedConversation || deleting) return;
    
    setDeleting(true);
    try {
      await messagingService.deleteConversation(selectedConversation.id);
      
      // Update local state to remove the deleted conversation
      setConversations(prev => 
        prev.filter(c => c.id !== selectedConversation.id)
      );
      
      // Show success message
      Alert.alert("Success", "Conversation deleted successfully");
    } catch (error) {
      console.error('Error deleting conversation:', error);
      Alert.alert("Error", "Failed to delete the conversation. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setSelectedConversation(null);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Today - show time
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'yesterday';
    } else if (diffInDays < 7) {
      // This week - show day name
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[messageDate.getDay()];
    } else {
      // Older - show date
      return messageDate.toLocaleDateString();
    }
  };

  const handleFabPress = () => {
    if (activeTab === "Messages") {
      navigation.navigate("Contacts")
    } else {
      navigation.navigate("NewGroup")
    }
  };
  
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: true,
      listener: ({ nativeEvent }) => {
        if (isScrolling.current) return;

        const currentOffset = nativeEvent.contentOffset.y;
        const diff = currentOffset - lastOffset.current;

        // Clear any existing timeout
        if (scrollEndTimeout.current) {
          clearTimeout(scrollEndTimeout.current);
        }

        // Set a new timeout
        scrollEndTimeout.current = setTimeout(() => {
          lastOffset.current = currentOffset;
        }, 100);

        if (currentOffset <= 0) {
          Animated.spring(headerTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0
          }).start();
        } else if (Math.abs(diff) > 5) { // Increased threshold
          isScrolling.current = true;
          Animated.spring(headerTranslateY, {
            toValue: diff > 0 ? -HEADER_HEIGHT : 0,
            useNativeDriver: true,
            bounciness: 0
          }).start(() => {
            isScrolling.current = false;
          });
        }
      }
    }
  );

  // Keep the dummy group data for now
  const dummyGroups = [
    {
      id: "g1",
      groupName: "FYP",
      groupImage: "https://randomuser.me/api/portraits/men/1.jpg",
      lastMessageSender: "Kevin",
      lastMessage: "Hey everyone, meeting...",
      time: "10:15",
      unreadCount: 5,
      memberCount: 8,
    },
    {
      id: "g2",
      groupName: "Web3 Developers",
      groupImage: null,
      lastMessageSender: "Sarah",
      lastMessage: "Check out this new fr...",
      time: "Yesterday",
      unreadCount: 2,
      memberCount: 24,
    },
    {
      id: "g3",
      groupName: "Design Team",
      groupImage: "https://randomuser.me/api/portraits/women/2.jpg",
      lastMessageSender: "Michael",
      lastMessage: "I've uploaded the new...",
      time: "Yesterday",
      unreadCount: 0,
      memberCount: 6,
    },
    {
      id: "g4",
      groupName: "Crypto Enthusiasts",
      groupImage: null,
      lastMessageSender: "Alex",
      lastMessage: "Bitcoin is going up again!",
      time: "Monday",
      unreadCount: 0,
      memberCount: 42,
    },
  ];

  const renderEmptyState = () => {
    if (loading) {
      return <LoadingIndicator message="Loading conversations..." />;
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadConversations}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Offline state
    if (!isOnline) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="wifi-off" size={50} color={ColorPalette.grey_text} />
          <Text style={styles.emptyText}>
            You're offline. Messages will be sent when you reconnect.
          </Text>
          {pendingMessagesCount > 0 && (
            <Text style={styles.pendingText}>
              {pendingMessagesCount} {pendingMessagesCount === 1 ? 'message' : 'messages'} pending
            </Text>
          )}
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Feather name="message-circle" size={50} color={ColorPalette.grey_text} />
        <Text style={styles.emptyText}>
          {activeTab === "Messages" ? "No conversations yet" : "No groups yet"}
        </Text>
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={() => activeTab === "Messages" ? navigation.navigate("Contacts") : navigation.navigate("NewGroup")}
        >
          <Text style={styles.startButtonText}>
            {activeTab === "Messages" ? "Start a conversation" : "Create a group chat"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSearchIcon = () => (
    <Feather name="search" size={22} color="#FFFFFF" />
  );

  return (
    <ScreenLayout 
      backgroundColor={ColorPalette.dark_bg} 
      statusBarStyle="light-content"
    >
      <Header 
        title="Chats"
        rightIcon={renderSearchIcon()}
        onRightPress={() => console.log("Search pressed")}
        animatedStyle={{ transform: [{ translateY: headerTranslateY }] }}
      />

      {/* Network Status Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Feather name="wifi-off" size={16} color="#FFFFFF" />
          <Text style={styles.offlineText}>
            You're offline. {pendingMessagesCount > 0 && `${pendingMessagesCount} pending message${pendingMessagesCount !== 1 ? 's' : ''}.`}
          </Text>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { marginTop: HEADER_HEIGHT+14 }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Messages" && styles.activeTabButton]}
          onPress={() => setActiveTab("Messages")}
        >
          <Text style={[styles.tabText, activeTab === "Messages" && styles.activeTabText]}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "Groups" && styles.activeTabButton]}
          onPress={() => setActiveTab("Groups")}
        >
          <Text style={[styles.tabText, activeTab === "Groups" && styles.activeTabText]}>Groups</Text>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      {activeTab === "Messages" ? (
        <AnimatedFlatList
          data={conversations}
          keyExtractor={(item) => `chat-${item.id}`}
          renderItem={({ item }) => (
            <ChatItem 
              chat={item} 
              onPress={() => navigation.navigate("ChatDetail", { chat: item })}
              onLongPress={handleDeleteConversation}
            />
          )}
          style={styles.chatList}
          contentContainerStyle={[
            styles.listContainer,
            { paddingTop: 10 } // Add some padding to avoid content under tabs
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          onRefresh={loadConversations}
          refreshing={loading}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      ) : (
        <AnimatedFlatList
          data={groupChats}
          keyExtractor={(item) => `group-${item.id}`}
          renderItem={({ item }) => (
            <GroupChatItem group={item} onPress={() => navigation.navigate("GroupChatDetail", { group: item })} />
          )}
          style={styles.chatList}
          contentContainerStyle={[
            styles.listContainer,
            { paddingTop: 10 } // Add some padding to avoid content under tabs
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
        <Feather name="edit-2" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      
      {/* Delete Confirmation Dialog */}
      <CustomDialog
        visible={showDeleteDialog}
        title="Delete Conversation"
        message={`Are you sure you want to delete this conversation with ${selectedConversation?.username}? This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={confirmDeleteConversation}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedConversation(null);
        }}
        type="destructive"
      />
    </ScreenLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.dark_bg,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 28,
    backgroundColor: ColorPalette.text_light_2,
    borderRadius: 100,
    height: 60,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  activeTabButton: {
    backgroundColor: ColorPalette.green,
  },
  tabText: {
    fontFamily: Platform.OS === "ios" ? "CG-Medium" : "CG-Medium",
    fontSize: 16,
    color: ColorPalette.text_black,
  },
  activeTabText: {
    color: ColorPalette.text_white,
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 28,
  },
  listContainer: {
    flexGrow: 1,
  },
  fab: {
    position: "absolute",
    bottom: 50,
    right: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ColorPalette.green,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontFamily: "CG-Medium",
    fontSize: 16,
    color: ColorPalette.grey_text,
    marginTop: 12,
    textAlign: "center",
  },
  startButton: {
    marginTop: 20,
    backgroundColor: ColorPalette.green,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  startButtonText: {
    fontFamily: "CG-Medium",
    fontSize: 14,
    color: ColorPalette.text_white,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: ColorPalette.green,
  },
  retryText: {
    fontFamily: "CG-Medium",
    fontSize: 14,
    color: ColorPalette.text_white,
  },
  offlineBanner: {
    backgroundColor: '#AA0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginBottom: 10,
  },
  offlineText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: "CG-Regular",
    fontSize: 14,
  },
  pendingText: {
    fontFamily: "CG-Medium",
    fontSize: 14,
    color: ColorPalette.green,
    marginTop: 8,
  },
})

