"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Linking,
  Clipboard,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback
} from "react-native"
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import ColorPalette from "../../constants/ColorPalette"
import MessageActions from "../../components/MessageActions"
import messagingService from "../../services/messagingService"
import LoadingIndicator from "../../components/common/LoadingIndicator"
import websocketManager from "../../utils/websocketManager"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNetworkStatus, processOfflineMessages } from "../../utils/networkUtils"

const MessageTypes = {
  TEXT: "text",
  LINK: "link",
  EMOJI: "emoji",
  FILE: "file",
}

// Define message cache keys
const MESSAGE_CACHE_KEY_PREFIX = 'message_cache_';
const CONVERSATION_CACHE_KEY_PREFIX = 'conversation_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// New: normalize server payload
function parseServerMessage(data) { // data is the raw object from JSON.parse(event.data)
  const m = data.message || data; // m is the core message part
  
  let finalId = m.id || m.message.id; 

  if (finalId === undefined || finalId === null) {
    console.error(
      "CRITICAL: Message ID is missing in processed payload. Original data:", 
      JSON.stringify(data), 
      "Processed m:", 
      JSON.stringify(m)
    );
    finalId = `error_missing_id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; 
  }

  return {
    id: finalId.toString(), 
    content: m.content,
    sender: {
      id: m.sender_id || m.sender?.id, 
      username: m.sender_username || m.sender?.username
    },
    created_at: m.created_at || m.timestamp,
    reply_to: m.reply_to ?? m.reply_to_id ?? null,
    // Check for file at top level of `data` or within `m`
    file: data.file || m.file || null 
  };
}

export default function ChatDetailScreen({ route, navigation }) {
  const { chat } = route.params
  const [message, setMessage] = useState("")
  const [conversationDetail, setConversationDetail] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const flatListRef = useRef(null)
  const [currentUserId, setCurrentUserId] = useState(null)

  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showActions, setShowActions] = useState(false)
  
  // WebSocket states
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [partnerStatus, setPartnerStatus] = useState('offline')
  const [partnerIsTyping, setPartnerIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)
  const [connectionError, setConnectionError] = useState(null)

  // State for local storage loading
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(true);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);
  
  // Track if we've already loaded messages from the API
  const hasLoadedFromApi = useRef(false);

  // Get current user ID
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user_data');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setCurrentUserId(userData.id);
        } else {
          // If no user data in AsyncStorage, try getting from chat object
          if (chat.currentUserId) {
            setCurrentUserId(chat.currentUserId);
          }
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    };
    
    getUserData();
  }, []);

  // Load cached messages first, then from API
  useEffect(() => {
    const loadDataFromCacheAndAPI = async () => {
      
      // After loading from cache, load fresh data from API
      loadConversation();
      loadMessages();
      
      setIsLoadingFromCache(false);
    };
    
    loadDataFromCacheAndAPI();
  }, []);
  
  // Cache management functions
  const loadCachedMessages = async () => {
    try {
      const cacheKey = `${MESSAGE_CACHE_KEY_PREFIX}${chat.id}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { messages: cachedMessages, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        
        // Only use cache if it's not expired
        if (cacheAge < CACHE_EXPIRY && cachedMessages && cachedMessages.length > 0) {
            const formattedMessages = cachedMessages.map(msg => ({
            ...msg,
            isSender: msg.sender?.id === currentUserId, // Ensure alignment based on sender
          }));
          setMessages(formattedMessages);
          setCacheTimestamp(timestamp);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading cached messages:', error);
      return false;
    }
  };
  
  const loadCachedConversation = async () => {
    try {
      const cacheKey = `${CONVERSATION_CACHE_KEY_PREFIX}${chat.id}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { conversation, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        
        // Only use cache if it's not expired
        if (cacheAge < CACHE_EXPIRY && conversation) {
          setConversationDetail(conversation);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading cached conversation:', error);
      return false;
    }
  };
  
  const cacheMessages = async (messagesToCache) => {
    try {
      const cacheKey = `${MESSAGE_CACHE_KEY_PREFIX}${chat.id}`;
      const cacheData = {
        messages: messagesToCache,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching messages:', error);
    }
  };
  
  const cacheConversation = async (conversationToCache) => {
    try {
      const cacheKey = `${CONVERSATION_CACHE_KEY_PREFIX}${chat.id}`;
      const cacheData = {
        conversation: conversationToCache,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching conversation:', error);
    }
  };

  // Update the loadConversation function
  const loadConversation = async () => {
    try {
      // Skip if we already have conversation details (from cache)
      if (conversationDetail && !hasLoadedFromApi.current) {
        hasLoadedFromApi.current = true;
        return;
      }
      
      const data = await messagingService.getConversationDetail(chat.id);
      setConversationDetail(data);
      
      // Cache the conversation data
      cacheConversation(data);
      
      // Update the header with participant name if available
      if (chat.participant && navigation) {
        const displayName = `${chat.participant.first_name || ''} ${chat.participant.last_name || ''}`.trim() || 
                          chat.participant.username;
        navigation.setOptions({ title: displayName });
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      setError("Failed to load conversation details");
    }
  };

  // Update the loadMessages function 
  const loadMessages = async (refresh = false) => {
    try {
      const currentPage = refresh ? 1 : page;
      const data = await messagingService.getConversationMessages(chat.id, currentPage);

      if (!data || !data.results) {
        console.error('Invalid message data:', data);
        throw new Error('Invalid response format');
      }

      const formattedMessages = data.results.map(msg => {
        if (!msg || !msg.id) {
          console.error('Invalid message format:', msg);
          return null;
        }

        const isSender = msg.sender?.id === currentUserId;
        return {
          id: msg.id.toString(),
          type: determineMessageType(msg),
          text: msg.content || '',
          isSender,
          timestamp: formatMessageTime(msg.created_at),
          status: determineMessageStatus(msg),
          sender: msg.sender || {},
          ...(msg.file && {
            file: {
              name: msg.file.name,
              size: formatFileSize(msg.file.size),
              type: msg.file.type,
              url: msg.file.url
            }
          })
        };
      }).filter(Boolean); // Remove any null messages

      let updatedMessages;
      if (refresh) {
        updatedMessages = formattedMessages;
      } else {
        // Filter out duplicates by checking if the message ID already exists
        const existingIds = new Set(messages.map(msg => msg.id));
        updatedMessages = [...messages, ...formattedMessages.filter(msg => !existingIds.has(msg.id))];
      }

      setMessages(updatedMessages);

      // Cache the updated messages
      if (updatedMessages.length > 0) {
        cacheMessages(updatedMessages);
      }
      
      setHasMoreMessages(data.next !== null);
      setPage(currentPage + 1);
    } catch (error) {
      console.error("Error loading messages:", error);
      setError(error.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };
  
  // Update WebSocket setup
  useEffect(() => {
    let retryTimeout;
    let unsubscribers = [];
    let isSubscribed = true;
    let connectionAttempts = 0;
    const MAX_CONNECTION_ATTEMPTS = 3;

    const setupWebSocket = async () => {
      if (!isSubscribed || connectionAttempts >= MAX_CONNECTION_ATTEMPTS) return;
      
      try {
        connectionAttempts++;
        const connected = await websocketManager.connect(chat.id);
        
        if (!connected) {
          throw new Error('Failed to connect');
        }

        // Reset connection attempts on successful connection
        connectionAttempts = 0;
        setConnectionError(null);

        unsubscribers = [
          websocketManager.on('message', (message) => {
            if (!isSubscribed) return;
            setMessages(prev => {
              // Replace optimistic message or add new one
              const index = prev.findIndex(m => 
                m.local_id === message.local_id || m.id === message.id
              );

              const formattedMessage = {
                id: message.id.toString(),
                type: determineMessageType(message),
                text: message.content,
                isSender: message.sender_id === currentUserId,
                timestamp: formatMessageTime(message.sent_at),
                status: message.status || 'sent',
                sender: message.sender
              };

              if (index > -1) {
                const updated = [...prev];
                updated[index] = formattedMessage;
                return updated;
              }
              return [formattedMessage, ...prev];
            });
          }),

          // Typing indicator handler
          websocketManager.on('typing', (data) => {
            if (data.user_id !== currentUserId) {
              setPartnerIsTyping(data.is_typing);
            }
          }),

          // Read receipt handler
          websocketManager.on('read', (data) => {
            if (data.user_id !== currentUserId) {
              setMessages(prev => prev.map(msg => 
                data.message_ids.includes(msg.id) 
                  ? { ...msg, status: 'read' }
                  : msg
              ));
            }
          }),

          // Connection status handler
          websocketManager.on('connection', (status) => {
            setIsConnected(status.status === 'connected');
          }),

          // Update user status handler
          websocketManager.on('user_status', (data) => {
            if (!isSubscribed) return;
            if (data.userId === chat.participant?.id) {
              setPartnerStatus(data.status);
              // Update typing state if user goes offline
              if (data.status === 'offline') {
                setPartnerIsTyping(false);
              }
            }
          }),
        ];
      } catch (error) {
        console.error('WebSocket setup error:', error);
        setConnectionError(
          connectionAttempts >= MAX_CONNECTION_ATTEMPTS
            ? 'Could not establish connection. Please try again later.'
            : 'Connection lost. Retrying...'
        );
        
        if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
          retryTimeout = setTimeout(setupWebSocket, 5000);
        }
      }
    };

    setupWebSocket();

    return () => {
      isSubscribed = false;
      clearTimeout(retryTimeout);
      unsubscribers.forEach(unsub => unsub?.());
      websocketManager.disconnect();
    };
  }, [chat.id, currentUserId, chat.participant?.id]);

  // Subscribe to message status updates from WebSocket
  useEffect(() => {
    const unsubscribeMessageStatus = websocketManager.on('message.status', (data) => {
      // Update the message whose ID matches the backend's message_id
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === data.message_id ? { ...msg, status: data.status, timestamp: data.timestamp } : msg
        )
      );
    });
    return () => {
      unsubscribeMessageStatus();
    };
  }, []);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim() || sendingMessage) return;

    const messageContent = message.trim();
    const tempId = `temp_${Date.now()}`;
    setMessage('');

    // Create optimistic message
    const optimisticMessage = {
      id: tempId,
      local_id: tempId,
      type: 'text',
      text: messageContent,
      isSender: true,
      timestamp: formatMessageTime(new Date().toISOString()),
      status: 'sending',
    };

    setMessages(prev => [optimisticMessage, ...prev]);

    try {
      // Clear typing indicator
      if (isTyping) {
        setIsTyping(false);
        websocketManager.sendTypingIndicator(false);
      }

      // Send via WebSocket
      const success = websocketManager.sendMessage(messageContent);

      if (!success) {
        // Message queued or failed - update UI accordingly
        setMessages(prev => prev.map(msg =>
          msg.id === tempId
            ? { ...msg, status: 'queued' }
            : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map (msg =>
        msg.id === tempId
          ? { ...msg, status: 'failed' }
          : msg
      ));
    }
  };

  // Replace existing typing timeout state declaration with a ref:
  const typingTimeoutRef = useRef(null);

  // Update handleTextChange to use the ref:
  const handleTextChange = (text) => {
    setMessage(text);

    if (text.trim() && !isTyping) {
      // User started typing
      setIsTyping(true);
      websocketManager.sendTypingIndicator(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      websocketManager.sendTypingIndicator(false);
    }, 3000);
  };

  // Add network status monitoring
  useNetworkStatus(
    // When connected
    () => {
      console.log('Network connected');
      
      // Attempt to reconnect WebSocket if needed
      if (conversationDetail && !isConnected) {
        websocketManager.connect(chat.id);
      }
      
      // Process any offline messages
      processOfflineMessages().then(result => {
        if (result.processed > 0) {
          console.log(`Processed ${result.processed} offline messages`);
          // Refresh messages to include the newly processed ones
          loadMessages(true);
        }
      });
    },
    // When disconnected
    () => {
      console.log('Network disconnected');
      // Notify user
      setConnectionError('You are offline. Messages will be sent when you reconnect.');
    }
  );

  // Add a function to mark messages as read
  const markMessagesAsRead = useCallback((messageIds) => {
    if (!messageIds || !messageIds.length || !isConnected) return;
    
    websocketManager.sendReadReceipts(messageIds);
  }, [isConnected]);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, []);

  // When this screen mounts, notify that current user is online and request statuses
  useEffect(() => {
    if (chat && websocketManager.ws?.readyState === WebSocket.OPEN) {
      websocketManager.send('user_status', {
        conversation_id: chat.id,
        status: 'online'
      });
      websocketManager.requestStatuses(); // Request statuses of other participants
    }

    // When unmounting, notify that current user is offline
    return () => {
      if (chat && websocketManager.ws?.readyState === WebSocket.OPEN) {
        websocketManager.send('user_status', {
          conversation_id: chat.id,
          status: 'offline'
        });
      }
    };
  }, [chat]);

  // Subscribe to user_status events for the participant
  useEffect(() => {
    const unsubscribe = websocketManager.on('user_status', (data) => {
      if (data.userId === chat.participant?.id) {
        setPartnerStatus(data.status);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chat.participant?.id]);

  const determineMessageType = (msg) => {
    if (msg.file) {
      return MessageTypes.FILE;
    } else if (msg.content && msg.content.match(/^https?:\/\//)) {
      return MessageTypes.LINK;
    } else if (msg.content && msg.content.match(/^[\p{Emoji}]+$/u)) {
      return MessageTypes.EMOJI;
    } else {
      return MessageTypes.TEXT;
    }
  };

  const determineMessageStatus = (msg) => {
    if (msg.read_by && msg.read_by.length > 0) {
      return "read";
    } else if (msg.delivered) {
      return "delivered";
    }
    return "sent";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    
    // Format as HH:MM
    let hours = messageDate.getHours();
    let minutes = messageDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    return hours + ':' + minutes + ampm;
  };

  const handleLongPress = (message) => {
    setSelectedMessage(message);
    setShowActions(true);
  };

  const handleReact = (reaction) => {
    // Here you would update the message with the reaction
    console.log(`Reacted with ${reaction} to message:`, selectedMessage);
    setShowActions(false);
  };

  const handleReply = () => {
    // Implement reply functionality
    setShowActions(false);
  };

  const handleThreadReply = () => {
    // Implement thread reply functionality
    setShowActions(false);
  };

  const handleCopy = () => {
    if (selectedMessage?.text) {
      Clipboard.setString(selectedMessage.text);
      Alert.alert("Copied", "Message copied to clipboard");
    }
    setShowActions(false);
  };

  const handleEdit = () => {
    // Implement edit functionality
    setShowActions(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setShowActions(false)
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await messagingService.deleteMessage(selectedMessage.id);
              // Remove the message from the state
              setMessages(prev => prev.filter (msg => msg.id !== selectedMessage.id));
              Alert.alert("Success", "Message deleted successfully");
            } catch (error) {
              console.error("Error deleting message:", error);
              Alert.alert("Error", "Failed to delete the message");
            } finally {
              setShowActions(false);
            }
          }
        }
      ]
    );
  };

  const renderMessageStatus = (status) => {
    if (!status) return null;

    if (status === "sent") {
      return <Feather name="check" size={14} color="#7A7A7A" />;
    } else if (status === "delivered") {
      return <Feather name="check-circle" size={14} color="#7A7A7A" />;
    } else if (status === "read") {
      return <Feather name="check-circle" size={14} color="#1AC1CA" />;
    }
    return null;
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.isSender;

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        delayLongPress={200}
        activeOpacity={0.8}
      >
        <View style={[styles.messageRow, isOwnMessage ? styles.senderRow : styles.receiverRow]}>
          <View style={styles.messageContainer}>
            <View
              style={[
                styles.messageBubble,
                isOwnMessage ? styles.senderBubble : styles.receiverBubble,
                { backgroundColor: isOwnMessage ? "#FFFFFF" : "#F0F0F0" }, // White for sender, light gray for others
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: isOwnMessage ? "#000000" : "#000000" }, // Black text for both
                ]}
              >
                {item.text}
              </Text>
            </View>
            <View style={[styles.messageFooter, isOwnMessage ? styles.senderFooter : styles.receiverFooter]}>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
              {isOwnMessage && renderMessageStatus(item.status)}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  const getFileIcon = (type) => {
    if (!type) return "file-outline";
    
    if (type.includes("pdf")) return "file-pdf-box";
    if (type.includes("word") || type.includes("doc")) return "file-word-box";
    if (type.includes("excel") || type.includes("sheet")) return "file-excel-box";
    if (type.includes("ppt") || type.includes("presentation")) return "file-powerpoint-box";
    if (type.includes("image")) return "file-image-box";
    if (type.includes("video")) return "file-video-box";
    if (type.includes("audio")) return "file-music-box";
    
    return "file-outline";
  };

  const getFileIconColor = (type) => {
    if (!type) return "#7A7A7A";
    
    if (type.includes("pdf")) return "#D93831";
    if (type.includes("word") || type.includes("doc")) return "#2B579A";
    if (type.includes("excel") || type.includes("sheet")) return "#217346";
    if (type.includes("ppt") || type.includes("presentation")) return "#D24726";
    if (type.includes("image")) return "#0078D7";
    if (type.includes("video")) return "#FF6D00";
    if (type.includes("audio")) return "#607D8B";
    
    return "#7A7A7A";
  };

  const renderFooter = () => {
    if (!loading) return null;
    return <LoadingIndicator style={styles.loadingFooter} />;
  };

  // Main UI rendering based on loading and error states
  if (loading && !messages.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <LoadingIndicator message="Loading conversation..." />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !messages.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMessages}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Determine display name for the header
  const displayName = chat.participant 
    ? `${chat.participant.first_name || ''} ${chat.participant.last_name || ''}`.trim() || chat.participant.username 
    : chat.username;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{displayName}</Text>
            <Text style={styles.headerSubtitle}>
              {partnerIsTyping
                ? 'Typing...'
                : partnerStatus === 'online'
                ? 'Online'
                : 'Offline'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Image
              source={{ uri: chat.participant?.profile_image || chat.profileImage }}
              style={styles.headerAvatar}
            />
            {partnerStatus === 'online' && <View style={styles.connectedIndicator} />}
          </View>
        </View>

        {/* Connection error banner */}
        {connectionError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{connectionError}</Text>
          </View>
        )}
        
        {/* Cache indicator */}
        {isLoadingFromCache && cacheTimestamp && (
          <View style={styles.cacheIndicator}>
            <Text style={styles.cacheText}>
              Showing cached messages. Loading latest...
            </Text>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          inverted={true}
          onEndReached={() => hasMoreMessages && !loading && loadMessages()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          onRefresh={() => loadMessages(true)}
          refreshing={loading && page === 1}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Feather name="paperclip" size={24} color="#7A7A7A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.commandButton}>
            <Feather name="zap" size={24} color="#7A7A7A" />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Send a message"
              placeholderTextColor="#7A7A7A"
              value={message}
              onChangeText={handleTextChange}
              multiline={true}
            />
          </View>
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!message.trim() || sendingMessage}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color={ColorPalette.accent} />
            ) : (
              <Ionicons 
                name="arrow-forward-circle" 
                size={24} 
                color={message.trim() ? ColorPalette.accent : "#7A7A7A"} 
              />
            )}
          </TouchableOpacity>
        </View>
        <MessageActions
          visible={showActions}
          onClose={() => setShowActions(false)}
          onReact={handleReact}
          onReply={handleReply}
          onThreadReply={handleThreadReply}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isOwnMessage={selectedMessage?.isSender}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: ColorPalette.dark_bg,
  },
  container: {
    flex: 1,
    backgroundColor: ColorPalette.dark_bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ColorPalette.dark_bg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: ColorPalette.dark_bg,
  },
  errorText: {
    fontFamily: 'CG-Medium',
    fontSize: 16,
    color: ColorPalette.text_white,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: ColorPalette.gradient_text,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  retryText: {
    fontFamily: 'CG-Medium',
    fontSize: 14,
    color: ColorPalette.text_white,
  },
  loadingFooter: {
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#101418",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    height: 56,
  },
  headerLeft: {
    width: 40,
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Platform.OS === "ios" ? "CG-Medium" : "CG-Medium",
    fontSize: 16,
    fontWeight: "800",
    color: ColorPalette.text_white,
  },
  headerSubtitle: {
    fontFamily: Platform.OS === "ios" ? "CG-Regular" : "CG-Regular",
    fontSize: 12,
    color: "#7A7A7A",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  connectedIndicator: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  errorBanner: {
    backgroundColor: '#AA0000',
    padding: 8,
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'CG-Regular',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 8,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  senderRow: {
    justifyContent: "flex-end",
  },
  receiverRow: {
    justifyContent: "flex-start",
  },
  messageContainer: {
    maxWidth: "70%",
  },
  messageBubble: {
    borderRadius: 16,
    padding: 8,
    paddingHorizontal: 16,
  },
  senderBubble: {
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 0,
  },
  receiverBubble: {
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 16,
  },
  messageText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "CG-Regular" : "CG-Regular",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  senderFooter: {
    justifyContent: "flex-end",
  },
  receiverFooter: {
    justifyContent: "flex-start",
  },
  timestamp: {
    fontSize: 12,
    color: "#7A7A7A",
    marginRight: 4,
    fontFamily: "CG-Regular",
  },
  linkContainer: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 8,
  },
  senderLinkContainer: {
    backgroundColor: ColorPalette.green,
    borderBottomRightRadius: 0,
  },
  receiverLinkContainer: {
    backgroundColor: "#101418",
    borderWidth: 1,
    borderColor: "#1C1E22",
    borderBottomLeftRadius: 0,
  },
  linkPreview: {
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  linkContent: {
    padding: 8,
  },
  linkTitle: {
    color: ColorPalette.text_white,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    fontFamily: "CG-Medium",
  },
  linkDescription: {
    color: ColorPalette.text_white,
    fontSize: 12,
    fontFamily: "CG-Regular",
  },
  emojiText: {
    fontSize: 50,
    marginRight: 8,
  },
  fileContainer: {
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
  },
  senderFileContainer: {
    backgroundColor: ColorPalette.green,
    borderBottomRightRadius: 0,
  },
  receiverFileContainer: {
    backgroundColor: "#1C1E22",
    borderBottomLeftRadius: 0,
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    margin: 4,
    borderRadius: 12,
    padding: 8,
  },
  fileIconContainer: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: ColorPalette.text_white,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "CG-Medium",
  },
  fileSize: {
    color: "#7A7A7A",
    fontSize: 11,
    fontFamily: "CG-Regular",
  },
  downloadButton: {
    padding: 4,
  },
  fileCaption: {
    padding: 8,
    paddingHorizontal: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101418",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  attachButton: {
    padding: 8,
  },
  commandButton: {
    padding: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#101418",
    borderWidth: 1,
    borderColor: "#1C1E22",
    borderRadius: 20,
    marginHorizontal: 8,
    maxHeight: 120,
  },
  input: {
    color: ColorPalette.text_white,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontFamily: Platform.OS === "ios" ? "CG-Regular" : "CG-Regular",
  },
  sendButton: {
    padding: 8,
  },
  
  // Add new styles
  failedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  failedText: {
    color: '#FF3B30',
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'CG-Regular',
  },
  cacheIndicator: {
    backgroundColor: '#1C1E22',
    padding: 8,
    borderRadius: 8,
    margin: 8,
  },
  cacheText: {
    color: '#7A7A7A',
    fontSize: 12,
    fontFamily: 'CG-Regular',
  },
});

