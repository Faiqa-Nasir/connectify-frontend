import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import React, { useState, useContext } from 'react';
import ColorPallete from '../../constants/ColorPalette';

export default function AccountScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>My Account</Text>
      </View>

   
      {/* Other Options */}
      <TouchableOpacity style={styles.optionItem}>
        <Text style={styles.optionText}>Account Details</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionItem}>
        <Text style={styles.optionText}>Notification Preferences</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionItem}>
        <Text style={styles.optionText}>My Plan</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionItem}>
        <Text style={styles.optionText}>Privacy Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionItem}>
        <Text style={styles.optionText}>Support and Feedback</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    borderWidth: 0,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 0, // No lines between options
  },
  optionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: ColorPallete.text_black,
  },
  arrow: {
    marginLeft: 10,
    fontSize: 16,
    color: ColorPallete.text_black,
  },
  dropdownContent: {
    position: 'absolute', // Position it above other content
    top: 60, // Position it right below the "Professional Information" section
    left: 16,
    right: 16,
    paddingLeft: 16,
    paddingVertical: 8,
    backgroundColor: '#333333',
    borderRadius: 8,
    marginTop: 10,
    zIndex: 999, // Ensures it stays on top of other content
  },
  dropdownText: {
    fontSize: 14,
    color: ColorPallete.pop_up_white,
    marginBottom: 6,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: ColorPallete.main_black_2,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutIcon: {
    marginRight: 12,
  },
  logoutText: {
    fontSize: 18,
    color: ColorPallete.pop_up_white,
  },
});
