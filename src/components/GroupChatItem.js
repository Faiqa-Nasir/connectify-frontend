import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from "react-native"
import ColorPalette from "../constants/ColorPalette"
import { Feather } from "@expo/vector-icons"

const GroupChatItem = ({ group, onPress }) => {
  // Function to generate group avatar text (first letter of group name)
  const getGroupInitial = () => {
    return group.groupName ? group.groupName.charAt(0).toUpperCase() : "#";
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftSection}>
        <View style={styles.avatarContainer}>
          {group.groupImage ? (
            <Image source={{ uri: group.groupImage }} style={styles.avatar} />
          ) : (
            <View style={styles.groupInitialContainer}>
              <Text style={styles.groupInitial}>{getGroupInitial()}</Text>
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.groupName}>{group.groupName}</Text>
          <View style={styles.lastMessageContainer}>
            <Text style={styles.lastMessageSender}>
              {group.lastMessageSender}: 
            </Text>
            <Text style={styles.lastMessage}> {group.lastMessage}</Text>
          </View>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.timeText}>{group.time}</Text>
        {group.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{group.unreadCount}</Text>
          </View>
        )}
        <View style={styles.memberCount}>
          <Feather name="users" size={12} color={ColorPalette.text_gray} />
          <Text style={styles.memberCountText}>{group.memberCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
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
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupInitialContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ColorPalette.gradient_text,
    justifyContent: "center",
    alignItems: "center",
  },
  groupInitial: {
    color: ColorPalette.text_white,
    fontSize: 22,
    fontWeight: "600",
    fontFamily: "CG-Medium",
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
  },
  groupName: {
    fontFamily: Platform.OS === "ios" ? "CG-Medium" : "CG-Medium",
    fontSize: 16,
    color: ColorPalette.text_white,
    marginBottom: 4,
  },
  lastMessageContainer: {
    flexDirection: "row",
    flex: 1,
  },
  lastMessageSender: {
    fontFamily: Platform.OS === "ios" ? "CG-Medium" : "CG-Medium",
    fontSize: 14,
    color: ColorPalette.text_gray,
  },
  lastMessage: {
    fontFamily: Platform.OS === "ios" ? "CG-Regular" : "CG-Regular",
    fontSize: 14,
    color: ColorPalette.text_gray,
    flex: 1,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ColorPalette.gradient_text,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  unreadText: {
    fontFamily: Platform.OS === "ios" ? "CG-Regular" : "CG-Regular",
    fontSize: 12,
    color: ColorPalette.text_white,
  },
  memberCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberCountText: {
    fontFamily: Platform.OS === "ios" ? "CG-Regular" : "CG-Regular",
    fontSize: 12,
    color: ColorPalette.text_gray,
    marginLeft: 4,
  },
})

export default GroupChatItem

