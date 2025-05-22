import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import websocketManager from './websocketManager';
import messagingService from '../services/messagingService';

// Queue a message for sending when online
export const queueOfflineMessage = async (conversationId, message, replyTo = null) => {
  try {
    // Get existing offline messages
    const offlineMessagesString = await AsyncStorage.getItem('offlineMessages');
    const offlineMessages = offlineMessagesString ? JSON.parse(offlineMessagesString) : [];
    
    // Add new message to queue
    offlineMessages.push({
      conversationId,
      message: {
        content: message,
        reply_to: replyTo
      },
      timestamp: new Date().toISOString(),
    });
    
    // Save updated queue
    await AsyncStorage.setItem('offlineMessages', JSON.stringify(offlineMessages));
    
    return true;
  } catch (error) {
    console.error('Error queueing offline message:', error);
    return false;
  }
};

// Network status listener using React Native's NetInfo
export function useNetworkStatus(onConnect, onDisconnect) {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected && state.isInternetReachable !== false;
      if (isConnected) {
        onConnect?.();
      } else {
        onDisconnect?.();
      }
    });

    return () => unsubscribe();
  }, [onConnect, onDisconnect]);
}

// Process offline messages through the messaging service
export async function processOfflineMessages() {
  return await messagingService.processOfflineMessages();
}

// Get the count of offline messages
export async function getOfflineMessageCount() {
  const messages = await messagingService.getOfflineMessages();
  return messages.length;
}
