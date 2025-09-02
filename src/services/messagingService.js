import axios from 'axios';
import { BASE_URL, MESSAGING_ENDPOINTS } from '../constants/ApiConstants';
import { getStoredTokens } from './tokenService';
import websocketManager from '../utils/websocketManager';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_MESSAGES_KEY = '@offline_messages';

class MessagingService {
  constructor() {
    this.userStatuses = new Map();
  }

  updateUserStatus(userId, status) {
    this.userStatuses.set(userId, {
      status,
      lastUpdated: new Date().toISOString()
    });
  }

  getUserStatus(userId) {
    return this.userStatuses.get(userId) || { status: 'offline', lastUpdated: null };
  }

  synchronizeUserStatuses(participants) {
    return participants.map(participant => ({
      ...participant,
      isOnline: this.getUserStatus(participant.id)?.status === 'online'
    }));
  }

  // Get all conversations for the current user
  async getConversations() {
    try {
      const tokens = await getStoredTokens();
      if (!tokens || !tokens.access) {
        throw new Error('No authentication token available');
      }
  
      const response = await axios.get(`${BASE_URL}${MESSAGING_ENDPOINTS.CONVERSATIONS}`, {
        headers: {
          Authorization: `Bearer ${tokens.access}`
        }
      });
  
      // Enhance conversations with latest status
      const conversations = response.data.map(conv => ({
        ...conv,
        isOnline: this.getUserStatus(conv.participant?.id)?.status === 'online'
      }));
      
      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Get details for a specific conversation
  async getConversationDetail(conversationId) {
    try {
      const tokens = await getStoredTokens();
      if (!tokens || !tokens.access) {
        throw new Error('No authentication token available');
      }
  
      const response = await axios.get(
        `${BASE_URL}${MESSAGING_ENDPOINTS.CONVERSATION_DETAIL(conversationId)}`, 
        {
          headers: {
            Authorization: `Bearer ${tokens.access}`
          }
        }
      );
  
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      throw error;
    }
  }

  // Get messages for a specific conversation with pagination
  async getConversationMessages(conversationId, page = 1, pageSize = 20) {
    try {
      const tokens = await getStoredTokens();
      if (!tokens || !tokens.access) {
        throw new Error('No authentication token available');
      }
  
      const response = await axios.get(
        `${BASE_URL}${MESSAGING_ENDPOINTS.CONVERSATION_MESSAGES(conversationId)}`, 
        {
          headers: {
            Authorization: `Bearer ${tokens.access}`
          },
          params: {
            page,
            page_size: pageSize
          }
        }
      );
  
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }
  }

  // Create a new conversation with another user
  async createConversation(userId, organizationId, initialMessage = '') {
    try {
      const tokens = await getStoredTokens();
      if (!tokens || !tokens.access) {
        throw new Error('No authentication token available');
      }
  
      const response = await axios.post(
        `${BASE_URL}${MESSAGING_ENDPOINTS.CONVERSTATIONS_CREATE}`, 
        {
          participant_id: userId,
          organization_id: organizationId,
          initial_message: initialMessage
        },
        {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Send a message to a conversation
  async sendMessage(conversationId, content, replyTo = null, attachments = []) {
    try {
      const networkState = await NetInfo.fetch();
      const isConnected = networkState.isConnected && networkState.isInternetReachable !== false;

      // Generate local ID for message tracking
      const localId = `local_${Date.now()}`;
      const messageData = {
        local_id: localId,
        conversation_id: conversationId,
        content,
        reply_to: replyTo,
        attachments,
        created_at: new Date().toISOString()
      };

      // If online and WebSocket is connected, try WebSocket first
      if (isConnected && websocketManager.ws?.readyState === WebSocket.OPEN) {
        const sent = websocketManager.sendMessage(content, replyTo, attachments);
        if (sent) {
          return {
            success: true,
            localId,
            sentVia: 'websocket',
            ...messageData
          };
        }
      }

      // If offline or WebSocket send failed, store for later
      if (!isConnected) {
        await this.storeOfflineMessage(messageData);
        return {
          success: true,
          localId,
          queued: true,
          ...messageData
        };
      }

      // Fallback to REST API
      const tokens = await getStoredTokens();
      const response = await axios.post(
        `${BASE_URL}${MESSAGING_ENDPOINTS.SEND_MESSAGE(conversationId)}`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        localId,
        sentVia: 'rest',
        ...response.data
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // New methods for offline message handling
  async storeOfflineMessage(message) {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_MESSAGES_KEY);
      const messages = stored ? JSON.parse(stored) : [];
      messages.push(message);
      await AsyncStorage.setItem(OFFLINE_MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error storing offline message:', error);
      throw error;
    }
  }

  async getOfflineMessages() {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_MESSAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting offline messages:', error);
      return [];
    }
  }

  async clearOfflineMessages() {
    try {
      await AsyncStorage.removeItem(OFFLINE_MESSAGES_KEY);
    } catch (error) {
      console.error('Error clearing offline messages:', error);
    }
  }

  async processOfflineMessages() {
    const messages = await this.getOfflineMessages();
    if (!messages.length) return { processed: 0 };

    let processed = 0;
    const failed = [];

    for (const message of messages) {
      try {
        await this.sendMessage(
          message.conversation_id,
          message.content,
          message.reply_to,
          message.attachments
        );
        processed++;
      } catch (error) {
        failed.push(message);
      }
    }

    // Store back only failed messages
    if (failed.length) {
      await AsyncStorage.setItem(OFFLINE_MESSAGES_KEY, JSON.stringify(failed));
    } else {
      await this.clearOfflineMessages();
    }

    return { processed, failed: failed.length };
  }

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const tokens = await getStoredTokens();
      if (!tokens || !tokens.access) {
        throw new Error('No authentication token available');
      }
    
      await axios.delete(
        `${BASE_URL}${MESSAGING_ENDPOINTS.DELETE_MESSAGE(messageId)}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.access}`
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Edit a message
  async editMessage(messageId, newContent) {
    try {
      const tokens = await getStoredTokens();
      if (!tokens || !tokens.access) {
        throw new Error('No authentication token available');
      }
      
      const response = await axios.patch(
        `${BASE_URL}${MESSAGING_ENDPOINTS.EDIT_MESSAGE(messageId)}`,
        {
          content: newContent
        },
        {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }

  // Delete a conversation
  async deleteConversation(conversationId) {
    try {
      const tokens = await getStoredTokens();
      if (!tokens || !tokens.access) {
        throw new Error('No authentication token available');
      }
      
      await axios.delete(
        `${BASE_URL}${MESSAGING_ENDPOINTS.DELETE_CONVERSATION(conversationId)}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.access}`
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId, messageIds) {
    try {
      // If we have an active websocket connection for this conversation, use it
      if (websocketManager.isConnected() && 
          websocketManager.currentChatInfo?.conversationId === conversationId) {
        
        return websocketManager.sendReadReceipts(messageIds);
      }
      
      // If offline or no socket connection, fall back to API
      const tokens = await getStoredTokens();
      if (!tokens || !tokens.access) {
        throw new Error('No authentication token available');
      }
      
      // This would need a corresponding REST endpoint in your API
      // If your backend doesn't have one, you can skip this part
      /*
      const response = await axios.post(
        `${BASE_URL}/api/messaging/conversations/${conversationId}/read/`,
        {
          message_ids: messageIds
        },
        {
          headers: {
            Authorization: `Bearer ${tokens.access}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
      */
      
      // If there's no API endpoint, just return false
      return false;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  // Get pending offline message count
  async getPendingMessageCount() {
    return getOfflineMessageCount();
  }
}

// Create singleton instance
const messagingService = new MessagingService();

// Update WebSocket connection to track user statuses
websocketManager.on('user_status', (data) => {
  messagingService.updateUserStatus(data.userId, data.status);
});

export default messagingService;
