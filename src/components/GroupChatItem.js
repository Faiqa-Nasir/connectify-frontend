import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ColorPalette from "../constants/ColorPalette"

const GroupChatItem = ({ group, onPress }) => {
  // Truncate message if it's too long
  const truncateMessage = (message, maxLength = 30) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + "..."
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftSection}>
        <View style={styles.avatarContainer}>
          {group.groupImage ? (
            <Image source={{ uri: group.groupImage }} style={styles.avatar} />
          ) : (
            <View style={styles.groupIconContainer}>
              <Ionicons name="people" size={24} color={ColorPalette.text_white} />
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.groupName}>{group.groupName}</Text>
          <Text style={styles.lastMessage}>
            <Text style={styles.senderName}>{group.lastMessageSender}: </Text>
            {truncateMessage(group.lastMessage)}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.timeText}>{group.time}</Text>
        {group.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{group.unreadCount}</Text>
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
    flex: 1,
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
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ColorPalette.bg_post,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
  },
  groupName: {
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
  senderName: {
    fontFamily: Platform.OS === "ios" ? "SpaceGrotesk-Medium" : "SpaceGrotesk",
    fontWeight: "500",
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

export default GroupChatItem

