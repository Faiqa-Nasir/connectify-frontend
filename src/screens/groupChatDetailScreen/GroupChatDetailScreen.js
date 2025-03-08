"use client"

import { useState, useRef, useEffect } from "react"
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
} from "react-native"
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import ColorPalette from "../../constants/ColorPalette"

const MessageTypes = {
  TEXT: "text",
  LINK: "link",
  EMOJI: "emoji",
  FILE: "file",
}

// Sample group chat messages
const groupMessages = [
  {
    id: "1",
    type: MessageTypes.TEXT,
    text: "Hey everyone! Welcome to the group.",
    sender: {
      id: "admin",
      name: "Kevin",
      profileImage: "https://randomuser.me/api/portraits/men/10.jpg",
    },
    isSender: false,
    timestamp: "2:45PM",
  },
  {
    id: "2",
    type: MessageTypes.TEXT,
    text: "Thanks for adding me!",
    sender: {
      id: "user1",
      name: "Sarah",
      profileImage: "https://randomuser.me/api/portraits/women/22.jpg",
    },
    isSender: false,
    timestamp: "2:47PM",
  },
  {
    id: "3",
    type: MessageTypes.TEXT,
    text: "I have a question about the project timeline",
    isSender: true,
    timestamp: "2:50PM",
    status: "read",
  },
  {
    id: "4",
    type: MessageTypes.TEXT,
    text: "We should be done by next Friday",
    sender: {
      id: "user2",
      name: "Michael",
      profileImage: "https://randomuser.me/api/portraits/men/15.jpg",
    },
    isSender: false,
    timestamp: "2:52PM",
  },
  {
    id: "5",
    type: MessageTypes.FILE,
    file: {
      name: "ProjectTimeline.pdf",
      size: "2.3 MB",
      type: "pdf",
    },
    text: "Here's the timeline document",
    sender: {
      id: "user2",
      name: "Michael",
      profileImage: "https://randomuser.me/api/portraits/men/15.jpg",
    },
    isSender: false,
    timestamp: "2:55PM",
  },
  {
    id: "6",
    type: MessageTypes.TEXT,
    text: "Thanks for sharing!",
    isSender: true,
    timestamp: "3:00PM",
    status: "read",
  },
]

