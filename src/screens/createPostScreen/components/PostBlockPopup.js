
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native"
import ColorPalette from "../../../constants/ColorPalette"
import Popup from '../../../components/Popup'; 

const PostBlockPopup = ({ visible, onClose, message }) => {
  return (
    <Popup visible={visible} onClose={onClose}>
      <View style={styles.popupContent}>
        <Text style={styles.title}>Post Blocked</Text>
        <Text style={styles.message}>
          {message || 'Inappropriate content detected. Your post could not be published as it violates the community guidelines.'}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Popup>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: ColorPalette.dark_bg,
  },
  button: {
    backgroundColor: ColorPalette.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
  },
  popupContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif-medium",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    backgroundColor: ColorPalette.primary,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
  },
})

export default PostBlockPopup
