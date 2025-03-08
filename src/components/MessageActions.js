import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";

const REACTIONS = [
  { emoji: "❤️", name: "heart" },
  { emoji: "👍", name: "thumbs-up" },
  { emoji: "👎", name: "thumbs-down" },
  { emoji: "😂", name: "lol" },
  { emoji: "❓", name: "question" },
  { emoji: "🆗", name:"okay" },
];

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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.container}>
          {/* Reactions */}
          <View style={styles.reactionsContainer}>
            {REACTIONS.map((reaction) => (
              <TouchableOpacity
                key={reaction.name}
                style={styles.reactionButton}
                onPress={() => {
                  onReact(reaction.name);
                  onClose();
                }}
              >
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={onReply}>
              <Feather name="corner-up-left" size={20} color="#FFFFFF" />
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onThreadReply}>
              <Feather name="message-square" size={20} color="#FFFFFF" />
              <Text style={styles.actionText}>Thread Reply</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onCopy}>
              <Feather name="copy" size={20} color="#FFFFFF" />
              <Text style={styles.actionText}>Copy Message</Text>
            </TouchableOpacity>

            {isOwnMessage && onEdit && (
              <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                <Feather name="edit-2" size={20} color="#FFFFFF" />
                <Text style={styles.actionText}>Edit Message</Text>
              </TouchableOpacity>
            )}

            {isOwnMessage && onDelete && (
              <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                <Feather name="trash-2" size={20} color="#FF3B30" />
                <Text style={[styles.actionText, styles.deleteText]}>Delete Message</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: Dimensions.get("window").width * 0.9,
    backgroundColor: "#1C1E22",
    borderRadius: 12,
    overflow: "hidden",
  },
  reactionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
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
    padding: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "sans-serif",
  },
  deleteText: {
    color: "#FF3B30",
  },
});

export default MessageActions;
