"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import ColorPalette from "../../constants/ColorPalette"
import ChatItem from "../../components/ChatItem"
import GroupChatItem from "../../components/GroupChatItem"
import { useNavigation } from "@react-navigation/native"

// Dummy data for individual chats
const dummyChats = [
  {
    id: "1",
    username: "kevin.eth",
    profileImage: "https://randomuser.me/api/portraits/men/10.jpg",
    lastMessage: "kevin.eth is typing...",
    time: "14:28",
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: "2",
    username: "druids.eth",
    profileImage: "https://randomuser.me/api/portraits/men/15.jpg",
    lastMessage: "I thought it was you, lol",
    time: "yesterday",
    unreadCount: 3,
    isOnline: false,
  },
  {
    id: "3",
    username: "minari.sol",
    profileImage: "https://randomuser.me/api/portraits/women/22.jpg",
    lastMessage: "Just sent the design, feel thi...",
    time: "yesterday",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "4",
    username: "0x71C7656EC7ab4...dFB7",
    profileImage: "https://randomuser.me/api/portraits/men/23.jpg",
    lastMessage: "Whats up Sam, it's Frankie. 😏",
    time: "Friday",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "5",
    username: "Samuel Garry",
    profileImage: "https://randomuser.me/api/portraits/men/30.jpg",
    lastMessage: "Done, 😏",
    time: "07/21/2022",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "6",
    username: "Anthony (Web3.io)",
    profileImage: "https://randomuser.me/api/portraits/men/34.jpg",
    lastMessage: "Lemme join ur club, buddy",
    time: "07/18/2022",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "7",
    username: "kikii.eth",
    profileImage: "https://randomuser.me/api/portraits/women/40.jpg",
    lastMessage: "Yeah, sure.",
    time: "07/18/2022",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "8",
    username: "Margareth Joanne C.",
    profileImage: "https://randomuser.me/api/portraits/women/50.jpg",
    lastMessage: "SAMMM, ARE U KIDDING?!",
    time: "07/12/2022",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "9",
    username: "Joe Felix",
    profileImage: "https://randomuser.me/api/portraits/men/60.jpg",
    lastMessage: "Haha, yes!!",
    time: "07/12/2022",
    unreadCount: 0,
    isOnline: false,
  },
]

// Dummy data for group chats
const dummyGroups = [
  {
    id: "g1",
    groupName: "FYP",
    groupImage: "https://randomuser.me/api/portraits/men/1.jpg",
    lastMessageSender: "Kevin",
    lastMessage: "Hey everyone, meeting...",
    time: "10:15",
    unreadCount: 5,
    memberCount: 8,
  },
  {
    id: "g2",
    groupName: "Web3 Developers",
    groupImage: null, // Will use default group icon
    lastMessageSender: "Sarah",
    lastMessage: "Check out this new fr...",
    time: "Yesterday",
    unreadCount: 2,
    memberCount: 24,
  },
  {
    id: "g3",
    groupName: "Design Team",
    groupImage: "https://randomuser.me/api/portraits/women/2.jpg",
    lastMessageSender: "Michael",
    lastMessage: "I've uploaded the new...",
    time: "Yesterday",
    unreadCount: 0,
    memberCount: 6,
  },
  {
    id: "g4",
    groupName: "Crypto Enthusiasts",
    groupImage: null,
    lastMessageSender: "Alex",
    lastMessage: "Bitcoin is going up again!",
    time: "Monday",
    unreadCount: 0,
    memberCount: 42,
  },
]

export default function MessagingScreen() {
  const [activeTab, setActiveTab] = useState("Messages")
  const navigation = useNavigation()

  const handleFabPress = () => {
    if (activeTab === "Messages") {
      navigation.navigate("Contacts")
    } else {
      navigation.navigate("NewGroup")
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.searchButton}>
              <Feather name="search" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton}>
              <Image source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }} style={styles.profileImage} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "Messages" && styles.activeTabButton]}
            onPress={() => setActiveTab("Messages")}
          >
            <Text style={[styles.tabText, activeTab === "Messages" && styles.activeTabText]}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "Groups" && styles.activeTabButton]}
            onPress={() => setActiveTab("Groups")}
          >
            <Text style={[styles.tabText, activeTab === "Groups" && styles.activeTabText]}>Groups</Text>
          </TouchableOpacity>
        </View>

        {/* Chat List */}
        {activeTab === "Messages" ? (
          <FlatList
            data={dummyChats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatItem chat={item} onPress={() => navigation.navigate("ChatDetail", { chat: item })} />
            )}
            style={styles.chatList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={dummyGroups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <GroupChatItem group={item} onPress={() => navigation.navigate("GroupChatDetail", { group: item })} />
            )}
            style={styles.chatList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
          <Feather name="edit-2" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: ColorPalette.bg,
  },
  container: {
    flex: 1,
    backgroundColor: ColorPalette.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "400",
    color: ColorPalette.text_white,
    fontFamily: Platform.OS === "ios" ? "Poppins-Regular" : "Poppins",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchButton: {
    marginRight: 15,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ColorPalette.green,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 28,
    backgroundColor: ColorPalette.text_light_2,
    borderRadius: 100,
    height: 60,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  activeTabButton: {
    backgroundColor: ColorPalette.gradient_text,
  },
  tabText: {
    fontFamily: Platform.OS === "ios" ? "Poppins-Regular" : "Poppins",
    fontSize: 16,
    color: ColorPalette.text_black,
  },
  activeTabText: {
    color: ColorPalette.text_white,
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 28,
  },
  fab: {
    position: "absolute",
    bottom: 50,
    right: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ColorPalette.gradient_text,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
})