export default function GroupChatDetailScreen({ route, navigation }) {
  const { group } = route.params
  const [message, setMessage] = useState("")
  const flatListRef = useRef(null)

  // Scroll to bottom when component mounts
  useEffect(() => {
    setTimeout(() => {
      if (flatListRef.current && groupMessages.length > 0) {
        flatListRef.current.scrollToEnd({ animated: false })
      }
    }, 100)
  }, [])

  const renderMessageStatus = (status) => {
    if (!status) return null

    if (status === "sent") {
      return <Feather name="check" size={14} color="#7A7A7A" />
    } else if (status === "delivered") {
      return <Feather name="check-circle" size={14} color="#7A7A7A" />
    } else if (status === "read") {
      return <Feather name="check-circle" size={14} color="#1AC1CA" />
    }
    return null
  }

  const renderMessage = ({ item }) => {
    if (item.type === MessageTypes.TEXT) {
      if (item.isSender) {
        return (
          <View style={[styles.messageRow, styles.senderRow]}>
            <View style={styles.messageContainer}>
              <View style={[styles.messageBubble, styles.senderBubble]}>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
              <View style={[styles.messageFooter, styles.senderFooter]}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
                {renderMessageStatus(item.status)}
              </View>
            </View>
          </View>
        )
      } else {
        return (
          <View style={[styles.messageRow, styles.receiverRow]}>
            <View style={styles.receiverHeader}>
              <Image source={{ uri: item.sender.profileImage }} style={styles.avatar} />
              <Text style={styles.senderName}>{item.sender.name}</Text>
            </View>
            <View style={styles.receiverContent}>
              <View style={[styles.messageBubble, styles.receiverBubble]}>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
              <View style={[styles.messageFooter, styles.receiverFooter]}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
            </View>
          </View>
        )
      }
    } else if (item.type === MessageTypes.FILE) {
      if (item.isSender) {
        return (
          <View style={[styles.messageRow, styles.senderRow]}>
            <View style={styles.messageContainer}>
              <View style={styles.fileContainer}>
                <View style={styles.filePreview}>
                  <View style={styles.fileIconContainer}>
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color="#D93831" />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{item.file.name}</Text>
                    <Text style={styles.fileSize}>{item.file.size}</Text>
                  </View>
                  <TouchableOpacity style={styles.downloadButton}>
                    <Feather name="download" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.fileCaption}>
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
              </View>
              <View style={[styles.messageFooter, styles.senderFooter]}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
                {renderMessageStatus(item.status)}
              </View>
            </View>
          </View>
        )
      } else {
        return (
          <View style={[styles.messageRow, styles.receiverRow]}>
            <View style={styles.receiverHeader}>
              <Image source={{ uri: item.sender.profileImage }} style={styles.avatar} />
              <Text style={styles.senderName}>{item.sender.name}</Text>
            </View>
            <View style={styles.receiverContent}>
              <View style={styles.fileContainer}>
                <View style={styles.filePreview}>
                  <View style={styles.fileIconContainer}>
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color="#D93831" />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{item.file.name}</Text>
                    <Text style={styles.fileSize}>{item.file.size}</Text>
                  </View>
                  <TouchableOpacity style={styles.downloadButton}>
                    <Feather name="download" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.fileCaption}>
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
              </View>
              <View style={[styles.messageFooter, styles.receiverFooter]}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
            </View>
          </View>
        )
      }
    }
    return null
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{group.groupName}</Text>
            <Text style={styles.headerSubtitle}>{group.memberCount} members</Text>
          </View>
          <View style={styles.headerRight}>
            {group.groupImage ? (
              <Image source={{ uri: group.groupImage }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerGroupIcon}>
                <Ionicons name="people" size={24} color={ColorPalette.text_white} />
              </View>
            )}
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={groupMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          inverted={false}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: false })}
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
              onChangeText={setMessage}
            />
          </View>
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="arrow-forward-circle" size={24} color={message.trim() ? ColorPalette.accent : "#7A7A7A"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: ColorPalette.bg,
  },
  container: {
    flex: 1,
    backgroundColor: ColorPalette.bg,
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
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif-medium",
    fontSize: 16,
    fontWeight: "800",
    color: ColorPalette.text_white,
  },
  headerSubtitle: {
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
    fontSize: 12,
    color: "#7A7A7A",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerGroupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ColorPalette.bg_post,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 8,
    paddingBottom: 20,
  },
  messageRow: {
    marginBottom: 16,
  },
  senderRow: {
    alignItems: "flex-end",
  },
  receiverRow: {
    alignItems: "flex-start",
  },
  receiverHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingLeft: 8,
  },
  receiverContent: {
    marginLeft: 40, // Align with the sender name
  },
  messageContainer: {
    maxWidth: "70%",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  senderName: {
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif-medium",
    fontSize: 12,
    fontWeight: "600",
    color: ColorPalette.accent,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 8,
    paddingHorizontal: 16,
  },
  senderBubble: {
    backgroundColor: "#1C1E22",
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 0,
  },
  receiverBubble: {
    backgroundColor: "#101418",
    borderWidth: 1,
    borderColor: "#1C1E22",
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 16,
  },
  messageText: {
    color: ColorPalette.text_white,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
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
  },
  fileContainer: {
    backgroundColor: "#1C1E22",
    borderRadius: 16,
    borderBottomRightRadius: 0,
    overflow: "hidden",
    width: "100%",
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101418",
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
  },
  fileSize: {
    color: "#7A7A7A",
    fontSize: 11,
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
  },
  input: {
    color: ColorPalette.text_white,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
  },
  sendButton: {
    padding: 8,
  },
})

