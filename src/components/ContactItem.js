import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import ColorPalette from "../constants/ColorPalette";

const ContactItem = ({ contact, onPress, showCheckbox = false, isSelected = false }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: contact.avatar }} style={styles.avatar} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{contact.name}</Text>
        </View>
      </View>
      {showCheckbox && (
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <View style={styles.checkboxInner} />}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 64,
    backgroundColor: "#070A0D",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textContainer: {
    justifyContent: "center",
  },
  name: {
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif-medium",
    fontWeight: "800",
    fontSize: 14,
    lineHeight: 17,
    color: "#FFFFFF",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#7A7A7A",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    borderColor: ColorPalette.accent,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ColorPalette.accent,
  },
});

export default ContactItem;
