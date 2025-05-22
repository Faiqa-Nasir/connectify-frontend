"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, SectionList, Platform, ActivityIndicator, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import ContactItem from "../../components/ContactItem"
import AsyncStorage from "@react-native-async-storage/async-storage"
import ColorPalette from "../../constants/ColorPalette"
import { BASE_URL, ORGANIZATION_ENDPOINTS } from "../../constants/ApiConstants"
import axios from "axios"
import messagingService from "../../services/messagingService"
import { getStoredTokens } from "../../services/tokenService"
import LoadingIndicator from "../../components/common/LoadingIndicator"

export default function ContactsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [contacts, setContacts] = useState({})
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [currentWorkspace, setCurrentWorkspace] = useState(null)
  const [error, setError] = useState(null)

  // Load current workspace and fetch organization users
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current workspace from AsyncStorage
        const storedWorkspace = await AsyncStorage.getItem('selectedWorkspace');
        if (storedWorkspace) {
          console.log('Stored workspace:', storedWorkspace);
          const workspace = JSON.parse(storedWorkspace);
          setCurrentWorkspace(workspace);
          fetchOrganizationUsers(workspace.id);
        } else {
          setLoading(false);
          setError("No organization selected");
        }
      } catch (error) {
        console.error('Error loading workspace:', error);
        setLoading(false);
        setError("Failed to load workspace data");
      }
    };
    
    loadData();
  }, []);

  // Fetch organization users
  const fetchOrganizationUsers = async (organizationId) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getStoredTokens().then((tokens) => tokens.access);
      if (!token) {
        setError("Authentication required");
        return;
      }
      console.log('Fetching organization users with token:', token);

      
      const response = await axios.get(
        `${BASE_URL}${ORGANIZATION_ENDPOINTS.GET_DETAILS(organizationId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Group users by first letter of their username
      const groupedContacts = {};
      
      // Get current user ID to exclude from the list
      const userDataString = await AsyncStorage.getItem('user_data');
      console.log('User data string:', userDataString);
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const currentUserId = userData?.id;
      
      // Use response.data.users instead of response.data
      if (response.data && response.data.users && Array.isArray(response.data.users)) {
        response.data.users.forEach(user => {
          // Skip the current user - make sure we're comparing the same types
          if (user.id === currentUserId || user.id.toString() === currentUserId?.toString()) {
            return;
          }
          
          // Use first_name for sorting, fallback to username if not available
          const sortingName = user.first_name || user.username;
          const firstLetter = sortingName.charAt(0).toUpperCase();
          
          if (!groupedContacts[firstLetter]) {
            groupedContacts[firstLetter] = [];
          }
          
          groupedContacts[firstLetter].push({
            id: user.id.toString(),
            name: (user.first_name && user.last_name) ? 
                  `${user.first_name} ${user.last_name}` : 
                  user.username,
            username: user.username,
            avatar: user.profile_image || 'https://randomuser.me/api/portraits/men/1.jpg',
          });
        });
        
        // Sort letters alphabetically
        const sortedLetters = Object.keys(groupedContacts).sort();
        
        // Create sections and sort contacts within each section by first_name
        const newSections = sortedLetters.map(letter => ({
          title: letter,
          data: groupedContacts[letter].sort((a, b) => {
            const nameA = a.name.split(' ')[0].toLowerCase();
            const nameB = b.name.split(' ')[0].toLowerCase();
            return nameA.localeCompare(nameB);
          }),
        }));
        
        setContacts(groupedContacts);
        setSections(newSections);
      } else {
        setError("Invalid response format from server");
        console.error("Invalid or missing users array in response:", response.data);
      }
    } catch (error) {
      console.error('Error fetching organization users:', error);
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  // Filter contacts based on search query
  const getFilteredSections = () => {
    if (!searchQuery.trim()) {
      return sections;
    }
    
    const filteredSections = [];
    
    sections.forEach(section => {
      const filteredData = section.data.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (filteredData.length > 0) {
        filteredSections.push({
          title: section.title,
          data: filteredData,
        });
      }
    });
    
    return filteredSections;
  };

  const handleContactPress = async (contact) => {
    if (creating) return;
    setCreating(true);
    
    try {
      console.log('Creating conversation for contact:', contact);
      console.log('Current workspace:', currentWorkspace);
      // Create or get existing conversation
      const response = await messagingService.createConversation(
        contact.id, 
        currentWorkspace.id,
        ""  // No initial message
      );

      
      // Navigate to chat detail with the created/existing conversation
      const conversationId = response.id || response.conversation_id;
      
      // Get conversation details
      const conversationDetails = await messagingService.getConversationDetail(conversationId);
      
      // Find the selected contact in the participants
      const participant = conversationDetails.participants.find(p => p.id.toString() === contact.id.toString());

      console.log('Conversation details:', conversationDetails);
      console.log('Participant details:', participant);
      
      // Format the chat object to match what ChatDetailScreen expects
      const chatData = {
        id: conversationDetails.id,
        username: contact.username || contact.name,
        profileImage: contact.avatar,
        isOnline: false, // You might want to get this from the API
        participant: participant, // Include full participant data
        sender:conversationDetails.last_message.sender,
      };

      console.log('Chat data:', chatData);
      
      navigation.navigate("ChatDetail", { chat: chatData });
    } catch (error) {
      console.error('Error creating conversation:', error);
      
      // Handle different error cases
      if (error.response?.data?.detail) {
        if (error.response.data.detail.includes("blocked")) {
          Alert.alert("Cannot create conversation", "You've been blocked by this user or vice versa.");
        } else if (error.response.data.conversation_id) {
          // Conversation already exists, navigate to it
          const existingId = error.response.data.conversation_id;
          const chatData = {
            id: existingId,
            username: contact.username || contact.name,
            profileImage: contact.avatar,
            isOnline: false,
          };
          navigation.navigate("ChatDetail", { chat: chatData });
        } else {
          Alert.alert("Error", error.response.data.detail || "Failed to create conversation");
        }
      } else {
        Alert.alert("Error", "Failed to create conversation. Please try again.");
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <LoadingIndicator message="Loading contacts..." />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => currentWorkspace && fetchOrganizationUsers(currentWorkspace.id)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contacts</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={24} color="#7A7A7A" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#7A7A7A"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={18} color="#7A7A7A" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Platform Label */}
        <View style={styles.platformLabel}>
          <Text style={styles.platformText}>On the platform</Text>
        </View>

        {creating ? (
          <View style={styles.creatingContainer}>
            <ActivityIndicator size="small" color={ColorPalette.green} />
            <Text style={styles.creatingText}>Creating conversation...</Text>
          </View>
        ) : null}

        {/* Contacts List */}
        {getFilteredSections().length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        ) : (
          <SectionList
            sections={getFilteredSections()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContactItem 
                contact={item} 
                onPress={() => handleContactPress(item)}
                disabled={creating} 
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            )}
            stickySectionHeadersEnabled={false}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: ColorPalette.dark_bg,
  },
  container: {
    flex: 1,
    backgroundColor: ColorPalette.dark_bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderBottomWidth: 1,
    backgroundColor: ColorPalette.dark_bg,
    borderBottomColor: ColorPalette.border_color,
  },
  backButton: {
    position: "absolute",
    left: 8,
    padding: 8,
  },
  headerTitle: {
    fontFamily: "CG-Medium",
    fontSize: 20,
    color: "#FFFFFF",
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    padding: 8,
    marginVertical:8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: ColorPalette.border_color,
    borderRadius: 18,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "CG-Regular" : "CG-Regular",
  },
  platformLabel: {
    height: 24,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  platformText: {
    fontSize: 12,
    fontWeight: "600",
    color: ColorPalette.text_gray,
    paddingVertical: 4,
    fontFamily: Platform.OS === "ios" ? "CG-Regular" : "CG-Regular",
  },
  sectionHeader: {
    height: 24,
    backgroundColor: ColorPalette.dark_gray,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "800",
    color: ColorPalette.text_gray,
    fontFamily: Platform.OS === "ios" ? "CG-Medium" : "CG-Medium",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ColorPalette.dark_bg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: ColorPalette.dark_bg,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'CG-Medium',
  },
  retryButton: {
    backgroundColor: ColorPalette.gradient_text,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  retryText: {
    fontFamily: 'CG-Medium',
    fontSize: 14,
    color: ColorPalette.text_white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#7A7A7A',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'CG-Medium',
  },
  creatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(29, 35, 41, 0.8)',
    borderRadius: 8,
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  creatingText: {
    marginLeft: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'CG-Medium',
  },
})

