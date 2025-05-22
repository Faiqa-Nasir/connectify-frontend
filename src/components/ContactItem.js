import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import ColorPalette from "../constants/ColorPalette";

const ContactItem = ({ contact, onPress, showCheckbox = false, selected = false, disabled = false }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.leftContainer}>
        {contact.avatar ? (
          <Image
            source={{ uri: contact.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{contact.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.name}>{contact.name}</Text>
          {contact.username && (
            <Text style={styles.username}>@{contact.username}</Text>
          )}
        </View>
      </View>

      {showCheckbox ? (
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Feather name="check" size={16} color="#FFFFFF" />}
        </View>
      ) : (
        <Feather name="chevron-right" size={20} color={ColorPalette.grey_text} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    backgroundColor: ColorPalette.green,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontFamily: Platform.OS === "ios" ? "CG-Bold" : "CG-Bold",
    fontSize: 18,
    color: ColorPalette.white,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontFamily: Platform.OS === "ios" ? "CG-Medium" : "CG-Medium",
    fontSize: 16,
    color: ColorPalette.white,
    marginBottom: 2,
  },
  username: {
    fontFamily: Platform.OS === "ios" ? "CG-Regular" : "CG-Regular",
    fontSize: 14,
    color: ColorPalette.grey_text,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ColorPalette.grey_text,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: ColorPalette.green,
    borderColor: ColorPalette.green,
  },
});

export default ContactItem;
