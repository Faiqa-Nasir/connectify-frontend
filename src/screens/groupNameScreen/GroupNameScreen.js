import { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import ColorPalette from "../../constants/ColorPalette";
import ContactItem from "../../components/ContactItem";

export default function GroupNameScreen({ route, navigation }) {
  const { selectedMembers } = route.params;
  const [groupName, setGroupName] = useState("");

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;

    // Create group chat and navigate to it
    navigation.navigate("GroupChatDetail", {
      group: {
        id: Date.now().toString(),
        groupName: groupName,
        memberCount: selectedMembers.length,
        members: selectedMembers,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Name of Group Chat</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup} disabled={!groupName.trim()}>
            <Feather name="check" size={24} color={groupName.trim() ? ColorPalette.accent : "#7A7A7A"} />
          </TouchableOpacity>
        </View>

        {/* Group Name Input */}
        <View style={styles.nameContainer}>
          <Text style={styles.label}>NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Choose a group chat name"
            placeholderTextColor="#7A7A7A"
            value={groupName}
            onChangeText={setGroupName}
            autoFocus
          />
        </View>

        {/* Members List */}
        <View style={styles.membersContainer}>
          <Text style={styles.membersCount}>{selectedMembers.length} Members</Text>
          <ScrollView style={styles.membersList}>
            {selectedMembers.map((member) => (
              <ContactItem key={member.id} contact={member} onPress={() => {}} showCheckbox={false} />
            ))}
          </ScrollView>
        </View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  nameContainer: {
    padding: 16,
  },
  label: {
    fontSize: 12,
    color: "#7A7A7A",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
  },
  input: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  membersContainer: {
    flex: 1,
  },
  membersCount: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif-medium",
    fontWeight: "600",
    marginLeft: 16,
    marginBottom: 16,
  },
  membersList: {
    flex: 1,
  },
});
