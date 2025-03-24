import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ColorPalette from '../../../constants/ColorPalette';

const TaggedUserItem = ({ user, onRemove }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: user.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
        style={styles.avatar}
      />
      <Text style={styles.username}>@{user.username}</Text>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => onRemove(user.id)}
      >
        <Ionicons name="close-circle" size={18} color={ColorPalette.grey_text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPalette.card_bg || '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  username: {
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    fontSize: 14,
    marginRight: 6,
  },
  removeButton: {
    padding: 2,
  },
});

export default memo(TaggedUserItem);
