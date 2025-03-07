import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ColorPalette from '../constants/ColorPalette';

export default function ChatItem({ chat, isGroupChat, onPress }) {
  const user = isGroupChat ? null : chat.user;
  
  // Format the last message preview
  const getMessagePreview = () => {
    const message = chat.lastMessage;
    
    if (message.media) {
      return message.media.preview;
    }
    
    return message.text;
  };
  
  // Get the name to display (user's name or group name)
  const displayName = isGroupChat ? chat.name : user.username;
  
  // Get the image to display
  const displayImage = isGroupChat ? chat.profileImage : user.profileImage;
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: displayImage }} style={styles.avatar} />
        {!isGroupChat && user.isOnline && (
          <View style={styles.onlineIndicator} />
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.time}>{chat.lastMessage.timestamp}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <View style={styles.messageContainer}>
            {isGroupChat && chat.lastMessage.sender && (
              <Text style={styles.sender} numberOfLines={1}>
                {chat.lastMessage.sender}: 
              </Text>
            )}
            <Text 
              style={[
                styles.message, 
                !chat.lastMessage.isRead && styles.unreadMessage
              ]} 
              numberOfLines={1}
            >
              {getMessagePreview()}
            </Text>
          </View>
          
          {chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: ColorPalette.dark_bg,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.dark_card,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ColorPalette.gradient_text,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: ColorPalette.dark_bg,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: 'CG-Medium',
    color: ColorPalette.white,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: ColorPalette.gradient_text,
    fontFamily: 'CG-Regular',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  sender: {
    fontSize: 14,
    color: ColorPalette.text_gray,
    fontFamily: 'CG-Medium',
    marginRight: 4,
  },
  message: {
    fontSize: 14,
    color: ColorPalette.text_gray,
    fontFamily: 'CG-Regular',
    flex: 1,
  },
  unreadMessage: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
  },
  unreadBadge: {
    backgroundColor: ColorPalette.gradient_text,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    color: ColorPalette.text_black,
    fontSize: 12,
    fontFamily: 'CG-Medium',
  },
});
