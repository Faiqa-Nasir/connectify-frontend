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
  Linking,
} from "react-native"
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import ColorPalette from "../../constants/ColorPalette"
import MessageActions from "../../components/MessageActions"
import Clipboard from "@react-native-clipboard/clipboard"

const MessageTypes = {
  TEXT: "text",
  LINK: "link",
  EMOJI: "emoji",
  FILE: "file",
}

const messages = [
  {
    id: "1",
    type: MessageTypes.TEXT,
    text: "I wish I could be here",
    isSender: true,
    timestamp: "3:00PM",
    status: "read", // 'sent', 'delivered', 'read'
  },
  {
    id: "2",
    type: MessageTypes.LINK,
    text: "https://www.reddit.com/r/OldSchoolCelebs/comments/ddc4bd/the_kings_of_hollywood_new_years_eve_1957_at",
    preview: {
      title: "The Kings of Hollywood. New Years Ev...",
      description: "Posted in r/OldSchoolCelebs by u/usps85 • 16 points and 1 comment",
      image: "https://randomuser.me/api/portraits/men/43.jpg",
      site: "Reddit",
    },
    isSender: true,
    timestamp: "3:00PM",
    status: "read",
  },
  {
    id: "3",
    type: MessageTypes.EMOJI,
    text: "😎",
    isSender: false,
    timestamp: "3:00PM",
  },
  {
    id: "4",
    type: MessageTypes.FILE,
    file: {
      name: "SlimAarons.pdf",
      size: "125 KB",
      type: "pdf",
    },
    text: "Here you go.",
    isSender: true,
    timestamp: "3:00PM",
    status: "read",
  },
]

export default function ChatDetailScreen({ route, navigation }) {
  const { chat } = route.params
  const [message, setMessage] = useState("")
  const flatListRef = useRef(null)

  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showActions, setShowActions] = useState(false)

  // Scroll to bottom when component mounts
  useEffect(() => {
    setTimeout(() => {
      if (flatListRef.current && messages.length > 0) {
        flatListRef.current.scrollToEnd({ animated: false })
      }
    }, 100)
  }, [])

  const handleLongPress = (message) => {
    setSelectedMessage(message)
    setShowActions(true)
  }

  const handleReact = (reaction) => {
    // Here you would update the message with the reaction
    console.log(`Reacted with ${reaction} to message:`, selectedMessage)
  }

  const handleReply = () => {
    // Implement reply functionality
    setShowActions(false)
  }

  const handleThreadReply = () => {
    // Implement thread reply functionality
    setShowActions(false)
  }

  const handleCopy = () => {
    if (selectedMessage?.text) {
      Clipboard.setString(selectedMessage.text)
    }
    setShowActions(false)
  }

  const handleEdit = () => {
    // Implement edit functionality
    setShowActions(false)
  }

  const handleDelete = () => {
    // Implement delete functionality
    setShowActions(false)
  }

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
      return (
        <TouchableOpacity onLongPress={() => handleLongPress(item)} delayLongPress={200}>
          <View style={[styles.messageRow, item.isSender ? styles.senderRow : styles.receiverRow]}>
            <View style={styles.messageContainer}>
              <View style={[styles.messageBubble, item.isSender ? styles.senderBubble : styles.receiverBubble]}>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
              <View style={[styles.messageFooter, item.isSender ? styles.senderFooter : styles.receiverFooter]}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
                {item.isSender && renderMessageStatus(item.status)}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )
    } else if (item.type === MessageTypes.LINK) {
      return (
        <TouchableOpacity onLongPress={() => handleLongPress(item)} delayLongPress={200}>
          <View style={[styles.messageRow, styles.senderRow]}>
            <View style={styles.messageContainer}>
              <View style={styles.linkContainer}>
                <Text style={styles.messageText}>{item.text}</Text>
                <TouchableOpacity style={styles.linkPreview} onPress={() => Linking.openURL(item.text)}>
                  <Image source={{ uri: item.preview.image }} style={styles.linkImage} />
                  <View style={styles.linkSite}>
                    <Text style={styles.linkSiteText}>{item.preview.site}</Text>
                  </View>
                  <View style={styles.linkContent}>
                    <Text style={styles.linkTitle}>{item.preview.title}</Text>
                    <Text style={styles.linkDescription}>{item.preview.description}</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={[styles.messageFooter, styles.senderFooter]}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
                {renderMessageStatus(item.status)}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )
    } else if (item.type === MessageTypes.EMOJI) {
      return (
        <TouchableOpacity onLongPress={() => handleLongPress(item)} delayLongPress={200}>
          <View style={[styles.messageRow, styles.receiverRow]}>
            <View style={styles.messageContainer}>
              <Text style={styles.emojiText}>{item.text}</Text>
              <View style={[styles.messageFooter, styles.receiverFooter]}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )
    } else if (item.type === MessageTypes.FILE) {
      return (
        <TouchableOpacity onLongPress={() => handleLongPress(item)} delayLongPress={200}>
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
        </TouchableOpacity>
      )
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
            <Text style={styles.headerTitle}>{chat.username}</Text>
            <Text style={styles.headerSubtitle}>Seen 1 hour ago</Text>
          </View>
          <View style={styles.headerRight}>
            <Image source={{ uri: chat.profileImage }} style={styles.headerAvatar} />
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
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
  linkContainer: {
    backgroundColor: "#00193D",
    borderRadius: 16,
    borderBottomRightRadius: 0,
    overflow: "hidden",
    padding: 8,
  },
  linkPreview: {
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  linkImage: {
    width: "100%",
    height: 136,
    backgroundColor: "#1C1E22",
  },
  linkSite: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "#00193D",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopRightRadius: 15,
  },
  linkSiteText: {
    color: "#005FFF",
    fontSize: 14,
    fontWeight: "800",
  },
  linkContent: {
    padding: 8,
  },
  linkTitle: {
    color: ColorPalette.text_white,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  linkDescription: {
    color: ColorPalette.text_white,
    fontSize: 12,
  },
  emojiText: {
    fontSize: 50,
    marginRight: 8,
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

