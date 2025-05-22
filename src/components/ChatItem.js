import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Animated } from "react-native"
import { Feather } from "@expo/vector-icons"
import React, { useRef, useState } from "react"
import ColorPalette from "../constants/ColorPalette"

const ChatItem = ({ chat, onPress, onLongPress }) => {
  const [showDelete, setShowDelete] = useState(false);
  const deleteButtonAnimation = useRef(new Animated.Value(0)).current;
  
  const handleLongPress = () => {
    setShowDelete(true);
    Animated.spring(deleteButtonAnimation, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
    
    if (onLongPress) {
      onLongPress(chat);
    }
  };
  
  const handleDeletePress = (e) => {
    e.stopPropagation();
    if (onLongPress) {
      onLongPress(chat);
    }
  };

  // Format display name properly
  const displayName = chat.username || (chat.participant ? 
    `${chat.participant.first_name || ''} ${chat.participant.last_name || ''}`.trim() || 
    chat.participant.username : 'Unknown User');

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <View style={styles.leftSection}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: chat.participant?.profile_image || chat.profileImage }} 
            style={styles.avatar} 
          />
          {chat.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.username}>{displayName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
            {chat.isTyping ? 
              <Text style={styles.typingText}>Typing...</Text> : 
              chat.lastMessage}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.timeText}>{chat.time}</Text>
        {chat.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</Text>
          </View>
        )}
        
        {showDelete && (
          <Animated.View 
            style={[
              styles.deleteButtonContainer,
              {
                opacity: deleteButtonAnimation,
                transform: [
                  { 
                    scale: deleteButtonAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1]
                    }) 
                  }
                ]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeletePress}
            >
              <Feather name="trash-2" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(133, 147, 168, 0.2)",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1E22', // Placeholder color while loading
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
    marginRight: 10,
  },
  username: {
    fontFamily: Platform.OS === "ios" ? "CG-Medium" : "CG-Medium",
    fontWeight: "500",
    fontSize: 16,
    color: ColorPalette.text_white,
    marginBottom: 4,
  },
  lastMessage: {
    fontFamily: Platform.OS === "ios" ? "CG-Regular" : "CG-Regular",
    fontSize: 14,
    color: ColorPalette.text_gray,
  },
  typingText: {
    fontStyle: 'italic',
    color: ColorPalette.green,
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  timeText: {
    fontFamily: Platform.OS === "ios" ? "CG-Regular" : "CG-Regular",
    fontSize: 12,
    color: ColorPalette.text_gray,
    marginBottom: 4,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ColorPalette.green,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  unreadText: {
    fontFamily: Platform.OS === "ios" ? "CG-Regular" : "CG-Regular",
    fontSize: 12,
    color: ColorPalette.text_white,
    fontWeight: "400",
  },
  deleteButtonContainer: {
    position: "absolute",
    right: -10,
    top: -10,
    zIndex: 10,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ColorPalette.dark_red,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default ChatItem

