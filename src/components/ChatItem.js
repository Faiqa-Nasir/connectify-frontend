import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from "react-native"
import ColorPalette from "../constants/ColorPalette"

const ChatItem = ({ chat, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftSection}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: chat.profileImage }} style={styles.avatar} />
          {chat.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.username}>{chat.username}</Text>
          <Text style={styles.lastMessage}>{chat.lastMessage}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.timeText}>{chat.time}</Text>
        {chat.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{chat.unreadCount}</Text>
          </View>
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
  },
  avatarContainer: {
    position: "relative",
    marginRight: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00CC5E",
    borderWidth: 1,
    borderColor: ColorPalette.bg,
  },
  textContainer: {
    justifyContent: "center",
  },
  username: {
    fontFamily: Platform.OS === "ios" ? "SpaceGrotesk-Medium" : "SpaceGrotesk",
    fontWeight: "500",
    fontSize: 16,
    color: ColorPalette.text_white,
    marginBottom: 4,
  },
  lastMessage: {
    fontFamily: Platform.OS === "ios" ? "SpaceGrotesk-Regular" : "SpaceGrotesk",
    fontSize: 16,
    color: ColorPalette.text_gray,
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  timeText: {
    fontFamily: Platform.OS === "ios" ? "SpaceGrotesk-Regular" : "SpaceGrotesk",
    fontSize: 12,
    color: ColorPalette.text_gray,
    marginBottom: 4,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ColorPalette.gradient_text,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    fontFamily: Platform.OS === "ios" ? "SpaceGrotesk-Regular" : "SpaceGrotesk",
    fontSize: 12,
    color: ColorPalette.text_white,
    fontWeight: "400",
  },
})

export default ChatItem

