import React from "react"
import { View, Modal, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, Dimensions } from "react-native"
import { Feather } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

const Popup = ({ visible, onClose, children, showCloseButton = true }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.popup}>
              {showCloseButton && (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Feather name="x" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <View style={styles.content}>{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    backgroundColor: "#101418",
    borderRadius: 12,
    padding: 20,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
  },
})

export default Popup
