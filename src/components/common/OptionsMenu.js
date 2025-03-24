import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ColorPalette from '../../constants/ColorPalette';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Reusable options menu component
 * @param {boolean} visible - Whether the menu is visible or not
 * @param {Array} options - Array of option objects with icon, text, color, onPress properties
 * @param {Object} style - Additional styling for the menu container
 * @param {Function} onBackdropPress - Function to call when the backdrop is pressed
 * @param {boolean} closeOnSelect - Whether to close the menu on option selection
 */
const OptionsMenu = ({ 
  visible, 
  options = [], 
  style = {}, 
  onBackdropPress = () => {}, 
  closeOnSelect = false 
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={onBackdropPress}>
        <View style={styles.modalBackground}>
          <View style={[styles.menuContainer, style]}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={`option-${index}`}
                style={[
                  styles.optionItem,
                  index === options.length - 1 && styles.lastOptionItem,
                  option.disabled && styles.disabledOption
                ]}
                onPress={() => {
                  if (!option.disabled) {
                    option.onPress();
                    if (closeOnSelect) {
                      onBackdropPress();
                    }
                  }
                }}
                disabled={option.disabled}
              >
                {option.icon && (
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={option.disabled ? ColorPalette.grey_text : (option.color || ColorPalette.white)}
                  />
                )}
                <Text
                  style={[
                    styles.optionText,
                    option.color && !option.disabled ? { color: option.color } : null,
                    option.disabled && styles.disabledText,
                    option.textStyle,
                  ]}
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute', // Absolute positioning
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 8,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 120,
    maxWidth: screenWidth * 0.25,
    // No default positioning - leave it to the style prop
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color || '#333',
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionText: {
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    fontSize: 14,
    marginLeft: 8,
  },
  disabledText: {
    color: ColorPalette.grey_text,
  }
});

export default OptionsMenu;
