import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ColorPalette from "../constants/ColorPalette";

// Common emoji reactions to show in action sheet
const REACTIONS = ["👍", "❤️", "😂", "😯", "😢", "🙏"];

const MessageActions = ({
  visible,
  onClose,
  onReact,
  onReply,
  onThreadReply,
  onCopy,
  onEdit,
  onDelete,
  isOwnMessage,
}) => {
  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.actionSheet}>
              {/* Reactions */}
              <View style={styles.reactionsContainer}>
                {REACTIONS.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.reactionButton}
                    onPress={() => onReact(emoji)}
                  >
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <ActionButton
                  icon="reply-outline"
                  label="Reply"
                  onPress={onReply}
                />
                <ActionButton
                  icon="git-branch-outline"
                  label="Thread Reply"
                  onPress={onThreadReply}
                />
                <ActionButton
                  icon="copy-outline"
                  label="Copy"
                  onPress={onCopy}
                />
                {isOwnMessage && (
                  <>
                    <ActionButton
                      icon="pencil-outline"
                      label="Edit"
                      onPress={onEdit}
                    />
                    <ActionButton
                      icon="trash-outline"
                      label="Delete"
                      onPress={onDelete}
                      isDestructive
                    />
                  </>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Action button component to avoid repetition
const ActionButton = ({ icon, label, onPress, isDestructive = false }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Ionicons
      name={icon}
      size={22}
      color={isDestructive ? ColorPalette.red : ColorPalette.text_white}
    />
    <Text
      style={[
        styles.actionLabel,
        isDestructive && { color: ColorPalette.red },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionSheet: {
    width: "80%",
    backgroundColor: ColorPalette.card_bg,
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 16,
  },
  reactionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  reactionButton: {
    padding: 8,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  actionsContainer: {
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  actionLabel: {
    marginLeft: 12,
    color: ColorPalette.text_white,
    fontSize: 16,
    fontFamily: "CG-Medium",
  },
});

export default MessageActions;
