import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ColorPalette from '../constants/ColorPalette';

export const HEADER_HEIGHT = 56;

const Header = memo(({ 
  title, 
  onCreatePost, 
  showCreateButton=true, 
  animatedStyle,
  rightIcon, // New prop for custom right icon
  onRightPress, // New prop for custom right action
}) => {
  return (
    <Animated.View style={[styles.header, animatedStyle]}>
      <Text style={styles.title}>{title}</Text>
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={styles.createButton}>
          {rightIcon}
        </TouchableOpacity>
      ) : (
        showCreateButton && (
          <TouchableOpacity onPress={onCreatePost} style={styles.createButton}>
            <Ionicons name="add-circle-outline" size={28} color={ColorPalette.white} />
          </TouchableOpacity>
        )
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 30,
    backgroundColor: ColorPalette.main_black,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1000,
  },
  title: {
    fontSize: 24,
    fontFamily: 'CG-Medium',
    color: ColorPalette.white,
  },
  createButton: {
    padding: 4,
  },
  iconBorder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: ColorPalette.white,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Header;
