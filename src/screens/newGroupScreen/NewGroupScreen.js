"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  SectionList,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import ColorPalette from "../../constants/ColorPalette";
import ContactItem from "../../components/ContactItem";

// Using the same dummy data as ContactsScreen
const contacts = {
  A: [{ id: "1", name: "Alison Gilchrist", avatar: "https://randomuser.me/api/portraits/women/1.jpg" }],
  B: [
    { id: "2", name: "Ben Holt", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
    { id: "3", name: "Benutzer", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  ],
  N: [{ id: "4", name: "Nash Brick", avatar: "https://randomuser.me/api/portraits/men/4.jpg" }],
};

const sections = Object.keys(contacts).map((letter) => ({
  title: letter,
  data: contacts[letter],
}));

export default function NewGroupScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);

  const handleContactPress = (contactId) => {
    setSelectedContacts((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId);
      }
      return [...prev, contactId];
    });
  };

  const handleCreateGroup = () => {
    const selectedMembers = Object.values(contacts).flatMap((section) =>
      section.filter((contact) => selectedContacts.includes(contact.id))
    );

    navigation.navigate("GroupName", { selectedMembers });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Group Members</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup} disabled={selectedContacts.length === 0}>
            <Text style={[styles.createButtonText, selectedContacts.length === 0 && styles.createButtonTextDisabled]}>
              Create
            </Text>
          </TouchableOpacity>
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
          </View>
        </View>

        {/* Platform Label */}
        <View style={styles.platformLabel}>
          <Text style={styles.platformText}>On the platform</Text>
        </View>

        {/* Contacts List */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactItem
              contact={item}
              onPress={() => handleContactPress(item.id)}
              showCheckbox
              isSelected={selectedContacts.includes(item.id)}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          stickySectionHeadersEnabled={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#070A0D",
  },
  container: {
    flex: 1,
    backgroundColor: "#070A0D",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    backgroundColor: "#101418",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  backButton: {
    position: "absolute",
    left: 8,
    padding: 8,
  },
  headerTitle: {
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif-medium",
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  createButton: {
    position: "absolute",
    right: 16,
  },
  createButtonText: {
    color: ColorPalette.accent,
    fontSize: 16,
    fontWeight: "600",
  },
  createButtonTextDisabled: {
    color: "#7A7A7A",
  },
  searchContainer: {
    padding: 8,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#101418",
    borderWidth: 1,
    borderColor: "#1C1E22",
    borderRadius: 18,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
  },
  platformLabel: {
    height: 24,
    backgroundColor: "rgba(10, 12, 15, 0.5)",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  platformText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7A7A7A",
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
  },
  sectionHeader: {
    height: 24,
    backgroundColor: "#13151B",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7A7A7A",
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif-medium",
  },
});

